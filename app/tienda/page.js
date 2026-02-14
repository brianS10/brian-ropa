/**
 * Página: Catálogo de Tienda (Cliente)
 * =====================================
 * Muestra todos los productos disponibles para que el cliente elija
 */

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search, ShoppingBag, Plus, Check, Filter, X, ChevronRight, Sparkles, ChevronLeft } from 'lucide-react'
import { supabase, estaConfigurado } from '@/lib/base_datos/cliente_supabase'
import { usarCarritoCliente } from '@/hooks/usarCarritoCliente'
import { formatearMoneda, cn } from '@/lib/utilidades'

// Categorías disponibles
const CATEGORIAS = [
  { valor: 'todos', etiqueta: 'Todos', emoji: '🛒' },
  { valor: 'mezclilla', etiqueta: 'Mezclilla', emoji: '👖' },
  { valor: 'vestir', etiqueta: 'Vestir', emoji: '👔' },
  { valor: 'cargo', etiqueta: 'Cargo', emoji: '🎒' },
  { valor: 'deportivo', etiqueta: 'Deportivo', emoji: '🏃' },
  { valor: 'casual', etiqueta: 'Casual', emoji: '😎' },
  { valor: 'short', etiqueta: 'Shorts', emoji: '🩳' },
]

export default function PaginaTienda() {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [categoriaActiva, setCategoriaActiva] = useState('todos')
  const [productoSeleccionado, setProductoSeleccionado] = useState(null)
  const [imagenActiva, setImagenActiva] = useState(0)
  const { carrito, agregarProducto, obtenerCantidadItems } = usarCarritoCliente()
  const [agregadoReciente, setAgregadoReciente] = useState(null)

  const cantidadCarrito = obtenerCantidadItems()

  // Obtener imágenes del producto (array o imagen_url individual)
  const obtenerImagenes = (producto) => {
    if (producto.imagenes && producto.imagenes.length > 0) {
      return producto.imagenes
    }
    if (producto.imagen_url) {
      return [producto.imagen_url]
    }
    return []
  }

  // Cargar productos
  useEffect(() => {
    async function cargar() {
      if (!estaConfigurado() || !supabase) {
        setCargando(false)
        return
      }

      const { data } = await supabase
        .from('productos')
        .select(`*, variantes_producto (*)`)
        .eq('estado', true)
        .order('nombre')

      setProductos(data || [])
      setCargando(false)
    }
    cargar()
  }, [])

  // Filtrar productos
  const productosFiltrados = productos.filter(p => {
    const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    const coincideCategoria = categoriaActiva === 'todos' || p.categoria === categoriaActiva
    return coincideBusqueda && coincideCategoria
  })

  // Agregar al carrito
  const handleAgregar = (variante, producto) => {
    agregarProducto({
      variante_id: variante.id,
      producto_id: producto.id,
      nombre_producto: producto.nombre,
      talla: variante.talla,
      color: variante.color,
      precio_venta: variante.precio_venta,
      stock_disponible: variante.stock_actual,
      imagen_url: producto.imagen_url,
    })
    
    setAgregadoReciente(variante.id)
    setTimeout(() => setAgregadoReciente(null), 1000)
  }

  // Obtener precio mínimo de un producto
  const obtenerPrecioMinimo = (variantes) => {
    if (!variantes || variantes.length === 0) return 0
    return Math.min(...variantes.map(v => v.precio_venta))
  }

  // Obtener colores únicos
  const obtenerColores = (variantes) => {
    if (!variantes) return []
    return [...new Set(variantes.map(v => v.color))]
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Header con buscador */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700">
        <div className="p-4">
          {/* Logo y carrito */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-500" />
                Mi Tienda
              </h1>
              <p className="text-xs text-slate-500">Pantalones de calidad</p>
            </div>
            <Link
              href="/tienda/carrito"
              className="relative w-11 h-11 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center"
            >
              <ShoppingBag className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              {cantidadCarrito > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {cantidadCarrito}
                </span>
              )}
            </Link>
          </div>

          {/* Buscador */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="¿Qué estás buscando?"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Categorías */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto no-scrollbar">
          {CATEGORIAS.map(cat => (
            <button
              key={cat.valor}
              onClick={() => setCategoriaActiva(cat.valor)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                categoriaActiva === cat.valor
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              )}
            >
              <span>{cat.emoji}</span>
              <span>{cat.etiqueta}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Contenido */}
      <main className="p-4 pb-28">
        {/* Contador de resultados */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-500">
            {productosFiltrados.length} producto{productosFiltrados.length !== 1 && 's'}
          </p>
        </div>

        {/* Grid de productos */}
        {cargando ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse">
                <div className="bg-slate-200 dark:bg-slate-700 rounded-2xl aspect-square mb-2" />
                <div className="bg-slate-200 dark:bg-slate-700 rounded h-4 w-3/4 mb-1" />
                <div className="bg-slate-200 dark:bg-slate-700 rounded h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              No encontramos productos
            </h3>
            <p className="text-slate-500">
              Intenta con otra búsqueda o categoría
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {productosFiltrados.map(producto => {
              const precioMinimo = obtenerPrecioMinimo(producto.variantes_producto)
              const colores = obtenerColores(producto.variantes_producto)
              const stockTotal = producto.variantes_producto?.reduce((acc, v) => acc + v.stock_actual, 0) || 0

              return (
                <div
                  key={producto.id}
                  onClick={() => setProductoSeleccionado(producto)}
                  className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                >
                  {/* Imagen */}
                  <div className="relative aspect-square bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 overflow-hidden">
                    {producto.imagen_url ? (
                      <img 
                        src={producto.imagen_url} 
                        alt={producto.nombre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-5xl group-hover:scale-110 transition-transform">👖</span>
                      </div>
                    )}
                    
                    {/* Badge de stock bajo */}
                    {stockTotal > 0 && stockTotal <= 5 && (
                      <span className="absolute top-2 left-2 px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded-full">
                        ¡Últimos!
                      </span>
                    )}

                    {/* Colores disponibles */}
                    {colores.length > 1 && (
                      <div className="absolute bottom-2 left-2 flex -space-x-1">
                        {colores.slice(0, 3).map((color, i) => (
                          <div
                            key={i}
                            className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                            style={{ 
                              backgroundColor: 
                                color.toLowerCase().includes('azul') ? '#3B82F6' :
                                color.toLowerCase().includes('negro') ? '#1F2937' :
                                color.toLowerCase().includes('gris') ? '#6B7280' :
                                color.toLowerCase().includes('café') ? '#92400E' :
                                color.toLowerCase().includes('verde') ? '#059669' :
                                color.toLowerCase().includes('beige') ? '#D4A574' :
                                '#94A3B8'
                            }}
                          />
                        ))}
                        {colores.length > 3 && (
                          <span className="w-5 h-5 rounded-full bg-white border-2 border-slate-200 text-[10px] font-bold flex items-center justify-center">
                            +{colores.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase tracking-wide mb-1">
                      {producto.categoria}
                    </p>
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm leading-tight mb-2 line-clamp-2">
                      {producto.nombre}
                    </h3>
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold text-slate-900 dark:text-white">
                        {formatearMoneda(precioMinimo)}
                      </p>
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Modal de producto */}
      {productoSeleccionado && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end md:items-center md:justify-center">
          <div 
            className="absolute inset-0" 
            onClick={() => {
              setProductoSeleccionado(null)
              setImagenActiva(0)
            }} 
          />
          <div className="relative w-full md:w-auto md:min-w-[500px] md:max-w-2xl bg-white dark:bg-slate-800 rounded-t-3xl md:rounded-3xl max-h-[85vh] overflow-auto animate-slide-up md:animate-none md:m-4">
            {/* Galería de imágenes */}
            {(() => {
              const imagenesProducto = obtenerImagenes(productoSeleccionado)
              return (
                <div className="relative h-72 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600">
                  {imagenesProducto.length > 0 ? (
                    <>
                      <img 
                        src={imagenesProducto[imagenActiva]} 
                        alt={productoSeleccionado.nombre}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Flechas de navegación */}
                      {imagenesProducto.length > 1 && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setImagenActiva(prev => prev === 0 ? imagenesProducto.length - 1 : prev - 1)
                            }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-black/50"
                          >
                            <ChevronLeft className="w-6 h-6" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setImagenActiva(prev => prev === imagenesProducto.length - 1 ? 0 : prev + 1)
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-black/50"
                          >
                            <ChevronRight className="w-6 h-6" />
                          </button>
                          
                          {/* Indicadores */}
                          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                            {imagenesProducto.map((_, idx) => (
                              <button
                                key={idx}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setImagenActiva(idx)
                                }}
                                className={`w-2 h-2 rounded-full transition-all ${
                                  idx === imagenActiva 
                                    ? 'bg-white w-4' 
                                    : 'bg-white/50'
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-8xl">👖</span>
                    </div>
                  )}
                  
                  {/* Cerrar */}
                  <button
                    onClick={() => {
                      setProductoSeleccionado(null)
                      setImagenActiva(0)
                    }}
                    className="absolute top-4 right-4 w-10 h-10 bg-black/30 backdrop-blur rounded-full flex items-center justify-center text-white"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              )
            })()}

            {/* Detalles */}
            <div className="p-6">
              <p className="text-blue-600 dark:text-blue-400 font-medium uppercase tracking-wide text-sm mb-1">
                {productoSeleccionado.categoria}
              </p>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                {productoSeleccionado.nombre}
              </h2>
              {productoSeleccionado.descripcion && (
                <p className="text-slate-500 dark:text-slate-400 mb-4">
                  {productoSeleccionado.descripcion}
                </p>
              )}

              {/* Precio */}
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-6">
                {formatearMoneda(obtenerPrecioMinimo(productoSeleccionado.variantes_producto))}
              </p>

              {/* Tallas disponibles */}
              <div className="mb-6">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
                  Selecciona talla y color:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {productoSeleccionado.variantes_producto?.map(variante => {
                    const sinStock = variante.stock_actual <= 0
                    const enCarrito = carrito.some(item => item.variante_id === variante.id)
                    const recienAgregado = agregadoReciente === variante.id
                    const cantidadEnCarrito = carrito.find(i => i.variante_id === variante.id)?.cantidad || 0

                    return (
                      <button
                        key={variante.id}
                        onClick={() => !sinStock && handleAgregar(variante, productoSeleccionado)}
                        disabled={sinStock}
                        className={cn(
                          'relative px-4 py-3 rounded-xl font-medium transition-all border-2',
                          sinStock
                            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                            : recienAgregado
                            ? 'bg-green-500 text-white border-green-500'
                            : enCarrito
                            ? 'bg-blue-50 text-blue-700 border-blue-500 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white border-transparent hover:border-blue-500'
                        )}
                      >
                        {recienAgregado ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <div className="text-center">
                            <span className="block font-bold">{variante.talla}</span>
                            <span className="text-xs opacity-70">{variante.color}</span>
                          </div>
                        )}
                        {enCarrito && !recienAgregado && (
                          <span className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {cantidadEnCarrito}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Información adicional */}
              <div className="bg-slate-100 dark:bg-slate-700/50 rounded-xl p-4 mb-6">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  ✅ Toca una talla para agregarla al carrito<br/>
                  ✅ Puedes agregar varias unidades<br/>
                  ✅ Envío a domicilio disponible
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botón flotante del carrito */}
      {cantidadCarrito > 0 && !productoSeleccionado && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white dark:from-slate-900 dark:via-slate-900 to-transparent">
          <Link
            href="/tienda/carrito"
            className="w-full bg-blue-600 text-white py-4 rounded-2xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-3 hover:bg-blue-700 transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="font-semibold">Ver carrito ({cantidadCarrito})</span>
            <span className="text-blue-200">•</span>
            <span className="font-bold">
              {formatearMoneda(carrito.reduce((acc, item) => acc + (item.precio_venta * item.cantidad), 0))}
            </span>
          </Link>
        </div>
      )}

      {/* Botón flotante de WhatsApp */}
      <a
        href="https://wa.me/5215582258230?text=Hola!%20Me%20interesa%20un%20producto"
        target="_blank"
        rel="noopener noreferrer"
        className={`fixed z-50 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg shadow-green-500/30 flex items-center justify-center transition-all hover:scale-110 ${
          cantidadCarrito > 0 && !productoSeleccionado ? 'bottom-24' : 'bottom-6'
        } right-6`}
      >
        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>

      {/* Estilos para la animación */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
