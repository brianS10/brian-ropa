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

// Tallas estándar (se pueden personalizar por producto)
export const TALLAS_ESTANDAR = [
  '28', '29', '30', '31', '32', '33', '34', '36', '38', '40'
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
