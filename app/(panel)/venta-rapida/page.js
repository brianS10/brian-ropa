/**
 * Página: Venta Rápida y Gestión de Stock
 * ========================================
 * - Vender productos con un toque
 * - Ajustar stock rápidamente (+/-)
 * - Ver ventas del día
 * - 100% responsivo para móvil
 */

'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { 
  Search, Minus, Plus, Check, X, ShoppingBag, 
  Package, RefreshCw, Edit3, Save
} from 'lucide-react'
import { supabase, estaConfigurado } from '@/lib/base_datos/cliente_supabase'
import { formatearMoneda, cn } from '@/lib/utilidades'
import Confeti from '@/componentes/Confeti'
import { SkeletonProductoGrande } from '@/componentes/Skeletons'

const TIPOS_FILTRO = [
  { valor: 'todos', etiqueta: 'Todo', emoji: '🛒' },
  { valor: 'ropa', etiqueta: 'Ropa', emoji: '👖' },
  { valor: 'perfumes', etiqueta: 'Perfumes', emoji: '🧴' },
  { valor: 'juguetes', etiqueta: 'Juguetes', emoji: '🧸' },
]

// Obtener etiqueta según tipo de producto
const obtenerEtiquetaTipo = (tipoProducto) => {
  switch (tipoProducto) {
    case 'perfumes': return 'Tamaño'
    case 'juguetes': return 'Opción'
    default: return 'Talla'
  }
}

// Etiqueta plural
const obtenerEtiquetaPlural = (tipoProducto) => {
  switch (tipoProducto) {
    case 'perfumes': return 'tamaños'
    case 'juguetes': return 'opciones'
    default: return 'tallas'
  }
}

