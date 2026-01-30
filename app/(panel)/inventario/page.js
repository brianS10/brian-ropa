/**
 * Página: Inventario
 * ===================
 * Visualización del stock por producto y tallas.
 * Permite ver qué hay disponible de cada modelo.
 */

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Package, Search, AlertTriangle, Plus, Edit, Trash2 } from 'lucide-react'
import { usarInventario } from '@/hooks/usarInventario'
import { formatearMoneda, obtenerEstadoStock, cn } from '@/lib/utilidades'
import { supabase, estaConfigurado } from '@/lib/base_datos/cliente_supabase'
import EntradaTexto from '@/componentes/ui/EntradaTexto'
import BotonPrimario from '@/componentes/ui/BotonPrimario'

export default function PaginaInventario() {
  const { productos, cargando, obtenerProductos, buscarProductos } = usarInventario()
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    obtenerProductos()
  }, [obtenerProductos])

  // Buscar mientras escribe
  useEffect(() => {
    const temporizador = setTimeout(() => {
      if (busqueda) {
        buscarProductos(busqueda)
      } else {
        obtenerProductos()
      }
    }, 300)

    return () => clearTimeout(temporizador)
  }, [busqueda, buscarProductos, obtenerProductos])

  // Eliminar producto
  const eliminarProducto = async (productoId, nombreProducto) => {
    if (!confirm(`¿Eliminar "${nombreProducto}" y todas sus variantes?`)) return
    
    if (!estaConfigurado() || !supabase) return

    try {
      const { error } = await supabase
        .from('productos')
        .delete()
        .eq('id', productoId)

      if (error) throw error
      
      obtenerProductos() // Recargar lista
    } catch (error) {
      alert('Error al eliminar: ' + error.message)
    }
  }

  // Calcular estadísticas
  const estadisticas = {
    totalProductos: productos.length,
    totalVariantes: productos.reduce(
      (acc, p) => acc + (p.variantes_producto?.length || 0), 
      0
    ),
    stockBajo: productos.reduce((acc, p) => {
      const variantes = p.variantes_producto || []
      return acc + variantes.filter(v => 
        obtenerEstadoStock(v.stock_actual, v.stock_minimo) === 'bajo'
      ).length
    }, 0),
    agotados: productos.reduce((acc, p) => {
      const variantes = p.variantes_producto || []
      return acc + variantes.filter(v => v.stock_actual <= 0).length
    }, 0),
  }

  return (
    <div className="p-4 pb-24">
      {/* Encabezado */}
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Inventario
        </h1>
        <Link href="/inventario/agregar">
          <BotonPrimario icono={Plus} tamanio="sm">
            Agregar
          </BotonPrimario>
        </Link>
      </header>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-500">Productos</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white">
            {estadisticas.totalProductos}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-500">Variantes</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white">
            {estadisticas.totalVariantes}
          </p>
        </div>
      </div>

      {/* Alertas de stock */}
      {(estadisticas.stockBajo > 0 || estadisticas.agotados > 0) && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <span className="text-sm text-yellow-700 dark:text-yellow-400">
            {estadisticas.agotados > 0 && `${estadisticas.agotados} agotados`}
            {estadisticas.agotados > 0 && estadisticas.stockBajo > 0 && ' · '}
            {estadisticas.stockBajo > 0 && `${estadisticas.stockBajo} con stock bajo`}
          </span>
        </div>
      )}

      {/* Buscador */}
      <div className="mb-4">
        <EntradaTexto
          placeholder="Buscar producto..."
          icono={Search}
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* Lista de productos */}
      {cargando ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          ))}
        </div>
      ) : productos.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No hay productos registrados</p>
          <p className="text-sm mt-1 mb-4">
            Crea tu primer producto para empezar
          </p>
          <Link href="/inventario/agregar">
            <BotonPrimario icono={Plus}>
              Agregar Producto
            </BotonPrimario>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {productos.map((producto) => (
            <div
              key={producto.id}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4"
            >
              {/* Info del producto */}
              <div className="flex items-start gap-3 mb-3">
                {producto.imagen_url ? (
                  <img 
                    src={producto.imagen_url} 
                    alt={producto.nombre}
                    className="w-14 h-14 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-2xl">
                    👖
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {producto.nombre}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {producto.categoria} · {producto.variantes_producto?.length || 0} variantes
                  </p>
                </div>
                {/* Botones de acción */}
                <div className="flex items-center gap-1">
                  <Link
                    href={`/inventario/${producto.id}`}
                    className="p-2 text-slate-400 hover:text-blue-500 transition-colors"
                    title="Editar stock"
                  >
                    <Edit className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => eliminarProducto(producto.id, producto.nombre)}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    title="Eliminar producto"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Tabla de variantes */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-700">
                      <th className="text-left py-2 text-slate-500 font-medium">Talla</th>
                      <th className="text-left py-2 text-slate-500 font-medium">Color</th>
                      <th className="text-right py-2 text-slate-500 font-medium">Stock</th>
                      <th className="text-right py-2 text-slate-500 font-medium">Precio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {producto.variantes_producto?.map((variante) => {
                      const estado = obtenerEstadoStock(variante.stock_actual, variante.stock_minimo)
                      const colorEstado = {
                        disponible: 'text-green-600',
                        bajo: 'text-yellow-600',
                        agotado: 'text-red-500',
                      }
                      
                      return (
                        <tr 
                          key={variante.id}
                          className="border-b border-slate-50 dark:border-slate-700/50 last:border-0"
                        >
                          <td className="py-2 font-medium text-slate-900 dark:text-white">
                            {variante.talla}
                          </td>
                          <td className="py-2 text-slate-600 dark:text-slate-400">
                            {variante.color || '-'}
                          </td>
                          <td className={cn('py-2 text-right font-medium', colorEstado[estado])}>
                            {variante.stock_actual}
                          </td>
                          <td className="py-2 text-right text-slate-900 dark:text-white">
                            {formatearMoneda(variante.precio_venta)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
