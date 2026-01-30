/**
 * Página: Tablero Principal
 * ==========================
 * Dashboard con resumen del día: ventas, dinero, estadísticas rápidas.
 */

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DollarSign, ShoppingBag, Plus, Package, ShoppingCart, RefreshCw } from 'lucide-react'
import { usarVentas } from '@/hooks/usarVentas'
import { formatearMoneda } from '@/lib/utilidades'

export default function PaginaTablero() {
  const { calcularCorteCaja } = usarVentas()
  const [resumen, setResumen] = useState(null)
  const [cargando, setCargando] = useState(true)

  const cargarDatos = async () => {
    setCargando(true)
    const datos = await calcularCorteCaja()
    setResumen(datos)
    setCargando(false)
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  // Fecha actual formateada
  const fechaHoy = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="p-4 pb-24">
      {/* Encabezado */}
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Tablero
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">
            {fechaHoy}
          </p>
        </div>
        <button
          onClick={cargarDatos}
          className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors"
          title="Actualizar"
        >
          <RefreshCw className={`w-5 h-5 ${cargando ? 'animate-spin' : ''}`} />
        </button>
      </header>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Link
          href="/ventas/nueva"
          className="flex flex-col items-center gap-2 p-4 bg-blue-600 rounded-xl text-white hover:bg-blue-700 transition-colors"
        >
          <ShoppingCart className="w-6 h-6" />
          <span className="text-xs font-medium">Nueva Venta</span>
        </Link>
        <Link
          href="/inventario/agregar"
          className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-colors"
        >
          <Plus className="w-6 h-6 text-green-600" />
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Agregar</span>
        </Link>
        <Link
          href="/inventario/reabastecer"
          className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-colors"
        >
          <Package className="w-6 h-6 text-orange-500" />
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Reabastecer</span>
        </Link>
      </div>

      {/* Tarjetas de estadísticas */}
      {cargando ? (
        <div className="grid gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {/* Total del día */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-5 text-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-blue-100 text-sm">Ventas del Día</p>
                <p className="text-3xl font-bold">
                  {formatearMoneda(resumen?.totalGeneral || 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Cantidad de ventas */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Ventas Realizadas
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {resumen?.cantidadVentas || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Desglose por método de pago */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
              Por Método de Pago
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">💵 Efectivo</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatearMoneda(resumen?.porMetodo?.efectivo || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">📱 Transferencia</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatearMoneda(resumen?.porMetodo?.transferencia || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">💳 Tarjeta</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatearMoneda(resumen?.porMetodo?.tarjeta || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