export default function PaginaVentaRapida() {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [tipoFiltro, setTipoFiltro] = useState('todos')
  const [modoEdicion, setModoEdicion] = useState(false)
  const [varianteSeleccionada, setVarianteSeleccionada] = useState(null)
  const [cantidadVenta, setCantidadVenta] = useState(1)
  const [procesando, setProcesando] = useState(false)
  const [ventaExitosa, setVentaExitosa] = useState(false)
  const [mostrarConfeti, setMostrarConfeti] = useState(false)
  const [ventasHoy, setVentasHoy] = useState({ cantidad: 0, total: 0 })
  const [stockEditando, setStockEditando] = useState({})
  const [guardandoStock, setGuardandoStock] = useState(null)

  // Cargar productos (TODOS, incluso sin stock)
  const cargarProductos = useCallback(async () => {
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
  }, [])

  // Cargar ventas del día
  const cargarVentasHoy = useCallback(async () => {
    if (!estaConfigurado() || !supabase) return

    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    const { data } = await supabase
      .from('ventas')
      .select('total_venta')
      .gte('fecha_venta', hoy.toISOString())

    if (data) {
      setVentasHoy({
        cantidad: data.length,
        total: data.reduce((acc, v) => acc + (v.total_venta || 0), 0)
      })
    }
  }, [])

  useEffect(() => {
    cargarProductos()
    cargarVentasHoy()
  }, [cargarProductos, cargarVentasHoy])

  // Filtrar productos
  const productosFiltrados = productos.filter(p => {
    const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    const coincideTipo = tipoFiltro === 'todos' || (p.tipo_producto || 'ropa') === tipoFiltro
    return coincideBusqueda && coincideTipo
  })

  // Ajustar stock de una variante
  const ajustarStock = async (varianteId, nuevoStock) => {
    if (nuevoStock < 0) return
    
    setGuardandoStock(varianteId)
    
    try {
      const { error } = await supabase
        .from('variantes_producto')
        .update({ stock_actual: nuevoStock })
        .eq('id', varianteId)

      if (error) throw error
      
      // Actualizar estado local
      setProductos(prev => prev.map(p => ({
        ...p,
        variantes_producto: p.variantes_producto?.map(v => 
          v.id === varianteId ? { ...v, stock_actual: nuevoStock } : v
        )
      })))
      
      setStockEditando(prev => ({ ...prev, [varianteId]: undefined }))
    } catch (error) {
      alert('Error: ' + error.message)
    } finally {
      setGuardandoStock(null)
    }
  }

  // Registrar venta rápida
  const registrarVenta = async () => {
    if (!varianteSeleccionada || cantidadVenta <= 0) return
    
    setProcesando(true)
    
    try {
      const nuevoStock = varianteSeleccionada.stock_actual - cantidadVenta
      
      // Actualizar stock
      const { error: errorStock } = await supabase
        .from('variantes_producto')
        .update({ stock_actual: nuevoStock })
        .eq('id', varianteSeleccionada.id)

      if (errorStock) throw errorStock

      // Registrar la venta
      const { data: venta, error: errorVenta } = await supabase
        .from('ventas')
        .insert({
          total_venta: varianteSeleccionada.precio_venta * cantidadVenta,
          metodo_pago: 'efectivo'
        })
        .select()
        .single()

      if (errorVenta) throw errorVenta

      // Registrar detalle
      await supabase
        .from('detalle_venta')
        .insert({
          venta_id: venta.id,
          variante_id: varianteSeleccionada.id,
          cantidad: cantidadVenta,
          precio_unitario: varianteSeleccionada.precio_venta,
          subtotal: varianteSeleccionada.precio_venta * cantidadVenta
        })

      setVentaExitosa(true)
      setMostrarConfeti(true)
      setTimeout(() => {
        setVentaExitosa(false)
        setMostrarConfeti(false)
        setVarianteSeleccionada(null)
        setCantidadVenta(1)
        cargarProductos()
        cargarVentasHoy()
      }, 1500)

    } catch (error) {
      alert('Error: ' + error.message)
    } finally {
      setProcesando(false)
    }
  }

  // Seleccionar para vender
  const seleccionarParaVender = (variante, producto) => {
    if (variante.stock_actual <= 0) return
    setVarianteSeleccionada({
      ...variante,
      nombreProducto: producto.nombre,
      imagen: producto.imagen_url || producto.imagenes?.[0]
    })
    setCantidadVenta(1)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Confeti de celebración */}
      <Confeti activo={mostrarConfeti} />

      {/* Header fijo */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="p-3">
          {/* Fila 1: Título y ventas */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                  Venta Rápida
                </h1>
                <p className="text-[10px] text-slate-500">Toca para vender</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Ventas de hoy - compacto */}
              <div className="bg-green-50 dark:bg-green-900/30 px-3 py-1.5 rounded-xl text-right flex-shrink-0">
                <p className="text-base font-black text-green-600 leading-tight">
                  {formatearMoneda(ventasHoy.total)}
                </p>
                <p className="text-[10px] text-green-600/70">{ventasHoy.cantidad} ventas hoy</p>
              </div>
            </div>
          </div>

          {/* Fila 2: Buscador y botones */}
          <div className="flex gap-2">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-100 dark:bg-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            {/* Botón modo edición */}
            <button
              onClick={() => setModoEdicion(!modoEdicion)}
              className={cn(
                'px-3 rounded-xl flex items-center gap-1.5 text-sm font-medium transition-colors flex-shrink-0',
                modoEdicion 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
              )}
            >
              <Edit3 className="w-4 h-4" />
              <span className="hidden sm:inline">Stock</span>
            </button>
            
            <button
              onClick={() => { setCargando(true); cargarProductos(); cargarVentasHoy() }}
              className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center flex-shrink-0"
            >
              <RefreshCw className={cn("w-4 h-4 text-slate-500", cargando && "animate-spin")} />
            </button>
          </div>
          
          {/* Filtros de tipo */}
          <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
            {TIPOS_FILTRO.map(tipo => (
              <button
                key={tipo.valor}
                onClick={() => setTipoFiltro(tipo.valor)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all',
                  tipoFiltro === tipo.valor
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                )}
              >
                <span>{tipo.emoji}</span>
                <span>{tipo.etiqueta}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Lista de productos */}
      <main className="p-3 pb-24 space-y-3">
        {cargando ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <SkeletonProductoGrande key={i} />
            ))}
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500">No hay productos</p>
            <Link href="/inventario/agregar" className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-medium">
              <Plus className="w-4 h-4" /> Agregar
            </Link>
          </div>
        ) : (
          productosFiltrados.map(producto => {
            const variantes = producto.variantes_producto || []
            const stockTotal = variantes.reduce((acc, v) => acc + v.stock_actual, 0)
            
            return (
              <div
                key={producto.id}
                className={cn(
                  "bg-white dark:bg-slate-800 rounded-2xl border overflow-hidden",
                  stockTotal === 0 
                    ? "border-slate-200 dark:border-slate-700 opacity-60" 
                    : "border-slate-200 dark:border-slate-700"
                )}
              >
                {/* Cabecera del producto */}
                <div className="p-3 flex items-center gap-3">
                  {producto.imagen_url || producto.imagenes?.[0] ? (
                    <img 
                      src={producto.imagen_url || producto.imagenes?.[0]} 
                      alt={producto.nombre}
                      className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xl flex-shrink-0">
                      👖
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                      {producto.nombre}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {variantes.length} {obtenerEtiquetaPlural(producto.tipo_producto)} · {stockTotal} en stock
                    </p>
                    {stockTotal === 0 && (
                      <span className="text-xs text-red-500 font-medium">⚠ Agotado</span>
                    )}
                  </div>
                </div>

                {/* Variantes - Grid responsivo */}
                <div className="px-3 pb-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {variantes.map(variante => {
                      const agotado = variante.stock_actual <= 0
                      const editandoEsta = stockEditando[variante.id] !== undefined
                      const stockActual = editandoEsta ? stockEditando[variante.id] : variante.stock_actual
                      
                      return modoEdicion ? (
                        // Modo edición de stock
                        <div
                          key={variante.id}
                          className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-2 border border-slate-200 dark:border-slate-600"
                        >
                          <div className="text-center mb-2">
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{variante.talla}</p>
                            <p className="text-[10px] text-slate-500 truncate">{variante.color}</p>
                          </div>
                          
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => {
                                const nuevo = Math.max(0, stockActual - 1)
                                setStockEditando(prev => ({ ...prev, [variante.id]: nuevo }))
                              }}
                              className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            
                            <input
                              type="number"
                              value={stockActual}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0
                                setStockEditando(prev => ({ ...prev, [variante.id]: Math.max(0, val) }))
                              }}
                              className="w-10 h-8 text-center font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800 rounded-lg border-0 focus:outline-none text-sm"
                            />
                            
                            <button
                              onClick={() => {
                                setStockEditando(prev => ({ ...prev, [variante.id]: stockActual + 1 }))
                              }}
                              className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          
                          {editandoEsta && stockActual !== variante.stock_actual && (
                            <button
                              onClick={() => ajustarStock(variante.id, stockActual)}
                              disabled={guardandoStock === variante.id}
                              className="w-full mt-2 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-medium flex items-center justify-center gap-1"
                            >
                              {guardandoStock === variante.id ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <><Save className="w-3 h-3" /> Guardar</>
                              )}
                            </button>
                          )}
                        </div>
                      ) : (
                        // Modo venta
                        <button
                          key={variante.id}
                          onClick={() => !agotado && seleccionarParaVender(variante, producto)}
                          disabled={agotado}
                          className={cn(
                            "rounded-xl p-2.5 border-2 transition-all text-left",
                            agotado 
                              ? "border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 opacity-50 cursor-not-allowed" 
                              : "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 hover:border-green-400 hover:bg-green-100 active:scale-95"
                          )}
                        >
                          <div className="flex justify-between items-start gap-1">
                            <div className="min-w-0">
                              <p className={cn(
                                "text-sm font-bold truncate",
                                agotado ? "text-slate-400" : "text-slate-900 dark:text-white"
                              )}>
                                {variante.talla}
                              </p>
                              <p className="text-[10px] text-slate-500 truncate">{variante.color}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className={cn(
                                "text-xs font-bold",
                                agotado ? "text-slate-400" : "text-green-600"
                              )}>
                                {formatearMoneda(variante.precio_venta)}
                              </p>
                              <p className={cn(
                                "text-[10px]",
                                agotado ? "text-red-400" : "text-slate-400"
                              )}>
                                {agotado ? 'Sin stock' : `${variante.stock_actual}`}
                              </p>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </main>

      {/* Modal de venta */}
      {varianteSeleccionada && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center sm:justify-center p-0 sm:p-4">
          <div className="absolute inset-0" onClick={() => !procesando && setVarianteSeleccionada(null)} />
          <div className="relative w-full sm:max-w-sm bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-3xl p-5 animate-slide-up">
            {ventaExitosa ? (
              <div className="py-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">¡Vendido!</h3>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Confirmar Venta</h3>
                  <button
                    onClick={() => setVarianteSeleccionada(null)}
                    className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center"
                  >
                    <X className="w-4 h-4 text-slate-500" />
                  </button>
                </div>

                {/* Producto */}
                <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  {varianteSeleccionada.imagen ? (
                    <img src={varianteSeleccionada.imagen} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-xl flex-shrink-0">👖</div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">{varianteSeleccionada.nombreProducto}</h4>
                    <p className="text-xs text-slate-500">{varianteSeleccionada.talla} · {varianteSeleccionada.color}</p>
                    <p className="text-sm font-bold text-green-600">{formatearMoneda(varianteSeleccionada.precio_venta)}</p>
                  </div>
                </div>

                {/* Cantidad */}
                <div className="mb-4">
                  <p className="text-xs text-slate-500 mb-2 text-center">Cantidad</p>
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => setCantidadVenta(c => Math.max(1, c - 1))}
                      className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center active:scale-95"
                    >
                      <Minus className="w-5 h-5 text-slate-600" />
                    </button>
                    <span className="text-3xl font-black text-slate-900 dark:text-white w-16 text-center">
                      {cantidadVenta}
                    </span>
                    <button
                      onClick={() => setCantidadVenta(c => Math.min(varianteSeleccionada.stock_actual, c + 1))}
                      className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center active:scale-95"
                    >
                      <Plus className="w-5 h-5 text-slate-600" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 text-center mt-1">
                    Disponibles: {varianteSeleccionada.stock_actual}
                  </p>
                </div>

                {/* Total */}
                <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-center">
                  <span className="text-xs text-slate-500">Total</span>
                  <p className="text-2xl font-black text-green-600">
                    {formatearMoneda(varianteSeleccionada.precio_venta * cantidadVenta)}
                  </p>
                </div>

                {/* Botón confirmar */}
                <button
                  onClick={registrarVenta}
                  disabled={procesando}
                  className="w-full py-3.5 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white rounded-xl font-bold flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  {procesando ? (
                    <><RefreshCw className="w-5 h-5 animate-spin" /> Procesando...</>
                  ) : (
                    <><Check className="w-5 h-5" /> Confirmar Venta</>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Estilos */}
      <style jsx global>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.25s ease-out; }
      `}</style>
    </div>
  )
}
