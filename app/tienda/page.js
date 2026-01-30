/**
 * Página: Catálogo de Tienda (Cliente)
 * =====================================
 * Muestra todos los productos disponibles para que el cliente elija
 */

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search, ShoppingBag, Plus, Check } from 'lucide-react'
import { supabase, estaConfigurado } from '@/lib/base_datos/cliente_supabase'
import { usarCarritoCliente } from '@/hooks/usarCarritoCliente'
import { formatearMoneda, obtenerEstadoStock, cn } from '@/lib/utilidades'
import EntradaTexto from '@/componentes/ui/EntradaTexto'

export default function PaginaTienda() {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const { carrito, agregarProducto, obtenerCantidadItems } = usarCarritoCliente()
  const [agregadoReciente, setAgregadoReciente] = useState(null)

  const cantidadCarrito = obtenerCantidadItems()

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
  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

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
    
    // Mostrar feedback
    setAgregadoReciente(variante.id)
    setTimeout(() => setAgregadoReciente(null), 1000)
  }

  return (
    <div className="p-4 pb-24">
      {/* Bienvenida */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
          Bienvenido 👋
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Explora nuestra colección de pantalones
        </p>
      </div>

      {/* Buscador */}
      <div className="mb-6">
        <EntradaTexto
          placeholder="Buscar productos..."
          icono={Search}
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* Grid de productos */}
      {cargando ? (
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="animate-pulse">
              <div className="bg-slate-200 dark:bg-slate-700 rounded-xl h-40 mb-2" />
              <div className="bg-slate-200 dark:bg-slate-700 rounded h-4 w-3/4" />
            </div>
          ))}
        </div>
      ) : productosFiltrados.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500">No hay productos disponibles</p>
        </div>
      ) : (
        <div className="space-y-6">
          {productosFiltrados.map(producto => (
            <div 
              key={producto.id}
              className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700"
            >
              {/* Imagen del producto */}
              <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
                {producto.imagen_url ? (
                  <img 
                    src={producto.imagen_url} 
                    alt={producto.nombre}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-6xl">👖</span>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">
                  {producto.nombre}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                  {producto.categoria}
                </p>

                {/* Precio */}
                {producto.variantes_producto?.[0] && (
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                    {formatearMoneda(producto.variantes_producto[0].precio_venta)}
                  </p>
                )}

                {/* Selector de tallas */}
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Selecciona tu talla:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {producto.variantes_producto?.map(variante => {
                      const sinStock = variante.stock_actual <= 0
                      const enCarrito = carrito.some(
                        item => item.variante_id === variante.id
                      )
                      const recienAgregado = agregadoReciente === variante.id

                      return (
                        <button
                          key={variante.id}
                          onClick={() => !sinStock && handleAgregar(variante, producto)}
                          disabled={sinStock}
                          className={cn(
                            'relative px-4 py-2 rounded-lg font-medium transition-all',
                            sinStock
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : recienAgregado
                              ? 'bg-green-500 text-white'
                              : enCarrito
                              ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-blue-500 hover:text-white'
                          )}
                        >
                          {recienAgregado ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <>
                              <span>{variante.talla}</span>
                              {enCarrito && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                                  {carrito.find(i => i.variante_id === variante.id)?.cantidad}
                                </span>
                              )}
                            </>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Botón flotante del carrito */}
      {cantidadCarrito > 0 && (
        <Link
          href="/tienda/carrito"
          className="fixed bottom-6 right-6 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="font-medium">Ver carrito ({cantidadCarrito})</span>
        </Link>
      )}
    </div>
  )
}
