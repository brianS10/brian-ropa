/**
 * Componente: EntradaTexto
 * =========================
 * Input reutilizable con soporte para iconos y etiquetas.
 */

import { cn } from '@/lib/utilidades'

export default function EntradaTexto({
  etiqueta,
  error,
  icono: Icono,
  className,
  ...props
}) {
  return (
    <div className="w-full">
      {etiqueta && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          {etiqueta}
        </label>
      )}
      <div className="relative">
        {Icono && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Icono className="w-5 h-5" />
          </div>
        )}
        <input
          className={cn(
            'w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors',
            Icono && 'pl-10',
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}
