import Link from "next/link";
import { Store, ShoppingBag } from "lucide-react";

/**
 * Página de Inicio - Redirige al catálogo
 * El admin está oculto para los clientes
 */
export default function PaginaInicio() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Logo y Título */}
      <div className="text-center mb-10">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/30">
          <span className="text-5xl">👖</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
          Pantalones de Calidad
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Los mejores precios del mercado
        </p>
      </div>

      {/* Botón principal - Ver Catálogo */}
      <div className="w-full max-w-sm">
        <Link 
          href="/catalogo" 
          className="flex items-center justify-center gap-3 w-full p-5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:scale-[1.02] transition-all"
        >
          <ShoppingBag className="w-7 h-7 text-white" />
          <span className="font-bold text-white text-xl">Ver Catálogo</span>
        </Link>
        
        <p className="text-center text-sm text-slate-400 mt-4">
          ¡Explora nuestros productos! 🛒
        </p>
      </div>

      {/* WhatsApp flotante */}
      <a
        href="https://wa.me/5215582258230?text=¡Hola!%20Quiero%20información%20sobre%20los%20pantalones"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-16 h-16 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-xl shadow-green-500/40 flex items-center justify-center transition-all hover:scale-110"
      >
        <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>

      {/* Acceso oculto al admin - solo para el dueño */}
      {/* Tocar 5 veces el logo para ir al admin */}
      <Link 
        href="/admin" 
        className="fixed bottom-6 left-6 w-10 h-10 rounded-full opacity-0"
        aria-label="Admin"
      />

      {/* Versión */}
      <p className="fixed bottom-2 left-1/2 -translate-x-1/2 text-xs text-slate-300">
        v1.0.0
      </p>
    </main>
  );
}
