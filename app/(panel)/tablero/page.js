/**
 * Página: Tablero Principal
 * ==========================
 * Dashboard con resumen del día: ventas, dinero, estadísticas rápidas.
 * Optimizado para el flujo de trabajo en el puesto
 */

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DollarSign, ShoppingBag, Plus, Package, Zap, RefreshCw, Share2, ExternalLink, Eye } from 'lucide-react'
import { usarVentas } from '@/hooks/usarVentas'
import { formatearMoneda } from '@/lib/utilidades'

export default function PaginaTablero() {
  const { calcularCorteCaja } = usarVentas()
  const [resumen, setResumen] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [linkCopiado, setLinkCopiado] = useState(false)

  const cargarDatos = async () => {
    setCargando(true)
    const datos = await calcularCorteCaja()
    setResumen(datos)
    setCargando(false)
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  // Compartir catálogo
  const compartirCatalogo = async () => {
    const url = window.location.origin + '/catalogo'
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mi Catálogo de Pantalones 👖',
          text: '¡Mira los pantalones disponibles!',
          url: url
        })
      } catch (err) {
        // Usuario canceló
      }
    } else {
      navigator.clipboard.writeText(url)
      setLinkCopiado(true)
      setTimeout(() => setLinkCopiado(false), 2000)
    }
  }

  // Fecha actual formateada
  const fechaHoy = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })

  return (
    <div className="p-4 pb-24">
      {/* Encabezado */}
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            ¡Hola! 👋
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

      {/* Banner de catálogo - Lo más importante */}
      <div className="mb-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-5 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-20 text-[100px] leading-none">
          👖
        </div>
        <h2 className="font-bold text-lg mb-2">Tu Catálogo</h2>
        <p className="text-white/80 text-sm mb-4">
          Comparte este link con tus clientes para que vean tus productos
        </p>
        <div className="flex gap-2">
          <button
            onClick={compartirCatalogo}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-colors"
          >
            <Share2 className="w-5 h-5" />
            {linkCopiado ? '¡Link copiado!' : 'Compartir'}
          </button>
          <Link
            href="/catalogo"
            target="_blank"
            className="flex items-center justify-center w-12 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
          >
            <Eye className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Link
          href="/venta-rapida"
          className="flex flex-col items-center gap-2 p-4 bg-green-500 rounded-xl text-white hover:bg-green-600 transition-colors shadow-lg shadow-green-500/30"
        >
          <Zap className="w-6 h-6" />
          <span className="text-xs font-bold">Venta Rápida</span>
        </Link>
        <Link
          href="/inventario/agregar"
          className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-colors"
        >
          <Plus className="w-6 h-6 text-blue-600" />
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Agregar</span>
        </Link>
        <Link
          href="/inventario"
          className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-colors"
        >
          <Package className="w-6 h-6 text-orange-500" />
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Editar Stock</span>
        </Link>
      </div>

      {/* Tarjetas de estadísticas */}
      {cargando ? (
        <div className="grid gap-4 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {/* Total del día */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-7 h-7" />
              </div>
              <div>
                <p className="text-green-100 text-sm">Ventas de Hoy</p>
                <p className="text-3xl font-black">
                  {formatearMoneda(resumen?.totalGeneral || 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Cantidad de ventas */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Productos Vendidos
                </p>
                <p className="text-3xl font-black text-slate-900 dark:text-white">
                  {resumen?.cantidadVentas || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Desglose por método de pago */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">
              Por Método de Pago
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">💵 Efectivo</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatearMoneda(resumen?.porMetodo?.efectivo || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">📱 Transferencia</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatearMoneda(resumen?.porMetodo?.transferencia || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">💳 Tarjeta</span>
                <span className="font-bold text-slate-900 dark:text-white">
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
