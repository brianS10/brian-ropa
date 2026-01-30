/**
 * Hook: usarCarrito
 * ==================
 * Maneja el estado global del carrito de compras usando Zustand.
 * Persiste en memoria durante la sesión (se puede agregar localStorage después).
 * 
 * Uso:
 * const { carrito, agregarProducto, quitarProducto, limpiarCarrito, total } = usarCarrito()
 */

import { create } from 'zustand'
import { calcularTotalCarrito } from '@/lib/utilidades'

export const usarCarrito = create((set, get) => ({
  // Estado inicial
  carrito: [],
  metodoPago: 'efectivo',

  /**
   * Agrega una variante al carrito
   * Si ya existe, incrementa la cantidad
   * @param {Object} variante - Objeto con datos de la variante del producto
   */
  agregarProducto: (variante) => set((state) => {
    const indiceExistente = state.carrito.findIndex(
      item => item.variante_id === variante.variante_id
    )

    if (indiceExistente >= 0) {
      // Ya existe: incrementar cantidad
      const carritoActualizado = [...state.carrito]
      carritoActualizado[indiceExistente] = {
        ...carritoActualizado[indiceExistente],
        cantidad: carritoActualizado[indiceExistente].cantidad + 1
      }
      return { carrito: carritoActualizado }
    }

    // No existe: agregar nuevo
    return { 
      carrito: [...state.carrito, { ...variante, cantidad: 1 }] 
    }
  }),

  /**
   * Quita una unidad de un producto del carrito
   * Si queda en 0, lo elimina del carrito
   * @param {string} varianteId - ID de la variante a quitar
   */
  quitarProducto: (varianteId) => set((state) => {
    const indice = state.carrito.findIndex(
      item => item.variante_id === varianteId
    )

    if (indice < 0) return state

    const carritoActualizado = [...state.carrito]
    
    if (carritoActualizado[indice].cantidad > 1) {
      carritoActualizado[indice] = {
        ...carritoActualizado[indice],
        cantidad: carritoActualizado[indice].cantidad - 1
      }
    } else {
      carritoActualizado.splice(indice, 1)
    }

    return { carrito: carritoActualizado }
  }),

  /**
   * Elimina completamente un producto del carrito
   * @param {string} varianteId - ID de la variante a eliminar
   */
  eliminarProducto: (varianteId) => set((state) => ({
    carrito: state.carrito.filter(item => item.variante_id !== varianteId)
  })),

  /**
   * Limpia todo el carrito (después de completar venta)
   */
  limpiarCarrito: () => set({ carrito: [], metodoPago: 'efectivo' }),

  /**
   * Cambia el método de pago seleccionado
   * @param {string} metodo - 'efectivo' | 'transferencia' | 'tarjeta'
   */
  cambiarMetodoPago: (metodo) => set({ metodoPago: metodo }),

  /**
   * Calcula el total actual del carrito
   * @returns {number} - Total en pesos
   */
  obtenerTotal: () => {
    const { carrito } = get()
    return calcularTotalCarrito(carrito)
  },

  /**
   * Obtiene la cantidad total de items en el carrito
   * @returns {number} - Cantidad de items
   */
  obtenerCantidadItems: () => {
    const { carrito } = get()
    return carrito.reduce((total, item) => total + item.cantidad, 0)
  },
}))
