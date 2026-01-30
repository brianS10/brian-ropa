/**
 * Utilidades y Funciones Helper
 * ==============================
 * Funciones reutilizables para formateo y cálculos comunes.
 */

import dayjs from 'dayjs'
import 'dayjs/locale/es'
import relativeTime from 'dayjs/plugin/relativeTime'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Configurar dayjs en español
dayjs.locale('es')
dayjs.extend(relativeTime)

/**
 * Combina clases de Tailwind de forma inteligente
 * Evita conflictos cuando se usan clases condicionales
 * @param  {...any} inputs - Clases CSS a combinar
 * @returns {string} - Clases combinadas sin conflictos
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea un número como moneda mexicana
 * @param {number} cantidad - Cantidad a formatear
 * @returns {string} - Ej: "$1,250.00"
 */
export function formatearMoneda(cantidad) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(cantidad)
}

/**
 * Formatea una fecha de forma legible
 * @param {string|Date} fecha - Fecha a formatear
 * @param {string} formato - Formato deseado (default: 'DD/MM/YYYY')
 * @returns {string} - Fecha formateada
 */
export function formatearFecha(fecha, formato = 'DD/MM/YYYY') {
  return dayjs(fecha).format(formato)
}

/**
 * Muestra tiempo relativo ("hace 2 horas", "hace 3 días")
 * @param {string|Date} fecha - Fecha a comparar
 * @returns {string} - Tiempo relativo en español
 */
export function tiempoRelativo(fecha) {
  return dayjs(fecha).fromNow()
}

/**
 * Obtiene el inicio y fin del día actual (para filtros)
 * @returns {Object} - { inicio: Date, fin: Date }
 */
export function rangoDelDia() {
  const hoy = dayjs()
  return {
    inicio: hoy.startOf('day').toISOString(),
    fin: hoy.endOf('day').toISOString(),
  }
}

/**
 * Genera un ID único simple (para uso temporal)
 * @returns {string} - ID único
 */
export function generarIdTemporal() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * Determina el estado del stock según la cantidad
 * @param {number} stockActual - Cantidad actual
 * @param {number} stockMinimo - Cantidad mínima de alerta
 * @returns {string} - 'disponible' | 'bajo' | 'agotado'
 */
export function obtenerEstadoStock(stockActual, stockMinimo = 2) {
  if (stockActual <= 0) return 'agotado'
  if (stockActual <= stockMinimo) return 'bajo'
  return 'disponible'
}

/**
 * Calcula el total de un carrito de compras
 * @param {Array} items - Array de items con { precio, cantidad }
 * @returns {number} - Total calculado
 */
export function calcularTotalCarrito(items) {
  return items.reduce((total, item) => {
    return total + (item.precio_venta * item.cantidad)
  }, 0)
}
