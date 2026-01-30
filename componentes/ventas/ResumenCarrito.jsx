/**
 * Componente: ResumenCarrito
 * ===========================
 * Muestra los items del carrito y el total.
 * Permite modificar cantidades y eliminar productos.
 */

'use client'

import { Minus, Plus, Trash2 } from 'lucide-react'
import { usarCarrito } from '@/hooks/usarCarrito'
import { formatearMoneda } from '@/lib/utilidades'
import BotonPrimario from '@/componentes/ui/BotonPrimario'

export default function ResumenCarrito({ onProcesarVenta, procesando }) {
  const { 
    carrito, 
    agregarProducto, 
    quitarProducto, 
    eliminarProducto,
    obtenerTotal 
  } = usarCarrito()

  const total = obtenerTotal()

  if (carrito.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <p>El carrito está vacío</p>
        <p className="text-sm mt-1">Selecciona productos para vender</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Lista de items */}
      <div className="space-y-3 max-h-60 overflow-y-auto">
        {carrito.map((item) => (
          <div 
            key={item.variante_id}
            className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 dark:text-white truncate">
                {item.nombre_producto}
              </p>
              <p className="text-sm text-slate-500">
                Talla: {item.talla} | {formatearMoneda(item.precio_venta)}
              </p>
            </div>

            {/* Controles de cantidad */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => quitarProducto(item.variante_id)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-medium">
                {item.cantidad}
              </span>
              <button
                onClick={() => agregarProducto(item)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => eliminarProducto(item.variante_id)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-red-500 hover:bg-red-100 transition-colors ml-2"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Total y botón de venta */}
      <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-medium text-slate-700 dark:text-slate-300">
            Total:
          </span>
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {formatearMoneda(total)}
          </span>
        </div>
        <BotonPrimario
          onClick={() => onProcesarVenta?.(total)}
          cargando={procesando}
          className="w-full"
          tamanio="lg"
        >
          Completar Venta
        </BotonPrimario>
      </div>
    </div>
  )
}
