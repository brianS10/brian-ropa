/**
 * Componente: SubirImagen
 * ========================
 * Permite subir imágenes a Supabase Storage para la galería de productos
 */

'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { supabase, estaConfigurado } from '@/lib/base_datos/cliente_supabase'
import { cn } from '@/lib/utilidades'

export default function SubirImagen({ 
  imagenes = [], 
  onImagenesChange, 
  maxImagenes = 5,
  productoId = null 
}) {
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  // Subir imagen a Supabase Storage
  const subirImagen = async (archivo) => {
    if (!estaConfigurado() || !supabase) {
      setError('Supabase no está configurado')
      return null
    }

    const extension = archivo.name.split('.').pop()
    const nombreArchivo = `${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`
    const ruta = `productos/${nombreArchivo}`

    const { data, error: errorSubida } = await supabase.storage
      .from('imagenes')
      .upload(ruta, archivo, {
        cacheControl: '3600',
        upsert: false
      })

    if (errorSubida) {
      console.error('Error al subir:', errorSubida)
      throw errorSubida
    }

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('imagenes')
      .getPublicUrl(ruta)

    return publicUrl
  }

  // Manejar selección de archivos
  const handleSeleccion = async (e) => {
    const archivos = Array.from(e.target.files)
    if (archivos.length === 0) return

    // Validar cantidad máxima
    if (imagenes.length + archivos.length > maxImagenes) {
      setError(`Máximo ${maxImagenes} imágenes`)
      return
    }

    setSubiendo(true)
    setError('')

    try {
      const nuevasUrls = []

      for (const archivo of archivos) {
        // Validar tipo de archivo
        if (!archivo.type.startsWith('image/')) {
          continue
        }

        // Validar tamaño (máximo 5MB)
        if (archivo.size > 5 * 1024 * 1024) {
          setError('Las imágenes deben ser menores a 5MB')
          continue
        }

        const url = await subirImagen(archivo)
        if (url) {
          nuevasUrls.push(url)
        }
      }

      onImagenesChange([...imagenes, ...nuevasUrls])
    } catch (err) {
      setError('Error al subir imagen: ' + err.message)
    } finally {
      setSubiendo(false)
      // Limpiar input
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }

  // Eliminar imagen
  const eliminarImagen = async (indice) => {
    const nuevasImagenes = imagenes.filter((_, i) => i !== indice)
    onImagenesChange(nuevasImagenes)
  }

  // Mover imagen (para reordenar)
  const moverImagen = (indice, direccion) => {
    const nuevasImagenes = [...imagenes]
    const nuevoIndice = indice + direccion

    if (nuevoIndice < 0 || nuevoIndice >= imagenes.length) return

    [nuevasImagenes[indice], nuevasImagenes[nuevoIndice]] = 
      [nuevasImagenes[nuevoIndice], nuevasImagenes[indice]]

    onImagenesChange(nuevasImagenes)
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        Fotos del producto ({imagenes.length}/{maxImagenes})
      </label>

      {/* Grid de imágenes */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        {/* Imágenes existentes */}
        {imagenes.map((url, indice) => (
          <div 
            key={indice}
            className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 group"
          >
            <img 
              src={url} 
              alt={`Foto ${indice + 1}`}
              className="w-full h-full object-cover"
            />
            
            {/* Badge de imagen principal */}
            {indice === 0 && (
              <span className="absolute top-1 left-1 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                Principal
              </span>
            )}

            {/* Controles */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
              {indice > 0 && (
                <button
                  type="button"
                  onClick={() => moverImagen(indice, -1)}
                  className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/40"
                >
                  ←
                </button>
              )}
              <button
                type="button"
                onClick={() => eliminarImagen(indice)}
                className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
              {indice < imagenes.length - 1 && (
                <button
                  type="button"
                  onClick={() => moverImagen(indice, 1)}
                  className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/40"
                >
                  →
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Botón para agregar */}
        {imagenes.length < maxImagenes && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={subiendo}
            className={cn(
              'aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-colors',
              subiendo 
                ? 'border-blue-300 bg-blue-50 cursor-wait'
                : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50 dark:border-slate-600 dark:hover:border-blue-500'
            )}
          >
            {subiendo ? (
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            ) : (
              <>
                <Upload className="w-6 h-6 text-slate-400" />
                <span className="text-xs text-slate-500">Agregar</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Input oculto */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleSeleccion}
        className="hidden"
      />

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Ayuda */}
      <p className="text-xs text-slate-500">
        La primera imagen será la principal. Formatos: JPG, PNG. Máximo 5MB.
      </p>
    </div>
  )
}
