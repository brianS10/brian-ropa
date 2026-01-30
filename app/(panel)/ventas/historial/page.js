/**
 * Página: Historial de Ventas
 * ============================
 * Lista de ventas del día con detalles.
 */

'use client'

import { useEffect, useState } from 'react'
import { Clock, ChevronRight } from 'lucide-react'
import { usarVentas } from '@/hooks/usarVentas'
import { formatearMoneda, tiempoRelativo } from '@/lib/utilidades'

export default function PaginaHistorial() {
  const { obtenerVentasDelDia } = usarVentas()
  const [ventas, setVentas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [ventaExpandida, setVentaExpandida] = useState(null)

  useEffect(() => {
    async function cargar() {
      const datos = await obtenerVentasDelDia()
      setVentas(datos)
      setCargando(false)
    }
    cargar()
  }, [obtenerVentasDelDia])

  const etiquetaMetodo = {
    efectivo: '💵 Efectivo',
    transferencia: '📱 Transferencia',
    tarjeta: '💳 Tarjeta',
  }

  return (
    <div className="p-4">
      {/* Encabezado */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Historial de Hoy
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {ventas.length} ventas registradas
        </p>
      </header>

      {/* Lista de ventas */}
      {cargando ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          ))}
        </div>
      ) : ventas.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No hay ventas registradas hoy</p>
          <p className="text-sm mt-1">Las ventas aparecerán aquí</p>
        </div>
      ) : (
        <div className="space-y-3">
          {ventas.map((venta) => (
            <div
              key={venta.id}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              {/* Cabecera de la venta */}
              <button
                onClick={() => setVentaExpandida(
                  ventaExpandida === venta.id ? null : venta.id
                )}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
              >
                <div className="text-left">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {formatearMoneda(venta.total_venta)}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {etiquetaMetodo[venta.metodo_pago]} · {tiempoRelativo(venta.fecha_venta)}
                  </p>
                </div>
                <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${
                  ventaExpandida === venta.id ? 'rotate-90' : ''
                }`} />
              </button>

              {/* Detalles expandibles */}
              {ventaExpandida === venta.id && (
                <div className="px-4 pb-4 border-t border-slate-100 dark:border-slate-700">
                  <p className="text-xs text-slate-500 dark:text-slate-400 py-2">
                    Productos vendidos:
                  </p>
                  <ul className="space-y-2">
                    {venta.detalle_venta?.map((detalle) => (
                      <li 
                        key={detalle.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-slate-700 dark:text-slate-300">
                          {detalle.variantes_producto?.productos?.nombre || 'Producto'} 
                          <span className="text-slate-500 ml-1">
                            (T:{detalle.variantes_producto?.talla})
                          </span>
                          <span className="text-slate-400 ml-2">
                            x{detalle.cantidad}
                          </span>
                        </span>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {formatearMoneda(detalle.subtotal)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
