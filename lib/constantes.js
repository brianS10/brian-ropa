/**
 * Constantes Globales del Sistema
 * ================================
 * Valores que se usan en múltiples partes de la aplicación.
 * Centralizar aquí facilita cambios futuros.
 */

// Métodos de pago disponibles
export const METODOS_PAGO = [
  { id: 'efectivo', nombre: 'Efectivo', icono: 'Banknote' },
  { id: 'transferencia', nombre: 'Transferencia', icono: 'Smartphone' },
  { id: 'tarjeta', nombre: 'Tarjeta', icono: 'CreditCard' },
]

// Categorías de productos
export const CATEGORIAS = [
  'Pantalones',
  'Jeans',
  'Shorts',
  'Bermudas',
]

// Tipos de producto
export const TIPOS_PRODUCTO = [
  { valor: 'ropa', etiqueta: 'Ropa', emoji: '👖', color: 'from-blue-500 to-cyan-500' },
  { valor: 'perfumes', etiqueta: 'Perfumes', emoji: '🧴', color: 'from-pink-500 to-rose-500' },
  { valor: 'juguetes', etiqueta: 'Juguetes', emoji: '🧸', color: 'from-yellow-500 to-orange-500' },
]

// Categorías por tipo de producto
export const CATEGORIAS_POR_TIPO = {
  ropa: [
    { valor: 'todos', etiqueta: 'Todos', emoji: '👕' },
    { valor: 'General', etiqueta: 'General', emoji: '🏷️' },
    { valor: 'Pantalones', etiqueta: 'Pantalones', emoji: '👖' },
    { valor: 'Jeans', etiqueta: 'Jeans', emoji: '👖' },
    { valor: 'Shorts', etiqueta: 'Shorts', emoji: '🩳' },
    { valor: 'Bermudas', etiqueta: 'Bermudas', emoji: '🩳' },
  ],
  perfumes: [
    { valor: 'todos', etiqueta: 'Todos', emoji: '🧴' },
    { valor: 'General', etiqueta: 'General', emoji: '🏷️' },
    { valor: 'Hombre', etiqueta: 'Hombre', emoji: '👨' },
    { valor: 'Mujer', etiqueta: 'Mujer', emoji: '👩' },
    { valor: 'Unisex', etiqueta: 'Unisex', emoji: '🌟' },
  ],
  juguetes: [
    { valor: 'todos', etiqueta: 'Todos', emoji: '🧸' },
    { valor: 'General', etiqueta: 'General', emoji: '🏷️' },
    { valor: 'Educativos', etiqueta: 'Educativos', emoji: '📚' },
    { valor: 'Peluches', etiqueta: 'Peluches', emoji: '🧸' },
    { valor: 'Carros', etiqueta: 'Carros', emoji: '🚗' },
    { valor: 'Muñecas', etiqueta: 'Muñecas', emoji: '🪆' },
  ],
}

// Tallas estándar (se pueden personalizar por producto)
export const TALLAS_ESTANDAR = [
  '28', '29', '30', '31', '32', '33', '34', '36', '38', '40', '42', '44', '46'
]

// Tamaños de perfumes
export const TAMANOS_PERFUMES = [
  '50ml', '100ml'
]

// Edades para juguetes
export const EDADES_JUGUETES = [
  '0-2 años', '3-5 años', '6-8 años', '9-12 años', '+12 años', 'Todas las edades'
]

// Colores comunes
export const COLORES_COMUNES = [
  'Negro',
  'Azul Oscuro',
  'Azul Claro',
  'Gris',
  'Beige',
  'Café',
  'Blanco',
]

// Colores de ropa
export const COLORES_ROPA = [
  'Negro',
  'Azul Oscuro',
  'Azul Claro',
  'Gris',
  'Beige',
  'Café',
  'Blanco',
  'Azul',
  'Rojo',
  'Pitufo',
]

// Estados de stock
export const ESTADO_STOCK = {
  DISPONIBLE: 'disponible',    // stock > stock_minimo
  BAJO: 'bajo',                // stock <= stock_minimo y stock > 0
  AGOTADO: 'agotado',          // stock === 0
}

// Configuración de la app
export const CONFIG_APP = {
  nombre: 'Sistema de Inventario',
  version: '1.0.0',
  moneda: 'MXN',
  simboloMoneda: '$',
}

// WhatsApp del vendedor (México: 521 + número sin espacios)
export const WHATSAPP_VENDEDOR = '5215582258230'

// Nombre de la tienda
export const NOMBRE_TIENDA = 'Productos Sanchez'

// Logo de la tienda
export const LOGO_TIENDA = '/logo.png'

// Categorías para el catálogo público (coordinado con CATEGORIAS_POR_TIPO)
export const CATEGORIAS_CATALOGO = {
  todos: [
    { valor: 'todos', etiqueta: 'Todo', emoji: '🛒' }
  ],
  ropa: [
    { valor: 'todos', etiqueta: 'Todo', emoji: '👕' },
    { valor: 'General', etiqueta: 'General', emoji: '🏷️' },
    { valor: 'Pantalones', etiqueta: 'Pantalones', emoji: '👖' },
    { valor: 'Jeans', etiqueta: 'Jeans', emoji: '👖' },
    { valor: 'Shorts', etiqueta: 'Shorts', emoji: '🩳' },
    { valor: 'Bermudas', etiqueta: 'Bermudas', emoji: '🩳' },
  ],
  perfumes: [
    { valor: 'todos', etiqueta: 'Todo', emoji: '🧴' },
    { valor: 'General', etiqueta: 'General', emoji: '🏷️' },
    { valor: 'Hombre', etiqueta: 'Hombre', emoji: '👨' },
    { valor: 'Mujer', etiqueta: 'Mujer', emoji: '👩' },
    { valor: 'Unisex', etiqueta: 'Unisex', emoji: '🌟' },
  ],
  juguetes: [
    { valor: 'todos', etiqueta: 'Todo', emoji: '🧸' },
    { valor: 'General', etiqueta: 'General', emoji: '🏷️' },
    { valor: 'Educativos', etiqueta: 'Educativos', emoji: '📚' },
    { valor: 'Peluches', etiqueta: 'Peluches', emoji: '🧸' },
    { valor: 'Carros', etiqueta: 'Carros', emoji: '🚗' },
    { valor: 'Muñecas', etiqueta: 'Muñecas', emoji: '🪆' },
  ]
}

// Categorías disponibles para el admin
export const CATEGORIAS_ADMIN = [
  { valor: 'pantalones', etiqueta: 'Pantalones', emoji: '👖' },
  { valor: 'jeans', etiqueta: 'Jeans', emoji: '👖' },
  { valor: 'shorts', etiqueta: 'Shorts', emoji: '🩳' },
  { valor: 'bermudas', etiqueta: 'Bermudas', emoji: '🩳' },
  { valor: 'general', etiqueta: 'General', emoji: '👚' },
  { valor: 'pitufo', etiqueta: 'Pantalón color pitufo', emoji: '🧑‍🎤' }, // Nueva categoría específica
]
