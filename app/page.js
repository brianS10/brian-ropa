import Link from "next/link";
import { Store, Package, TrendingUp, ShoppingBag, Lock } from "lucide-react";

/**
 * Página de Inicio - Landing principal del sistema
 * Muestra accesos directos a las funciones principales
 */
export default function PaginaInicio() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Logo y Título */}
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Store className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Mi Tienda de Ropa
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Pantalones de calidad
        </p>
      </div>

      {/* Sección: Soy Cliente */}
      <div className="w-full max-w-sm mb-8">
        <p className="text-xs uppercase tracking-wide text-slate-500 mb-3 font-medium">
          Quiero comprar
        </p>
        <Link 
          href="/tienda" 
          className="flex items-center gap-4 p-5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
            <ShoppingBag className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-white text-lg">Ver Catálogo</h2>
            <p className="text-sm text-white/80">Explora nuestros productos</p>
          </div>
        </Link>
      </div>

      {/* Sección: Soy Vendedor/Admin */}
      <div className="w-full max-w-sm">
        <p className="text-xs uppercase tracking-wide text-slate-500 mb-3 font-medium">
          Administrador
        </p>
        
        <Link 
          href="/admin" 
          className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-colors"
        >
          <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
            <Lock className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">Panel de Control</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Acceso con PIN</p>
          </div>
        </Link>
      </div>

      {/* Versión */}
      <p className="mt-10 text-xs text-slate-400">v1.0.0 - Brian app de ropita 😗</p>
    </main>
  );
}
