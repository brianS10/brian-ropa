/**
 * Página: Catálogo Público
 * =========================
 * Esta es la página que tu hermano comparte con sus clientes
 * URL: tudominio.com/catalogo
 * 
 * ✅ Solo muestra productos
 * ✅ Sin enlaces a admin
 * ✅ Diseño bonito para móvil
 * ✅ WhatsApp para hacer pedidos
 * ✅ Múltiples tipos: Ropa, Perfumes, Juguetes
 */

'use client'

import { useEffect, useState } from 'react'
import { Search, X, MessageCircle, Share2 } from 'lucide-react'
import { supabase, estaConfigurado } from '@/lib/base_datos/cliente_supabase'
import { formatearMoneda, cn } from '@/lib/utilidades'
import ToggleTema from '@/componentes/ToggleTema'
import { SkeletonLista } from '@/componentes/Skeletons'

// Número de WhatsApp del vendedor
const WHATSAPP_VENDEDOR = '5215582258230'
const NOMBRE_TIENDA = 'Tu Tienda'

// Tipos de productos principales
const TIPOS_PRODUCTO = [
  { valor: 'todos', etiqueta: 'Todo', emoji: '🛒', color: 'from-purple-500 to-blue-500' },
  { valor: 'ropa', etiqueta: 'Ropa', emoji: '👖', color: 'from-blue-500 to-cyan-500' },
  { valor: 'perfumes', etiqueta: 'Perfumes', emoji: '🧴', color: 'from-pink-500 to-rose-500' },
  { valor: 'juguetes', etiqueta: 'Juguetes', emoji: '🧸', color: 'from-yellow-500 to-orange-500' },
]

// Categorías por tipo
const CATEGORIAS_POR_TIPO = {
  todos: [
    { valor: 'todos', etiqueta: 'Todos', emoji: '✨' },
  ],
  ropa: [
    { valor: 'todos', etiqueta: 'Toda', emoji: '✨' },
    { valor: 'mezclilla', etiqueta: 'Mezclilla', emoji: '👖' },
    { valor: 'vestir', etiqueta: 'Vestir', emoji: '👔' },
    { valor: 'cargo', etiqueta: 'Cargo', emoji: '🎒' },
    { valor: 'deportivo', etiqueta: 'Deportivo', emoji: '🏃' },
    { valor: 'casual', etiqueta: 'Casual', emoji: '😎' },
    { valor: 'short', etiqueta: 'Shorts', emoji: '🩳' },
    { valor: 'camisa', etiqueta: 'Camisas', emoji: '👕' },
  ],
  perfumes: [
    { valor: 'todos', etiqueta: 'Todos', emoji: '✨' },
    { valor: 'hombre', etiqueta: 'Hombre', emoji: '🧔' },
    { valor: 'mujer', etiqueta: 'Mujer', emoji: '👩' },
    { valor: 'unisex', etiqueta: 'Unisex', emoji: '🌈' },
  ],
  juguetes: [
    { valor: 'todos', etiqueta: 'Todos', emoji: '✨' },
    { valor: 'ninos', etiqueta: 'Niños', emoji: '👦' },
    { valor: 'ninas', etiqueta: 'Niñas', emoji: '👧' },
    { valor: 'bebes', etiqueta: 'Bebés', emoji: '👶' },
    { valor: 'educativo', etiqueta: 'Educativo', emoji: '📚' },
  ],
}

