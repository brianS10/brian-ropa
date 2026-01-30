/**
 * Componente: BotonPrimario
 * ==========================
 * Botón reutilizable con variantes de estilo.
 * Soporta estados: normal, cargando, deshabilitado.
 */

import { cn } from '@/lib/utilidades'

const variantes = {
  primario: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
  secundario: 'bg-slate-200 text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-white',
  exito: 'bg-green-600 text-white hover:bg-green-700',
  peligro: 'bg-red-600 text-white hover:bg-red-700',
  fantasma: 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800',
}

const tamanios = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
}

export default function BotonPrimario({
  children,
  variante = 'primario',
  tamanio = 'md',
  cargando = false,
  deshabilitado = false,
  icono: Icono,
  className,
  ...props
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
        variantes[variante],
        tamanios[tamanio],
        className
      )}
      disabled={deshabilitado || cargando}
      {...props}
    >
      {cargando ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : Icono ? (
        <Icono className="w-5 h-5" />
      ) : null}
      {children}
    </button>
  )
}
