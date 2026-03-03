/**
 * Página: Editar Producto
 * ========================
 * Permite modificar el stock, imágenes, precios y detalles de un producto
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save, Plus, Minus, Image as ImageIcon, Trash2, Edit3 } from 'lucide-react'
import Link from 'next/link'
import { supabase, estaConfigurado } from '@/lib/base_datos/cliente_supabase'
import BotonPrimario from '@/componentes/ui/BotonPrimario'
import SubirImagen from '@/componentes/SubirImagen'
import { formatearMoneda } from '@/lib/utilidades'
import { TIPOS_PRODUCTO, CATEGORIAS_POR_TIPO, TALLAS_ESTANDAR, COLORES_ROPA, TAMANOS_PERFUMES, EDADES_JUGUETES } from '@/lib/constantes'

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
  const [pestana, setPestana] = useState('info') // 'info' | 'stock' | 'imagenes'
  const [productoModificado, setProductoModificado] = useState(false)

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

  // Actualizar precio de variante
  const actualizarPrecioVariante = (varianteId, campo, valor) => {
    setVariantes(variantes.map(v => {
      if (v.id === varianteId) {
        return { ...v, [campo]: parseFloat(valor) || 0, modificado: true }
      }
      return v
    }))
  }

  // Actualizar info del producto
  const actualizarProducto = (campo, valor) => {
    setProducto({ ...producto, [campo]: valor })
    setProductoModificado(true)
  }

  // Guardar cambios
  const guardarCambios = async () => {
    if (!estaConfigurado() || !supabase) return

    setGuardando(true)
    setMensaje({ tipo: '', texto: '' })

    try {
      // Actualizar variantes (stock y precios)
      const variantesModificadas = variantes.filter(v => v.modificado)

      for (const variante of variantesModificadas) {
        const { error } = await supabase
          .from('variantes_producto')
          .update({
            stock_actual: variante.stock_actual,
            precio_venta: variante.precio_venta,
            precio_costo: variante.precio_costo
          })
          .eq('id', variante.id)

        if (error) throw error
      }

      // Actualizar producto (nombre, categoría, descripción, imágenes, descuento)
      const { error: errorProducto } = await supabase
        .from('productos')
        .update({
          nombre: producto.nombre,
          descripcion: producto.descripcion,
          categoria: producto.categoria,
          tipo_producto: producto.tipo_producto,
          descuento: producto.descuento || null,
          imagenes: imagenes,
          imagen_url: imagenes[0] || null
        })
        .eq('id', productoId)

      if (errorProducto) throw errorProducto

      setMensaje({ tipo: 'exito', texto: '¡Cambios guardados!' })
      setProductoModificado(false)

      // Limpiar bandera de modificado
      setVariantes(variantes.map(v => ({ ...v, modificado: false })))

    } catch (error) {
      setMensaje({ tipo: 'error', texto: error.message })
    } finally {
      setGuardando(false)
    }
  }

  const hayModificaciones = variantes.some(v => v.modificado) || productoModificado

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
      <div className="flex gap-1 mb-4 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
        <button
          onClick={() => setPestana('info')}
          className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-colors ${pestana === 'info'
              ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm'
              : 'text-slate-600 dark:text-slate-400'
            }`}
        >
          ✏️ Info
        </button>
        <button
          onClick={() => setPestana('stock')}
          className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-colors ${pestana === 'stock'
              ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm'
              : 'text-slate-600 dark:text-slate-400'
            }`}
        >
          📦 Stock
        </button>
        <button
          onClick={() => setPestana('imagenes')}
          className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-colors ${pestana === 'imagenes'
              ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm'
              : 'text-slate-600 dark:text-slate-400'
            }`}
        >
          📷 Fotos
        </button>
      </div>

      {/* Mensaje */}
      {mensaje.texto && (
        <div className={`mb-4 p-3 rounded-lg ${mensaje.tipo === 'error'
            ? 'bg-red-100 text-red-700'
            : 'bg-green-100 text-green-700'
          }`}>
          {mensaje.texto}
        </div>
      )}

      {/* Contenido de Info (Editar detalles) */}
      {pestana === 'info' && producto && (
        <div className="space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Nombre del producto
            </label>
            <input
              type="text"
              value={producto.nombre || ''}
              onChange={(e) => actualizarProducto('nombre', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              placeholder="Ej: Playera básica"
            />
          </div>

          {/* Tipo de producto */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Tipo de producto
            </label>
            <select
              value={producto.tipo_producto || 'ropa'}
              onChange={(e) => {
                const nuevoTipo = e.target.value
                actualizarProducto('tipo_producto', nuevoTipo)
                const categorias = CATEGORIAS_POR_TIPO[nuevoTipo] || CATEGORIAS_POR_TIPO.ropa
                const primeraCategoria = categorias.find(c => c.valor !== 'todos')?.valor || 'General'
                actualizarProducto('categoria', primeraCategoria)
              }}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            >
              {TIPOS_PRODUCTO.map((tipo) => (
                <option key={tipo.valor} value={tipo.valor}>{tipo.etiqueta}</option>
              ))}
            </select>
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Categoría
            </label>
            <select
              value={producto.categoria || ''}
              onChange={(e) => actualizarProducto('categoria', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            >
              {(CATEGORIAS_POR_TIPO[producto.tipo_producto || 'ropa'] || CATEGORIAS_POR_TIPO.ropa)
                .filter(cat => cat.valor !== 'todos')
                .map((cat) => (
                  <option key={cat.valor} value={cat.valor}>{cat.etiqueta}</option>
                ))}
            </select>
          </div>

          {/* Descuento */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <label className="block text-sm font-medium text-red-700 dark:text-red-400 mb-2">
              🏷️ Descuento / Promoción
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                max="99"
                value={producto.descuento || ''}
                onChange={(e) => {
                  const valor = Math.min(99, Math.max(0, parseInt(e.target.value) || 0))
                  actualizarProducto('descuento', valor || null)
                }}
                className="w-24 px-4 py-3 rounded-xl border border-red-300 dark:border-red-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-center text-xl font-bold"
                placeholder="0"
              />
              <span className="text-2xl font-bold text-red-600">%</span>
              <div className="flex-1 text-sm text-red-600 dark:text-red-400">
                {producto.descuento > 0 ? (
                  <span className="font-medium">✨ Se mostrará en el catálogo como OFERTA</span>
                ) : (
                  <span className="text-slate-500">Sin descuento activo</span>
                )}
              </div>
            </div>
            {producto.descuento > 0 && (
              <button
                onClick={() => actualizarProducto('descuento', null)}
                className="mt-3 w-full py-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
              >
                ❌ Quitar descuento
              </button>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Descripción (opcional)
            </label>
            <textarea
              value={producto.descripcion || ''}
              onChange={(e) => actualizarProducto('descripcion', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white resize-none"
              placeholder="Descripción del producto..."
            />
          </div>

          {/* Precios por variante */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Precios por variante
            </label>
            <div className="space-y-3">
              {variantes.map((variante) => (
                <div
                  key={variante.id}
                  className={`bg-white dark:bg-slate-800 rounded-xl border p-3 ${variante.modificado
                      ? 'border-blue-500'
                      : 'border-slate-200 dark:border-slate-700'
                    }`}
                >
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {variante.talla}{variante.color && variante.color !== 'Sin especificar' ? ` · ${variante.color}` : ''}
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-xs text-slate-500 mb-1 block">Precio venta</label>
                      <input
                        type="number"
                        value={variante.precio_venta || ''}
                        onChange={(e) => actualizarPrecioVariante(variante.id, 'precio_venta', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        placeholder="$0.00"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-slate-500 mb-1 block">Precio costo</label>
                      <input
                        type="number"
                        value={variante.precio_costo || ''}
                        onChange={(e) => actualizarPrecioVariante(variante.id, 'precio_costo', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        placeholder="$0.00"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Botón guardar */}
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

      {/* Contenido de Imágenes */}
      {pestana === 'imagenes' && (
        <div className="space-y-4">
          <SubirImagen
            imagenes={imagenes}
            onImagenesChange={(nuevas) => {
              setImagenes(nuevas)
              setProductoModificado(true)
            }}
            maxImagenes={10}
            productoId={productoId}
          />

          {hayModificaciones && (
            <BotonPrimario
              onClick={guardarCambios}
              cargando={guardando}
              icono={Save}
              className="w-full"
              tamanio="lg"
            >
              Guardar Fotos
            </BotonPrimario>
          )}
        </div>
      )}

      {/* Contenido de Stock */}
      {pestana === 'stock' && (
        <div className="space-y-3">
          {variantes.map((variante) => (
            <div
              key={variante.id}
              className={`bg-white dark:bg-slate-800 rounded-xl border p-4 ${variante.modificado
                  ? 'border-blue-500'
                  : 'border-slate-200 dark:border-slate-700'
                }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {variante.talla}
                  </span>
                  {variante.color && variante.color !== 'Sin especificar' && (
                    <span className="text-slate-500 ml-2">· {variante.color}</span>
                  )}
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
