/**
 * Layout de la Tienda (Cliente)
 * ==============================
 * Vista pública para que los clientes vean productos y hagan pedidos
 */

export default function LayoutTienda({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {children}
    </div>
  )
}
