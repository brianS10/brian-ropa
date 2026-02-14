/**
 * Componente: SkeletonProducto
 * =============================
 * Placeholder animado mientras cargan los productos
 */

export function SkeletonProducto() {
  return (
    <div className="animate-scale-in">
      <div className="skeleton aspect-square rounded-2xl mb-1.5" />
      <div className="space-y-1 px-0.5">
        <div className="skeleton h-3 w-3/4" />
        <div className="skeleton h-4 w-1/2" />
      </div>
    </div>
  )
}

export function SkeletonProductoGrande() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 animate-scale-in">
      <div className="flex gap-3">
        <div className="skeleton w-16 h-16 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-2/3" />
          <div className="skeleton h-3 w-1/3" />
          <div className="skeleton h-5 w-1/4" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonLista({ cantidad = 6, tipo = 'grid' }) {
  if (tipo === 'grid') {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3">
        {Array.from({ length: cantidad }).map((_, i) => (
          <SkeletonProducto key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: cantidad }).map((_, i) => (
        <SkeletonProductoGrande key={i} />
      ))}
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 animate-scale-in">
      <div className="skeleton h-6 w-1/2 mb-3" />
      <div className="space-y-2">
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-4 w-1/2" />
      </div>
    </div>
  )
}
