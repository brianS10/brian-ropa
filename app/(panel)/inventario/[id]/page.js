/**
 * Página: Editar Producto
 * ========================
 * Permite modificar el stock, imágenes y detalles de un producto
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save, Plus, Minus, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'
import { supabase, estaConfigurado } from '@/lib/base_datos/cliente_supabase'
import BotonPrimario from '@/componentes/ui/BotonPrimario'
import SubirImagen from '@/componentes/SubirImagen'
import { formatearMoneda } from '@/lib/utilidades'

export default function PaginaEditarStock() {
  const router = useRouter()
  const params = useParams()
  const productoId = params.id

  const [producto, setProducto] = useState(null)
  const [variantes, setVariantes] = useState([])
  const [imagenes, setImagenes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' })
  const [pestana, setPestana] = useState('stock') // 'stock' | 'imagenes'

  // Cargar producto y variantes
  useEffect(() => {
    async function cargar() {
      if (!estaConfigurado() || !supabase) {
        setMensaje({ tipo: 'error', texto: 'Supabase no configurado' })
        setCargando(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('productos')
          .select(`*, variantes_producto (*)`)
          .eq('id', productoId)
          .single()

        if (error) throw error

        setProducto(data)
        setVariantes(data.variantes_producto || [])
        setImagenes(data.imagenes || (data.imagen_url ? [data.imagen_url] : []))
      } catch (error) {
        setMensaje({ tipo: 'error', texto: error.message })
      } finally {
        setCargando(false)
      }
    }

    if (productoId) cargar()
  }, [productoId])

  // Modificar stock
  const modificarStock = (varianteId, cambio) => {
    setVariantes(variantes.map(v => {
      if (v.id === varianteId) {
        const nuevoStock = Math.max(0, v.stock_actual + cambio)
        return { ...v, stock_actual: nuevoStock, modificado: true }
      }
      return v
    }))
  }

  // Establecer stock directo
  const establecerStock = (varianteId, valor) => {
    const nuevoStock = Math.max(0, parseInt(valor) || 0)
    setVariantes(variantes.map(v => {
      if (v.id === varianteId) {
        return { ...v, stock_actual: nuevoStock, modificado: true }
      }
      return v
    }))
  }

  // Guardar cambios
  const guardarCambios = async () => {
    if (!estaConfigurado() || !supabase) return

    setGuardando(true)
    setMensaje({ tipo: '', texto: '' })

    try {
      // Actualizar variantes de stock
      const variantesModificadas = variantes.filter(v => v.modificado)

      for (const variante of variantesModificadas) {
        const { error } = await supabase
          .from('variantes_producto')
          .update({ stock_actual: variante.stock_actual })
          .eq('id', variante.id)

        if (error) throw error
      }

      // Actualizar imágenes del producto
      const { error: errorProducto } = await supabase
        .from('productos')
        .update({ 
          imagenes: imagenes,
          imagen_url: imagenes[0] || null
        })
        .eq('id', productoId)

      if (errorProducto) throw errorProducto

      setMensaje({ tipo: 'exito', texto: '¡Cambios guardados!' })
      
      // Limpiar bandera de modificado
      setVariantes(variantes.map(v => ({ ...v, modificado: false })))

    } catch (error) {
      setMensaje({ tipo: 'error', texto: error.message })
    } finally {
      setGuardando(false)
    }
  }

  const hayModificaciones = variantes.some(v => v.modificado)

  if (cargando) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/2"></div>
          <div className="h-32 bg-slate-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 pb-24">
      {/* Encabezado */}
      <header className="flex items-center gap-3 mb-4">
        <Link 
          href="/inventario"
          className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Editar Producto
          </h1>
          <p className="text-sm text-slate-500">{producto?.nombre}</p>
        </div>
      </header>

      {/* Pestañas */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setPestana('stock')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            pestana === 'stock'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
          }`}
        >
          📦 Stock
        </button>
        <button
          onClick={() => setPestana('imagenes')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            pestana === 'imagenes'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
          }`}
        >
          📷 Fotos ({imagenes.length})
        </button>
      </div>

      {/* Mensaje */}
      {mensaje.texto && (
        <div className={`mb-4 p-3 rounded-lg ${
          mensaje.tipo === 'error' 
            ? 'bg-red-100 text-red-700'
            : 'bg-green-100 text-green-700'
        }`}>
          {mensaje.texto}
        </div>
      )}

      {/* Contenido de Imágenes */}
      {pestana === 'imagenes' && (
        <div className="space-y-4">
          <SubirImagen
            imagenes={imagenes}
            onImagenesChange={setImagenes}
            maxImagenes={5}
            productoId={productoId}
          />
          
          <BotonPrimario
            onClick={guardarCambios}
            cargando={guardando}
            icono={Save}
            className="w-full"
            tamanio="lg"
          >
            Guardar Fotos
          </BotonPrimario>
        </div>
      )}

      {/* Contenido de Stock */}
      {pestana === 'stock' && (
        <div className="space-y-3">
          {variantes.map((variante) => (
            <div 
              key={variante.id}
              className={`bg-white dark:bg-slate-800 rounded-xl border p-4 ${
                variante.modificado 
                  ? 'border-blue-500' 
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    Talla {variante.talla}
                  </span>
                  <span className="text-slate-500 ml-2">· {variante.color}</span>
                </div>
                <span className="text-sm text-slate-500">
                  {formatearMoneda(variante.precio_venta)}
                </span>
              </div>

              {/* Control de stock */}
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => modificarStock(variante.id, -1)}
                  className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-colors"
                >
                  <Minus className="w-6 h-6" />
                </button>
                
                <input
                  type="number"
                  value={variante.stock_actual}
                  onChange={(e) => establecerStock(variante.id, e.target.value)}
                  className="w-20 h-12 text-center text-2xl font-bold rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                />
                
                <button
                  onClick={() => modificarStock(variante.id, 1)}
                  className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200 transition-colors"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>
            </div>
          ))}

          {/* Botón Guardar */}
          {hayModificaciones && (
            <div className="fixed bottom-20 left-0 right-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
              <BotonPrimario
                onClick={guardarCambios}
                cargando={guardando}
                icono={Save}
                className="w-full"
                tamanio="lg"
              >
                Guardar Cambios
              </BotonPrimario>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