export default function PaginaCatalogo() {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [tipoActivo, setTipoActivo] = useState('todos')
  const [categoriaActiva, setCategoriaActiva] = useState('todos')
  const [productoSeleccionado, setProductoSeleccionado] = useState(null)
  const [tallaSeleccionada, setTallaSeleccionada] = useState(null)
  const [galeriaAbierta, setGaleriaAbierta] = useState(false)
  const [imagenGaleriaActiva, setImagenGaleriaActiva] = useState(0)

  // Obtener categorías según el tipo seleccionado
  const categoriasDisponibles = CATEGORIAS_POR_TIPO[tipoActivo] || CATEGORIAS_POR_TIPO.todos

  // Obtener imágenes del producto
  const obtenerImagenes = (producto) => {
    if (producto.imagenes && producto.imagenes.length > 0) {
      return producto.imagenes
    }
    if (producto.imagen_url) {
      return [producto.imagen_url]
    }
    return []
  }

  // Cargar productos
  useEffect(() => {
    async function cargar() {
      if (!estaConfigurado() || !supabase) {
        setCargando(false)
        return
      }

      const { data } = await supabase
        .from('productos')
        .select(`*, variantes_producto (*)`)
        .eq('estado', true) // Solo productos activos (no eliminados)
        .order('nombre')

      // Mostrar TODOS los productos (incluso sin stock, pero en gris)
      // Solo se ocultan los que tienen estado=false (eliminados)
      setProductos(data || [])
      setCargando(false)
    }
    cargar()
  }, [])

  // Cambiar tipo resetea categoría
  const cambiarTipo = (nuevoTipo) => {
    setTipoActivo(nuevoTipo)
    setCategoriaActiva('todos')
  }

  // Filtrar productos por tipo y categoría
  const productosFiltrados = productos.filter(p => {
    const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    
    // Filtro por tipo de producto
    let coincideTipo = true
    if (tipoActivo !== 'todos') {
      coincideTipo = p.tipo_producto === tipoActivo
    }
    
    // Filtro por categoría
    const coincideCategoria = categoriaActiva === 'todos' || p.categoria === categoriaActiva
    
    return coincideBusqueda && coincideTipo && coincideCategoria
  })

  // Obtener precio mínimo
  const obtenerPrecioMinimo = (variantes) => {
    if (!variantes || variantes.length === 0) return 0
    const variantesConStock = variantes.filter(v => v.stock_actual > 0)
    if (variantesConStock.length === 0) return Math.min(...variantes.map(v => v.precio_venta))
    return Math.min(...variantesConStock.map(v => v.precio_venta))
  }

  // Obtener tallas disponibles
  const obtenerTallasDisponibles = (variantes) => {
    if (!variantes) return []
    return variantes.filter(v => v.stock_actual > 0)
  }

  // Enviar mensaje por WhatsApp
  const pedirPorWhatsApp = (producto, variante = null) => {
    const precioBase = variante?.precio_venta || obtenerPrecioMinimo(producto.variantes_producto)
    const descuento = producto.descuento || 0
    const precioFinal = descuento > 0 ? precioBase * (1 - descuento / 100) : precioBase
    const esRopa = (producto.tipo_producto || 'ropa') === 'ropa'
    
    let mensaje = `¡Hola! 👋\n\nMe interesa este producto:\n\n`
    mensaje += `📦 *${producto.nombre}*\n`
    if (variante) {
      if (esRopa) {
        mensaje += `📏 Talla: ${variante.talla}\n`
        if (variante.color && variante.color !== 'Sin especificar') {
          mensaje += `🎨 Color: ${variante.color}\n`
        }
      } else {
        mensaje += `📏 ${variante.talla}\n`
      }
    }
    if (descuento > 0) {
      mensaje += `🏷️ *OFERTA -${descuento}%*\n`
      mensaje += `💰 Precio: ~${formatearMoneda(precioBase)}~ → *${formatearMoneda(precioFinal)}*\n\n`
    } else {
      mensaje += `💰 Precio: ${formatearMoneda(precioBase)}\n\n`
    }
    mensaje += `¿Está disponible? 🙏`
    
    const url = `https://wa.me/${WHATSAPP_VENDEDOR}?text=${encodeURIComponent(mensaje)}`
    window.open(url, '_blank')
  }

  // Compartir catálogo
  const compartirCatalogo = async () => {
    const url = window.location.href
    const texto = `¡Mira estos pantalones! 👖\n${url}`
    
    if (navigator.share) {
      try {
        await navigator.share({ title: NOMBRE_TIENDA, text: texto, url })
      } catch (err) {
        // Usuario canceló
      }
    } else {
      navigator.clipboard.writeText(url)
      alert('¡Link copiado!')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="p-4">
          {/* Logo y título */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-12 h-12 bg-gradient-to-br rounded-2xl flex items-center justify-center shadow-lg',
                tipoActivo === 'ropa' ? 'from-blue-500 to-cyan-500 shadow-blue-500/30' :
                tipoActivo === 'perfumes' ? 'from-pink-500 to-rose-500 shadow-pink-500/30' :
                tipoActivo === 'juguetes' ? 'from-yellow-500 to-orange-500 shadow-yellow-500/30' :
                'from-purple-500 to-blue-500 shadow-purple-500/30'
              )}>
                <span className="text-2xl">
                  {tipoActivo === 'ropa' ? '👖' : 
                   tipoActivo === 'perfumes' ? '🧴' : 
                   tipoActivo === 'juguetes' ? '🧸' : '🛒'}
                </span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  {NOMBRE_TIENDA}
                </h1>
                <p className="text-xs text-slate-500">Catálogo actualizado</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <ToggleTema />
              <button
                onClick={compartirCatalogo}
                className="w-11 h-11 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <Share2 className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
            </div>
          </div>

          {/* Buscador */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Tipos de producto */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto no-scrollbar">
          {TIPOS_PRODUCTO.map(tipo => (
            <button
              key={tipo.valor}
              onClick={() => cambiarTipo(tipo.valor)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all border-2',
                tipoActivo === tipo.valor
                  ? `bg-gradient-to-r ${tipo.color} text-white border-transparent shadow-lg`
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300'
              )}
            >
              <span className="text-lg">{tipo.emoji}</span>
              <span>{tipo.etiqueta}</span>
            </button>
          ))}
        </div>

        {/* Categorías (solo si no es "todos") */}
        {tipoActivo !== 'todos' && CATEGORIAS_POR_TIPO[tipoActivo] && (
          <div className="flex gap-2 px-4 pb-4 overflow-x-auto no-scrollbar">
            {CATEGORIAS_POR_TIPO[tipoActivo].map(cat => (
              <button
                key={cat.valor}
                onClick={() => setCategoriaActiva(cat.valor)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all',
                  categoriaActiva === cat.valor
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                )}
              >
                <span>{cat.emoji}</span>
                <span>{cat.etiqueta}</span>
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Contenido */}
      <main className="p-4 pb-28">
        {/* Contador */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-500 font-medium">
            {productosFiltrados.length} producto{productosFiltrados.length !== 1 && 's'} disponible{productosFiltrados.length !== 1 && 's'}
          </p>
        </div>

        {/* Grid de productos */}
        {cargando ? (
          <SkeletonLista cantidad={9} tipo="grid" />
        ) : productosFiltrados.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-7xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              No hay productos
            </h3>
            <p className="text-slate-500 mb-6">
              {busqueda ? 'Intenta con otra búsqueda' : 'Pronto agregaremos más productos'}
            </p>
            <a
              href={`https://wa.me/${WHATSAPP_VENDEDOR}?text=Hola!%20¿Qué%20productos%20tienen%20disponibles?`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-full font-semibold hover:bg-green-600 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Preguntar disponibilidad
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3">
            {productosFiltrados.map(producto => {
              const precioMinimo = obtenerPrecioMinimo(producto.variantes_producto)
              const tallasDisponibles = obtenerTallasDisponibles(producto.variantes_producto)
              const imagenes = obtenerImagenes(producto)
              const stockTotal = producto.variantes_producto?.reduce((acc, v) => acc + v.stock_actual, 0) || 0
              const agotado = stockTotal === 0
              const descuento = producto.descuento || 0
              const precioConDescuento = descuento > 0 ? precioMinimo * (1 - descuento / 100) : precioMinimo

              return (
                <div
                  key={producto.id}
                  onClick={() => {
                    setProductoSeleccionado(producto)
                    setTallaSeleccionada(null)
                  }}
                  className={cn(
                    "group cursor-pointer transition-all duration-300 animate-scale-in",
                    "hover:scale-[1.02] active:scale-95",
                    agotado && "opacity-50 grayscale"
                  )}
                  style={{ animationDelay: `${Math.random() * 0.2}s` }}
                >
                  {/* Imagen cuadrada compacta */}
                  <div className={cn(
                    "relative aspect-square bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-2xl overflow-hidden mb-1.5 shadow-sm transition-all duration-300",
                    "group-hover:shadow-lg group-hover:shadow-slate-500/20",
                    descuento > 0 && !agotado && "ring-2 ring-red-500 ring-offset-1 ring-offset-white dark:ring-offset-slate-900"
                  )}>
                    {imagenes.length > 0 ? (
                      <img 
                        src={imagenes[0]} 
                        alt={producto.nombre}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-3xl">
                          {(producto.tipo_producto || 'ropa') === 'ropa' ? '👖' : 
                           producto.tipo_producto === 'perfumes' ? '🧴' : '🧸'}
                        </span>
                      </div>
                    )}
                    
                    {/* Badge de descuento o estado */}
                    {descuento > 0 && !agotado ? (
                      <span className="absolute top-1 left-1 px-2 py-0.5 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] font-black rounded-full shadow-lg animate-pulse">
                        -{descuento}% 🔥
                      </span>
                    ) : agotado ? (
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-slate-500/90 text-white text-[10px] font-bold rounded-full">
                        Agotado
                      </span>
                    ) : stockTotal <= 3 && stockTotal > 0 ? (
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-orange-500/90 text-white text-[10px] font-bold rounded-full animate-pulse">
                        ¡Últimos {stockTotal}!
                      </span>
                    ) : null}

                    {/* Precio sobre la imagen */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-1.5 pt-6">
                      {descuento > 0 ? (
                        <div>
                          <p className="text-white/60 text-[10px] line-through leading-none">
                            {formatearMoneda(precioMinimo)}
                          </p>
                          <p className="text-green-400 font-black text-sm leading-none drop-shadow-lg">
                            {formatearMoneda(precioConDescuento)}
                          </p>
                        </div>
                      ) : (
                        <p className="text-white font-black text-sm leading-none drop-shadow-lg">
                          {formatearMoneda(precioMinimo)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Info compacta */}
                  <div className="px-0.5">
                    <h3 className={cn(
                      "font-semibold text-xs leading-tight line-clamp-2 transition-colors",
                      agotado ? "text-slate-400" : "text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400"
                    )}>
                      {producto.nombre}
                    </h3>
                    {/* Tallas disponibles - muy compacto */}
                    {!agotado && tallasDisponibles.length > 0 && (producto.tipo_producto || 'ropa') === 'ropa' && (
                      <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                        {[...new Set(tallasDisponibles.map(v => v.talla))].slice(0, 5).join(' · ')}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Modal de producto - Simplificado */}
      {productoSeleccionado && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-end">
          <div 
            className="absolute inset-0" 
            onClick={() => setProductoSeleccionado(null)} 
          />
          <div className="relative w-full bg-white dark:bg-slate-800 rounded-t-[2rem] max-h-[85vh] overflow-auto animate-slide-up">
            {/* Header con imagen clickeable y cerrar */}
            <div className="sticky top-0 bg-white dark:bg-slate-800 z-10 p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                {/* Imagen thumbnail - clickeable para abrir galería */}
                {(() => {
                  const imgs = obtenerImagenes(productoSeleccionado)
                  return (
                    <div 
                      onClick={() => {
                        if (imgs.length > 0) {
                          setGaleriaAbierta(true)
                          setImagenGaleriaActiva(0)
                        }
                      }}
                      className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 flex-shrink-0 cursor-pointer active:scale-95 transition-transform"
                    >
                      {imgs.length > 0 ? (
                        <>
                          <img src={imgs[0]} alt="" className="w-full h-full object-cover" />
                          {imgs.length > 1 && (
                            <div className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                              +{imgs.length - 1}
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                            <span className="text-white text-xl opacity-0 hover:opacity-100">🔍</span>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">
                          {(productoSeleccionado.tipo_producto || 'ropa') === 'ropa' ? '👖' : 
                           productoSeleccionado.tipo_producto === 'perfumes' ? '🧴' : '🧸'}
                        </div>
                      )}
                    </div>
                  )
                })()}
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-slate-900 dark:text-white text-base leading-tight line-clamp-2">
                    {productoSeleccionado.nombre}
                  </h2>
                  {/* Precio con descuento */}
                  {(() => {
                    const precioBase = tallaSeleccionada?.precio_venta || obtenerPrecioMinimo(productoSeleccionado.variantes_producto)
                    const descuento = productoSeleccionado.descuento || 0
                    const precioFinal = descuento > 0 ? precioBase * (1 - descuento / 100) : precioBase
                    
                    return descuento > 0 ? (
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            -{descuento}%
                          </span>
                          <span className="text-sm text-slate-400 line-through">
                            {formatearMoneda(precioBase)}
                          </span>
                        </div>
                        <p className="text-xl font-black text-green-600">
                          {formatearMoneda(precioFinal)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xl font-black text-green-600">
                        {formatearMoneda(precioBase)}
                      </p>
                    )
                  })()}
                  {obtenerImagenes(productoSeleccionado).length > 1 && (
                    <p className="text-xs text-blue-500 mt-0.5">
                      📷 Toca la foto para ver más
                    </p>
                  )}
                </div>
                
                {/* Cerrar */}
                <button
                  onClick={() => setProductoSeleccionado(null)}
                  className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
            </div>

            {/* Contenido */}
            <div className="p-4">
              {/* Verificar si hay stock */}
              {(() => {
                const stockProducto = productoSeleccionado.variantes_producto?.reduce((acc, v) => acc + v.stock_actual, 0) || 0
                const estaAgotado = stockProducto === 0
                const tallasConStock = obtenerTallasDisponibles(productoSeleccionado.variantes_producto)
                const esRopa = (productoSeleccionado.tipo_producto || 'ropa') === 'ropa'
                
                return estaAgotado ? (
                  <div className="text-center py-6">
                    <p className="text-4xl mb-2">😔</p>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mb-4">
                      Producto agotado
                    </p>
                    <a
                      href={`https://wa.me/${WHATSAPP_VENDEDOR}?text=Hola!%20Me%20interesa%20"${encodeURIComponent(productoSeleccionado.nombre)}"%20pero%20está%20agotado.%20¿Cuándo%20tendrán?`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-full font-medium"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Avisar cuando llegue
                    </a>
                  </div>
                ) : (
                  <>
                    {/* Tallas/Opciones */}
                    {tallasConStock.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          {esRopa ? 'Selecciona talla:' : productoSeleccionado.tipo_producto === 'perfumes' ? 'Tamaño:' : 'Opciones:'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {tallasConStock.map(variante => (
                            <button
                              key={variante.id}
                              onClick={() => setTallaSeleccionada(variante)}
                              className={cn(
                                'px-4 py-2 rounded-xl font-bold transition-all text-sm',
                                tallaSeleccionada?.id === variante.id
                                  ? 'bg-green-500 text-white shadow-lg'
                                  : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
                              )}
                            >
                              {variante.talla}
                              {esRopa && variante.color && variante.color !== 'Sin especificar' && (
                                <span className="block text-xs opacity-70">{variante.color}</span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Botón de compra grande */}
                    <button
                      onClick={() => pedirPorWhatsApp(productoSeleccionado, tallaSeleccionada)}
                      className="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all"
                    >
                      <MessageCircle className="w-6 h-6" />
                      {tallaSeleccionada ? '¡Lo quiero!' : 'Pedir por WhatsApp'}
                    </button>
                    
                    <p className="text-center text-xs text-slate-400 mt-2">
                      Respuesta inmediata 💬
                    </p>
                  </>
                )
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Botón flotante de WhatsApp */}
      <a
        href={`https://wa.me/${WHATSAPP_VENDEDOR}?text=¡Hola!%20Vi%20tu%20catálogo%20👋`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed z-40 bottom-20 right-4 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-xl shadow-green-500/40 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
      >
        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>

      {/* Barra inferior con contacto */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-green-500 to-green-600 p-3 flex items-center justify-center gap-2">
        <MessageCircle className="w-4 h-4 text-white" />
        <span className="text-sm text-white font-medium">
          Toca cualquier producto para pedir
        </span>
      </div>

      {/* GALERÍA DE FOTOS A PANTALLA COMPLETA */}
      {galeriaAbierta && productoSeleccionado && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col">
          {/* Header de galería */}
          <div className="flex items-center justify-between p-4 bg-black/50">
            <p className="text-white font-medium text-sm truncate flex-1">
              {productoSeleccionado.nombre}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-white/70 text-sm">
                {imagenGaleriaActiva + 1} / {obtenerImagenes(productoSeleccionado).length}
              </span>
              <button
                onClick={() => setGaleriaAbierta(false)}
                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
          
          {/* Imagen principal */}
          <div className="flex-1 flex items-center justify-center p-4 relative">
            <img 
              src={obtenerImagenes(productoSeleccionado)[imagenGaleriaActiva]} 
              alt=""
              className="max-w-full max-h-full object-contain"
            />
            
            {/* Flechas de navegación */}
            {obtenerImagenes(productoSeleccionado).length > 1 && (
              <>
                <button
                  onClick={() => setImagenGaleriaActiva(prev => 
                    prev === 0 ? obtenerImagenes(productoSeleccionado).length - 1 : prev - 1
                  )}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white text-2xl active:bg-white/30"
                >
                  ‹
                </button>
                <button
                  onClick={() => setImagenGaleriaActiva(prev => 
                    prev === obtenerImagenes(productoSeleccionado).length - 1 ? 0 : prev + 1
                  )}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white text-2xl active:bg-white/30"
                >
                  ›
                </button>
              </>
            )}
          </div>
          
          {/* Miniaturas */}
          {obtenerImagenes(productoSeleccionado).length > 1 && (
            <div className="p-4 bg-black/50">
              <div className="flex gap-2 justify-center overflow-x-auto">
                {obtenerImagenes(productoSeleccionado).map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setImagenGaleriaActiva(idx)}
                    className={cn(
                      'w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all',
                      idx === imagenGaleriaActiva 
                        ? 'border-white scale-110' 
                        : 'border-transparent opacity-60'
                    )}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Estilos */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
      `}</style>
    </div>
  )
}
