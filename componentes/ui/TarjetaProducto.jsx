/**
 * Componente: TarjetaProducto
 * ============================
 * Muestra un producto con sus variantes disponibles.
 * Incluye chips de tallas con indicador de stock.
 */

import { cn, formatearMoneda, obtenerEstadoStock } from '@/lib/utilidades'

export default function TarjetaProducto({ 
  producto, 
  variantes = [],
  onSeleccionarVariante 
}) {
  // Agrupar variantes por talla
  const variantesPorTalla = variantes.reduce((acc, variante) => {
    if (!acc[variante.talla]) {
      acc[variante.talla] = []
    }
    acc[variante.talla].push(variante)
    return acc
  }, {})

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
      {/* Cabecera del producto */}
      <div className="flex items-start gap-3 mb-3">
        {producto.imagen_url ? (
          <img 
            src={producto.imagen_url} 
            alt={producto.nombre}
            className="w-16 h-16 rounded-lg object-cover bg-slate-100"
          />
        ) : (
          <div className="w-16 h-16 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400">
            <span className="text-2xl">👖</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 dark:text-white truncate">
            {producto.nombre}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {producto.categoria}
          </p>
        </div>
      </div>

      {/* Chips de Tallas */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(variantesPorTalla).map(([talla, variantesTalla]) => {
          const variante = variantesTalla[0] // Por ahora tomamos la primera (un color por talla)
          const estadoStock = obtenerEstadoStock(variante.stock_actual, variante.stock_minimo)
          
          const estilosEstado = {
            disponible: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200',
            bajo: 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200',
            agotado: 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed',
          }

          return (
            <button
              key={variante.id}
              onClick={() => estadoStock !== 'agotado' && onSeleccionarVariante?.(variante)}
              disabled={estadoStock === 'agotado'}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors',
                estilosEstado[estadoStock]
              )}
            >
              <span>{talla}</span>
              {estadoStock !== 'agotado' && (
                <span className="ml-1 text-xs opacity-70">
                  ({variante.stock_actual})
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Precio */}
      {variantes[0] && (
        <p className="mt-3 text-lg font-bold text-blue-600 dark:text-blue-400">
          {formatearMoneda(variantes[0].precio_venta)}
        </p>
      )}
    </div>
  )
}
