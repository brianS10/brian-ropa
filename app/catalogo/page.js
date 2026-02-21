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
 * ✅ Productos destacados (más vendidos)
 */

'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Search, X, MessageCircle, Share2, SlidersHorizontal, ChevronDown, Sparkles, TrendingDown, Clock, Star, TrendingUp, Copy, Check, QrCode } from 'lucide-react'
import { supabase, estaConfigurado } from '@/lib/base_datos/cliente_supabase'
import { formatearMoneda, cn } from '@/lib/utilidades'
import { WHATSAPP_VENDEDOR, NOMBRE_TIENDA, CATEGORIAS_CATALOGO, LOGO_TIENDA } from '@/lib/constantes'
import ToggleTema from '@/componentes/ToggleTema'
import { SkeletonLista } from '@/componentes/Skeletons'
import SplashScreen from '@/componentes/SplashScreen'

// Opciones de ordenamiento
const OPCIONES_ORDEN = [
  { valor: 'destacados', etiqueta: 'Destacados ⭐', icono: Star },
  { valor: 'recientes', etiqueta: 'Más recientes', icono: Clock },
  { valor: 'mas-vendidos', etiqueta: 'Más vendidos', icono: TrendingUp },
  { valor: 'precio-bajo', etiqueta: 'Menor precio', icono: TrendingDown },
  { valor: 'precio-alto', etiqueta: 'Mayor precio', icono: TrendingDown },
  { valor: 'ofertas', etiqueta: 'Ofertas primero', icono: Sparkles },
]

// Tipos de productos principales
const TIPOS_PRODUCTO = [
  { valor: 'todos', etiqueta: 'Todo', emoji: '🛒', color: 'from-purple-500 to-blue-500' },
  { valor: 'ropa', etiqueta: 'Ropa', emoji: '👖', color: 'from-blue-500 to-cyan-500' },
  { valor: 'perfumes', etiqueta: 'Perfumes', emoji: '🧴', color: 'from-pink-500 to-rose-500' },
  { valor: 'juguetes', etiqueta: 'Juguetes', emoji: '🧸', color: 'from-yellow-500 to-orange-500' },
]

