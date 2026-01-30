/**
 * Layout de la Tienda (Cliente)
 * ==============================
 * Vista pública para que los clientes vean productos y hagan pedidos
 */

import Link from 'next/link'

export default function LayoutTienda({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header de la tienda */}
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Link href="/tienda" className="flex items-center gap-2">
            <span className="text-2xl">👖</span>
            <span className="font-bold text-slate-900 dark:text-white">Tienda</span>
          </Link>
        </div>
      </header>

      {/* Contenido */}
      <main className="max-w-lg mx-auto">
        {children}
      </main>
    </div>
  )
}
