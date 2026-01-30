/**
 * Componente: SelectorMetodoPago
 * ===============================
 * Permite seleccionar el método de pago para la venta.
 */

'use client'

import { Banknote, Smartphone, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utilidades'
import { usarCarrito } from '@/hooks/usarCarrito'
import { METODOS_PAGO } from '@/lib/constantes'

const iconos = {
  Banknote,
  Smartphone,
  CreditCard,
}

export default function SelectorMetodoPago() {
  const { metodoPago, cambiarMetodoPago } = usarCarrito()

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
        Método de pago
      </label>
      <div className="grid grid-cols-3 gap-2">
        {METODOS_PAGO.map((metodo) => {
          const Icono = iconos[metodo.icono]
          const seleccionado = metodoPago === metodo.id

          return (
            <button
              key={metodo.id}
              onClick={() => cambiarMetodoPago(metodo.id)}
              className={cn(
                'flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all',
                seleccionado
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-600 dark:text-slate-400'
              )}
            >
              <Icono className="w-5 h-5" />
              <span className="text-xs font-medium">{metodo.nombre}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