export default function PaginaCatalogo() {
  const [productos, setProductos] = useState([])
  const [ventasPorProducto, setVentasPorProducto] = useState({}) // Contador de ventas
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [tipoActivo, setTipoActivo] = useState('todos')
  const [categoriaActiva, setCategoriaActiva] = useState('todos')
  const [productoSeleccionado, setProductoSeleccionado] = useState(null)
  const [tallaSeleccionada, setTallaSeleccionada] = useState(null)
  const [galeriaAbierta, setGaleriaAbierta] = useState(false)
  const [imagenGaleriaActiva, setImagenGaleriaActiva] = useState(0)
  const [modalListo, setModalListo] = useState(false) // Evita clicks accidentales al abrir
  
  // Ordenamiento - Por defecto "destacados" para mostrar los más vendidos primero
  const [ordenActivo, setOrdenActivo] = useState('destacados')
  const [mostrarOrden, setMostrarOrden] = useState(false)
  
  // Splash screen - siempre al cargar
  const [mostrarSplash, setMostrarSplash] = useState(true)
  
  // Modal de compartir
  const [modalCompartir, setModalCompartir] = useState(false)
  const [linkCopiado, setLinkCopiado] = useState(false)
  const [mostrarQR, setMostrarQR] = useState(false)
  const qrRef = useRef(null)

  // Cuando se abre un producto, esperar un momento antes de permitir abrir galería
  useEffect(() => {
    if (productoSeleccionado) {
      setModalListo(false)
      const timer = setTimeout(() => setModalListo(true), 300)
      return () => clearTimeout(timer)
    }
  }, [productoSeleccionado])

  // Obtener categorías según el tipo seleccionado
  const categoriasDisponibles = CATEGORIAS_CATALOGO[tipoActivo] || CATEGORIAS_CATALOGO.todos

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

  // Cargar productos y estadísticas de ventas
  useEffect(() => {
    async function cargar() {
      if (!estaConfigurado() || !supabase) {
        setCargando(false)
        return
      }

      // Cargar productos
      const { data } = await supabase
        .from('productos')
        .select(`*, variantes_producto (*)`)
        .eq('estado', true)
        .order('nombre')
      
      setProductos(data || [])

      // Cargar estadísticas de ventas para ordenar por más vendidos
      const { data: detalles } = await supabase
        .from('detalle_venta')
        .select('variante_id, cantidad, variantes_producto!inner(producto_id)')
      
      // Contar ventas por producto
      const conteo = {}
      if (detalles) {
        detalles.forEach(d => {
          const prodId = d.variantes_producto?.producto_id
          if (prodId) {
            conteo[prodId] = (conteo[prodId] || 0) + (d.cantidad || 1)
          }
        })
      }
      setVentasPorProducto(conteo)
      setCargando(false)
    }
    cargar()
  }, [])

  // Cambiar tipo resetea categoría
  const cambiarTipo = (nuevoTipo) => {
    setTipoActivo(nuevoTipo)
    setCategoriaActiva('todos')
  }

  // Obtener precio mínimo (definido antes de usarse en el filtro)
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

  // Verificar si un producto es destacado (tiene ventas o descuento)
  const esDestacado = (producto) => {
    const tieneVentas = (ventasPorProducto[producto.id] || 0) > 0
    const tieneDescuento = (producto.descuento || 0) > 0
    const esNuevo = new Date(producto.creado_en) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 días
    return tieneVentas || tieneDescuento || esNuevo
  }

  // Filtrar productos por tipo y categoría
  const productosFiltrados = productos
    .filter(p => {
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
    .sort((a, b) => {
      // Ordenar según la opción seleccionada
      switch (ordenActivo) {
        case 'destacados':
          // Primero los destacados, luego por ventas
          const aDestacado = esDestacado(a) ? 1 : 0
          const bDestacado = esDestacado(b) ? 1 : 0
          if (bDestacado !== aDestacado) return bDestacado - aDestacado
          return (ventasPorProducto[b.id] || 0) - (ventasPorProducto[a.id] || 0)
        case 'mas-vendidos':
          return (ventasPorProducto[b.id] || 0) - (ventasPorProducto[a.id] || 0)
        case 'precio-bajo':
          return obtenerPrecioMinimo(a.variantes_producto) - obtenerPrecioMinimo(b.variantes_producto)
        case 'precio-alto':
          return obtenerPrecioMinimo(b.variantes_producto) - obtenerPrecioMinimo(a.variantes_producto)
        case 'ofertas':
          return (b.descuento || 0) - (a.descuento || 0)
        case 'recientes':
        default:
          return new Date(b.creado_en || 0) - new Date(a.creado_en || 0)
      }
    })

  // Enviar mensaje por WhatsApp
  const pedirPorWhatsApp = (producto, variante = null) => {
    const precioBase = variante?.precio_venta || obtenerPrecioMinimo(producto.variantes_producto)
    const descuento = producto.descuento || 0
    const precioFinal = descuento > 0 ? precioBase * (1 - descuento / 100) : precioBase
    const tipoProducto = producto.tipo_producto || 'ropa'
    
    // Etiqueta según tipo de producto
    const getEtiqueta = (tipo) => {
      switch (tipo) {
        case 'perfumes': return 'Tamaño'
        case 'juguetes': return 'Presentación'
        default: return 'Talla'
      }
    }
    
    let mensaje = `¡Hola! 👋\n\nMe interesa este producto:\n\n`
    mensaje += `📦 *${producto.nombre}*\n`
    if (variante) {
      if (tipoProducto === 'ropa') {
        mensaje += `📏 Talla: ${variante.talla}\n`
        if (variante.color && variante.color !== '') {
          mensaje += `🎨 Color: ${variante.color}\n`
        }
      } else {
        mensaje += `📦 ${getEtiqueta(tipoProducto)}: ${variante.talla}\n`
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

  // Compartir producto individual
  const compartirProducto = async (producto, e) => {
    e?.stopPropagation()
    const precioBase = obtenerPrecioMinimo(producto.variantes_producto)
    const descuento = producto.descuento || 0
    const precioFinal = descuento > 0 ? precioBase * (1 - descuento / 100) : precioBase
    
    const texto = descuento > 0 
      ? `🔥 ¡OFERTA! ${producto.nombre} - ${formatearMoneda(precioFinal)} (antes ${formatearMoneda(precioBase)}) -${descuento}% OFF`
      : `👀 Mira esto: ${producto.nombre} - ${formatearMoneda(precioBase)}`
    
    if (navigator.share) {
      try {
        await navigator.share({ 
          title: producto.nombre, 
          text: texto,
          url: window.location.href 
        })
      } catch (err) {
        // Usuario canceló
      }
    } else {
      navigator.clipboard.writeText(`${texto}\n${window.location.href}`)
      // Mostrar feedback
      setProductoAnimado(`share-${producto.id}`)
      setTimeout(() => setProductoAnimado(null), 1500)
    }
  }

  // Compartir catálogo - Abre modal con opciones
  const compartirCatalogo = () => {
    setModalCompartir(true)
    setLinkCopiado(false)
    setMostrarQR(false)
  }

  // Copiar link al portapapeles
  const copiarLink = async () => {
    const url = window.location.origin + '/catalogo'
    await navigator.clipboard.writeText(url)
    setLinkCopiado(true)
    setTimeout(() => setLinkCopiado(false), 2000)
  }

  // Generar URL del QR usando API externa
  const generarQRUrl = () => {
    const url = encodeURIComponent(window.location.origin + '/catalogo')
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${url}`
  }

  // Función para cerrar el modal correctamente
  const cerrarModal = useCallback(() => {
    setProductoSeleccionado(null)
    setGaleriaAbierta(false)
    setTallaSeleccionada(null)
    setModalListo(false)
  }, [])

  const handleSplashFinish = useCallback(() => {
    setMostrarSplash(false)
  }, [])

  return (
    <>
      {/* Splash Screen - cada vez que carga */}
      {mostrarSplash && (
        <SplashScreen onFinish={handleSplashFinish} duracion={1500} />
      )}
      
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="p-4">
          {/* Logo y título - Animado */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-14 h-14 bg-gradient-to-br rounded-2xl flex items-center justify-center shadow-lg animate-float',
                tipoActivo === 'ropa' ? 'from-blue-500 to-cyan-500 shadow-blue-500/30' :
                tipoActivo === 'perfumes' ? 'from-pink-500 to-rose-500 shadow-pink-500/30' :
                tipoActivo === 'juguetes' ? 'from-yellow-500 to-orange-500 shadow-yellow-500/30' :
                'from-purple-500 to-blue-500 shadow-purple-500/30'
              )}>
                <img 
                  src={LOGO_TIENDA} 
                  alt={NOMBRE_TIENDA}
                  className="w-10 h-10 object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  {NOMBRE_TIENDA}
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">✨ Catálogo actualizado</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <ToggleTema />
              <button
                onClick={compartirCatalogo}
                className="w-11 h-11 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center active:scale-90 transition-transform tap-feedback"
              >
                <Share2 className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
            </div>
          </div>

          {/* Buscador mejorado */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="¿Qué estás buscando? 🔍"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base border-2 border-transparent focus:border-blue-500/30 transition-all"
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 active:scale-90 transition-transform"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Tipos de producto */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto no-scrollbar">
          {TIPOS_PRODUCTO.map((tipo, idx) => (
            <button
              key={tipo.valor}
              onClick={() => cambiarTipo(tipo.valor)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all border-2 tap-feedback',
                tipoActivo === tipo.valor
                  ? `bg-gradient-to-r ${tipo.color} text-white border-transparent shadow-lg scale-105`
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 active:scale-95'
              )}
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <span className="text-lg">{tipo.emoji}</span>
              <span>{tipo.etiqueta}</span>
            </button>
          ))}
        </div>

        {/* Categorías (solo si no es "todos") - Mejorado */}
        {tipoActivo !== 'todos' && CATEGORIAS_CATALOGO[tipoActivo] && (
          <div className="flex gap-2 px-4 pb-4 overflow-x-auto no-scrollbar">
            {CATEGORIAS_CATALOGO[tipoActivo].map((cat, idx) => (
              <button
                key={cat.valor}
                onClick={() => setCategoriaActiva(cat.valor)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all tap-feedback',
                  categoriaActiva === cat.valor
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 active:scale-95'
                )}
                style={{ animationDelay: `${idx * 0.03}s` }}
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
        {/* Barra de filtros y ordenamiento */}
        <div className="flex items-center justify-between mb-4 gap-2">
          {/* Contador */}
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></span>
            <span className="font-bold text-slate-700 dark:text-slate-200">{productosFiltrados.length}</span>
            <span>productos</span>
          </p>
          
          {/* Botón de ordenar */}
          <div className="relative">
            <button
              onClick={() => setMostrarOrden(!mostrarOrden)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-400 tap-feedback"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {OPCIONES_ORDEN.find(o => o.valor === ordenActivo)?.etiqueta || 'Ordenar'}
              </span>
              <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", mostrarOrden && "rotate-180")} />
            </button>
            
            {/* Dropdown de ordenamiento */}
            {mostrarOrden && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMostrarOrden(false)} />
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 animate-scale-in">
                  {OPCIONES_ORDEN.map((opcion) => {
                    const Icono = opcion.icono
                    return (
                      <button
                        key={opcion.valor}
                        onClick={() => {
                          setOrdenActivo(opcion.valor)
                          setMostrarOrden(false)
                        }}
                        className={cn(
                          "w-full flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors",
                          ordenActivo === opcion.valor
                            ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                        )}
                      >
                        <Icono className={cn("w-4 h-4", opcion.valor === 'precio-alto' && "rotate-180")} />
                        {opcion.etiqueta}
                        {ordenActivo === opcion.valor && (
                          <span className="ml-auto text-blue-500">✓</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Grid de productos */}
        {cargando ? (
          <SkeletonLista cantidad={9} tipo="grid" />
        ) : productosFiltrados.length === 0 ? (
          <div className="text-center py-20 animate-scale-in">
            <div className="text-7xl mb-4 animate-float">🔍</div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              No hay productos
            </h3>
            <p className="text-slate-500 mb-6">
              {busqueda ? 'Intenta con otra búsqueda' : 'Pronto agregaremos más productos'}
            </p>
            <a
              href={`https://wa.me/${WHATSAPP_VENDEDOR}?text=Hola!%20¿Qué%20productos%20tienen%20disponibles?`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full font-semibold shadow-lg shadow-green-500/30 tap-feedback"
            >
              <MessageCircle className="w-5 h-5" />
              Preguntar disponibilidad
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 px-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:gap-3 sm:px-0">
            {productosFiltrados.map((producto, index) => {
              const precioMinimo = obtenerPrecioMinimo(producto.variantes_producto)
              const tallasDisponibles = obtenerTallasDisponibles(producto.variantes_producto)
              const imagenes = obtenerImagenes(producto)
              const stockTotal = producto.variantes_producto?.reduce((acc, v) => acc + v.stock_actual, 0) || 0
              const agotado = stockTotal === 0
              const descuento = producto.descuento || 0
              const precioConDescuento = descuento > 0 ? precioMinimo * (1 - descuento / 100) : precioMinimo
              const ventasProducto = ventasPorProducto[producto.id] || 0
              const esMasVendido = ventasProducto >= 3 // Al menos 3 ventas

              return (
                <div
                  key={producto.id}
                  onClick={(e) => {
                    e.stopPropagation()
                    // Resetear estados antes de abrir
                    setGaleriaAbierta(false)
                    setTallaSeleccionada(null)
                    setProductoSeleccionado(producto)
                  }}
                  className={cn(
                    "group cursor-pointer animate-stagger tap-feedback",
                    agotado && "opacity-50 grayscale"
                  )}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Tarjeta del producto - Más alta en móvil */}
                  <div className={cn(
                    "relative aspect-[3/5] sm:aspect-[3/4] rounded-2xl overflow-hidden shadow-lg transition-all duration-300",
                    "bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600",
                    "group-active:scale-95",
                    descuento > 0 && !agotado && "ring-2 ring-red-500 animate-glow",
                    esMasVendido && !descuento && !agotado && "ring-2 ring-yellow-400"
                  )}>
                    {/* Imagen */}
                    {imagenes.length > 0 ? (
                      <img 
                        src={imagenes[0]} 
                        alt={producto.nombre}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700">
                        <span className="text-4xl">
                          {(producto.tipo_producto || 'ropa') === 'ropa' ? '👖' : 
                           producto.tipo_producto === 'perfumes' ? '🧴' : '🧸'}
                        </span>
                      </div>
                    )}
                    
                    {/* Overlay con gradiente */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                    
                    {/* Badge de descuento, más vendido o estado - Más grande en móvil */}
                    {descuento > 0 && !agotado ? (
                      <div className="absolute top-2 left-2 animate-float">
                        <span className="px-3 py-1.5 sm:px-2.5 sm:py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm sm:text-xs font-black rounded-full shadow-lg flex items-center gap-1">
                          <span className="animate-pulse">🔥</span> -{descuento}%
                        </span>
                      </div>
                    ) : esMasVendido && !agotado ? (
                      <div className="absolute top-2 left-2 animate-float">
                        <span className="px-3 py-1.5 sm:px-2.5 sm:py-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-sm sm:text-xs font-black rounded-full shadow-lg flex items-center gap-1">
                          ⭐ Top
                        </span>
                      </div>
                    ) : agotado ? (
                      <div className="absolute top-2 left-2">
                        <span className="px-3 py-1.5 sm:px-2 sm:py-1 bg-slate-800/90 text-white text-sm sm:text-xs font-bold rounded-full">
                          Agotado
                        </span>
                      </div>
                    ) : stockTotal <= 3 && stockTotal > 0 ? (
                      <div className="absolute top-2 left-2 animate-heartbeat">
                        <span className="px-3 py-1.5 sm:px-2 sm:py-1 bg-orange-500 text-white text-sm sm:text-xs font-bold rounded-full shadow-lg">
                          ¡Últimos {stockTotal}!
                        </span>
                      </div>
                    ) : null}

                    {/* Cantidad de fotos - Más visible */}
                    {imagenes.length > 1 && (
                      <div className="absolute top-2 right-2">
                        <span className="px-2.5 py-1.5 sm:px-2 sm:py-1 bg-black/60 text-white text-sm sm:text-xs font-medium rounded-full backdrop-blur-sm">
                          📷 {imagenes.length}
                        </span>
                      </div>
                    )}

                    {/* Info del producto - Mejor legibilidad móvil */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-3">
                      <h3 className="font-bold text-white text-base sm:text-sm leading-tight line-clamp-2 mb-1.5 drop-shadow-lg">
                        {producto.nombre}
                      </h3>
                      
                      {/* Precio - Más grande en móvil */}
                      <div className="flex items-end gap-2">
                        {descuento > 0 ? (
                          <>
                            <span className="text-white/60 text-xs line-through">
                              {formatearMoneda(precioMinimo)}
                            </span>
                            <span className="text-green-400 font-black text-xl sm:text-lg drop-shadow-lg">
                              {formatearMoneda(precioConDescuento)}
                            </span>
                          </>
                        ) : (
                          <span className="text-white font-black text-xl sm:text-lg drop-shadow-lg">
                            {formatearMoneda(precioMinimo)}
                          </span>
                        )}
                      </div>
                      
                      {/* Tallas disponibles - Más visibles en móvil */}
                      {!agotado && tallasDisponibles.length > 0 && (producto.tipo_producto || 'ropa') === 'ropa' && (
                        <div className="flex gap-1.5 mt-2.5 flex-wrap">
                          {[...new Set(tallasDisponibles.map(v => v.talla))].slice(0, 5).map(talla => (
                            <span key={talla} className="px-2 py-1 bg-white/25 backdrop-blur-sm text-white text-xs sm:text-[10px] font-semibold rounded-md">
                              {talla}
                            </span>
                          ))}
                          {[...new Set(tallasDisponibles.map(v => v.talla))].length > 5 && (
                            <span className="px-2 py-1 bg-white/25 backdrop-blur-sm text-white text-xs sm:text-[10px] font-semibold rounded-md">
                              +{[...new Set(tallasDisponibles.map(v => v.talla))].length - 5}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Modal de producto - Mejorado para móvil */}
      {productoSeleccionado && (
        <div 
          className="fixed inset-0 z-50 flex items-end"
        >
          {/* Overlay con blur - NO cierra al tocar */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          
          {/* Panel del producto */}
          <div 
            className="relative w-full bg-white dark:bg-slate-900 rounded-t-[2rem] max-h-[90vh] overflow-auto animate-slide-up shadow-2xl"
          >
            {/* Handle para arrastrar */}
            <div className="sticky top-0 z-20 pt-3 pb-2 bg-white dark:bg-slate-900">
              <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full mx-auto" />
            </div>
            
            {/* Header con info del producto */}
            <div className="p-4 pb-0">
              {/* Fila: Imagen pequeña + Info básica */}
              <div className="flex gap-4">
                {/* Imagen compacta */}
                {(() => {
                  const imgs = obtenerImagenes(productoSeleccionado)
                  const descuento = productoSeleccionado.descuento || 0
                  
                  return (
                    <div 
                      onClick={(e) => {
                        e.stopPropagation()
                        if (imgs.length > 0 && modalListo) {
                          setGaleriaAbierta(true)
                          setImagenGaleriaActiva(0)
                        }
                      }}
                      className="relative w-28 h-28 flex-shrink-0 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 cursor-pointer active:scale-95 transition-transform shadow-lg"
                    >
                      {imgs.length > 0 ? (
                        <>
                          <img src={imgs[0]} alt="" className="w-full h-full object-cover" />
                          {imgs.length > 1 && (
                            <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                              +{imgs.length - 1}
                            </div>
                          )}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors">
                            <span className="text-white text-lg opacity-0 hover:opacity-100">🔍</span>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-4xl">
                            {(productoSeleccionado.tipo_producto || 'ropa') === 'ropa' ? '👖' : 
                             productoSeleccionado.tipo_producto === 'perfumes' ? '🧴' : '🧸'}
                          </span>
                        </div>
                      )}
                      
                      {/* Badge de descuento */}
                      {descuento > 0 && (
                        <div className="absolute top-1 left-1">
                          <span className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-black rounded-full">
                            -{descuento}%
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })()}
                
                {/* Info del producto al lado de la imagen */}
                <div className="flex-1 min-w-0">
                  <h2 className="font-black text-slate-900 dark:text-white text-lg leading-tight mb-1 line-clamp-2">
                    {productoSeleccionado.nombre}
                  </h2>
                  
                  {/* Precio */}
                  {(() => {
                    const precioBase = tallaSeleccionada?.precio_venta || obtenerPrecioMinimo(productoSeleccionado.variantes_producto)
                    const descuento = productoSeleccionado.descuento || 0
                    const precioFinal = descuento > 0 ? precioBase * (1 - descuento / 100) : precioBase
                    
                    return (
                      <div className="mb-2">
                        {descuento > 0 ? (
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-black text-green-600">{formatearMoneda(precioFinal)}</span>
                            <span className="text-sm text-slate-400 line-through">{formatearMoneda(precioBase)}</span>
                          </div>
                        ) : (
                          <span className="text-2xl font-black text-blue-600">{formatearMoneda(precioBase)}</span>
                        )}
                      </div>
                    )
                  })()}
                </div>
                
                {/* Botón cerrar */}
                <button
                  onClick={cerrarModal}
                  className="w-8 h-8 flex-shrink-0 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              
              {/* Descripción completa (si existe) */}
              {productoSeleccionado.descripcion && (
                <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {productoSeleccionado.descripcion}
                  </p>
                </div>
              )}
            </div>

            {/* Contenido del modal */}
            <div className="p-4 pt-2">
              {/* Verificar si hay stock */}
              {(() => {
                const stockProducto = productoSeleccionado.variantes_producto?.reduce((acc, v) => acc + v.stock_actual, 0) || 0
                const estaAgotado = stockProducto === 0
                const tallasConStock = obtenerTallasDisponibles(productoSeleccionado.variantes_producto)
                const esRopa = (productoSeleccionado.tipo_producto || 'ropa') === 'ropa'
                
                return estaAgotado ? (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-3 animate-float">😔</div>
                    <p className="text-slate-600 dark:text-slate-400 font-semibold text-lg mb-4">
                      ¡Oh no! Producto agotado
                    </p>
                    <a
                      href={`https://wa.me/${WHATSAPP_VENDEDOR}?text=Hola!%20Me%20interesa%20"${encodeURIComponent(productoSeleccionado.nombre)}"%20pero%20está%20agotado.%20¿Cuándo%20tendrán?`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full font-bold shadow-lg active:scale-95 transition-transform"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Avisar cuando llegue
                    </a>
                  </div>
                ) : (
                  <>
                    {/* Tallas/Opciones - Mejorado */}
                    {tallasConStock.length > 0 && (
                      <div className="mb-5">
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                          {esRopa ? '👕 Selecciona tu talla:' : productoSeleccionado.tipo_producto === 'perfumes' ? '🧴 Tamaño:' : '🎁 Opciones:'}
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {tallasConStock.map((variante, idx) => (
                            <button
                              key={variante.id}
                              onClick={() => setTallaSeleccionada(variante)}
                              className={cn(
                                'relative py-3 px-2 rounded-xl font-bold transition-all text-sm border-2 tap-feedback',
                                tallaSeleccionada?.id === variante.id
                                  ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/30 scale-105'
                                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white'
                              )}
                              style={{ animationDelay: `${idx * 0.05}s` }}
                            >
                              <span className="block text-lg">{variante.talla}</span>
                              {esRopa && variante.color && variante.color !== '' && (
                                <span className={cn(
                                  "block text-xs mt-0.5",
                                  tallaSeleccionada?.id === variante.id ? "text-white/80" : "text-slate-500"
                                )}>{variante.color}</span>
                              )}
                              {tallaSeleccionada?.id === variante.id && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md">
                                  <span className="text-green-500 text-xs">✓</span>
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Botón de compra mejorado */}
                    <button
                      onClick={() => pedirPorWhatsApp(productoSeleccionado, tallaSeleccionada)}
                      className={cn(
                        "w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl active:scale-[0.97] transition-all",
                        tallaSeleccionada 
                          ? "bg-gradient-to-r from-green-500 to-green-600 text-white animate-glow" 
                          : "bg-gradient-to-r from-green-500 to-green-600 text-white"
                      )}
                    >
                      <MessageCircle className="w-6 h-6" />
                      <span>{tallaSeleccionada ? '¡Lo quiero! 🛒' : 'Pedir por WhatsApp'}</span>
                    </button>
                    
                    <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-3 flex items-center justify-center gap-2">
                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      Respuesta en menos de 5 minutos
                    </p>
                  </>
                )
              })()}
            </div>
            
            {/* Espacio para el safe area */}
            <div className="h-6 bg-white dark:bg-slate-900"></div>
          </div>
        </div>
      )}

      {/* Botón flotante de WhatsApp - Mejorado */}
      <a
        href={`https://wa.me/${WHATSAPP_VENDEDOR}?text=¡Hola!%20Vi%20tu%20catálogo%20👋`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed z-40 bottom-20 right-4 w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 text-white rounded-full shadow-xl shadow-green-500/50 flex items-center justify-center active:scale-90 transition-transform animate-float"
      >
        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>

      {/* GALERÍA DE FOTOS A PANTALLA COMPLETA */}
      {galeriaAbierta && productoSeleccionado && modalListo && (
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

      {/* Modal de Compartir */}
      {modalCompartir && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setModalCompartir(false)}
          />
          
          {/* Contenido del modal */}
          <div className="relative bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Share2 className="w-6 h-6 text-blue-500" />
                Compartir Catálogo
              </h3>
              <button
                onClick={() => setModalCompartir(false)}
                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center active:scale-90 transition-transform"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Link del catálogo */}
            <div className="mb-4">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 block">
                Link del catálogo
              </label>
              <div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-700 rounded-xl">
                <span className="flex-1 text-sm text-slate-700 dark:text-slate-300 truncate font-mono">
                  {typeof window !== 'undefined' ? window.location.origin + '/catalogo' : '/catalogo'}
                </span>
                <button
                  onClick={copiarLink}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all active:scale-95",
                    linkCopiado 
                      ? "bg-green-500 text-white" 
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  )}
                >
                  {linkCopiado ? (
                    <>
                      <Check className="w-4 h-4" />
                      ¡Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copiar
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Botón para generar QR */}
            <button
              onClick={() => setMostrarQR(!mostrarQR)}
              className={cn(
                "w-full flex items-center justify-center gap-3 p-4 rounded-xl font-semibold transition-all active:scale-95 mb-4",
                mostrarQR
                  ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                  : "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
              )}
            >
              <QrCode className="w-6 h-6" />
              {mostrarQR ? 'Ocultar código QR' : 'Generar código QR'}
            </button>

            {/* QR Code */}
            {mostrarQR && (
              <div className="flex flex-col items-center p-4 bg-white dark:bg-slate-700 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600">
                <img 
                  ref={qrRef}
                  src={generarQRUrl()}
                  alt="QR del catálogo"
                  className="w-48 h-48 rounded-lg"
                />
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 text-center">
                  📱 Escanea para abrir el catálogo
                </p>
                <a
                  href={generarQRUrl()}
                  download={`qr-${NOMBRE_TIENDA.toLowerCase().replace(/\s+/g, '-')}.png`}
                  className="mt-3 px-4 py-2 bg-slate-100 dark:bg-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-white flex items-center gap-2 active:scale-95 transition-transform"
                >
                  ⬇️ Descargar QR
                </a>
              </div>
            )}

            {/* Compartir nativo (si está disponible) */}
            {typeof navigator !== 'undefined' && navigator.share && (
              <button
                onClick={async () => {
                  try {
                    await navigator.share({
                      title: NOMBRE_TIENDA,
                      text: `¡Mira estos productos! 🛒`,
                      url: window.location.origin + '/catalogo'
                    })
                  } catch (err) {}
                }}
                className="w-full mt-4 flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold shadow-lg active:scale-95 transition-transform"
              >
                <MessageCircle className="w-5 h-5" />
                Compartir por WhatsApp / Apps
              </button>
            )}
          </div>
        </div>
      )}
    </div>
    </>
  )
}
