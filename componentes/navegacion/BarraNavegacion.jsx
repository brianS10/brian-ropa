/**
 * Componente: BarraNavegacion
 * ============================
 * Barra de navegación inferior estilo app móvil.
 * Se muestra fija en la parte inferior de la pantalla.
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, ShoppingCart, Package, ClipboardList, LogOut } from 'lucide-react'
import { cn } from '@/lib/utilidades'
import { usarCarrito } from '@/hooks/usarCarrito'
import { usarPedidos } from '@/hooks/usarPedidos'
import { usarAutenticacion } from '@/hooks/usarAutenticacion'

const enlaces = [
  { href: '/tablero', icono: Home, etiqueta: 'Inicio' },
  { href: '/ventas/nueva', icono: ShoppingCart, etiqueta: 'Vender' },
  { href: '/inventario', icono: Package, etiqueta: 'Stock' },
  { href: '/pedidos', icono: ClipboardList, etiqueta: 'Pedidos', conBadgePedidos: true },
]

export default function BarraNavegacion() {
  const router = useRouter()
  const rutaActual = usePathname()
  const cantidadItems = usarCarrito((state) => state.carrito.length)
  const { obtenerPedidosPendientes } = usarPedidos()
  const { cerrarSesion } = usarAutenticacion()
  const [pedidosPendientes, setPedidosPendientes] = useState(0)

  // Cargar cantidad de pedidos pendientes
  useEffect(() => {
    const cargar = async () => {
      const resultado = await obtenerPedidosPendientes()
      if (resultado.exito) {
        setPedidosPendientes(resultado.cantidad)
      }
    }
    cargar()
    // Actualizar cada 30 segundos
    const intervalo = setInterval(cargar, 30000)
    return () => clearInterval(intervalo)
  }, [])

  // Manejar cierre de sesión
  const manejarCerrarSesion = () => {
    cerrarSesion()
    router.push('/')
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 safe-bottom z-50">
      <div className="flex items-center justify-around h-16">
        {enlaces.map(({ href, icono: Icono, etiqueta, conBadgePedidos }) => {
          const estaActivo = rutaActual.startsWith(href)
          const mostrarBadgeCarrito = href === '/ventas/nueva' && cantidadItems > 0
          const mostrarBadgePedidos = conBadgePedidos && pedidosPendientes > 0

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center w-16 h-full transition-colors relative',
                estaActivo 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              )}
            >
              <div className="relative">
                <Icono className="w-6 h-6" />
                {mostrarBadgeCarrito && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {cantidadItems}
                  </span>
                )}
                {mostrarBadgePedidos && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                    {pedidosPendientes}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1">{etiqueta}</span>
              {estaActivo && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-600 rounded-b-full" />
              )}
            </Link>
          )
        })}
        
        {/* Botón cerrar sesión */}
        <button
          onClick={manejarCerrarSesion}
          className="flex flex-col items-center justify-center w-16 h-full transition-colors text-slate-400 hover:text-red-500"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-xs mt-1">Salir</span>
        </button>
      </div>
    </nav>
  )
}
