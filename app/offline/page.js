/**
 * Página Offline
 * Se muestra cuando no hay conexión a internet
 */

'use client'

export default function PaginaOffline() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="text-8xl mb-6">📡</div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
          Sin conexión
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          Parece que no tienes internet. Revisa tu conexión e intenta de nuevo.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors"
        >
          Reintentar
        </button>
      </div>
    </div>
  )
}
