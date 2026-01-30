/**
 * Hook: usarCarritoCliente
 * =========================
 * Carrito de compras para clientes de la tienda online.
 * Persiste en localStorage para no perder el carrito.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const usarCarritoCliente = create(
  persist(
    (set, get) => ({
      // Estado
      carrito: [],

      /**
       * Agregar producto al carrito
       */
      agregarProducto: (producto) => set((state) => {
        const indice = state.carrito.findIndex(
          item => item.variante_id === producto.variante_id
        )

        if (indice >= 0) {
          // Ya existe: verificar stock disponible
          const carritoActualizado = [...state.carrito]
          const nuevoStock = carritoActualizado[indice].cantidad + 1
          
          if (nuevoStock <= producto.stock_disponible) {
            carritoActualizado[indice] = {
              ...carritoActualizado[indice],
              cantidad: nuevoStock
            }
          }
          return { carrito: carritoActualizado }
        }

        // Nuevo producto
        return { 
          carrito: [...state.carrito, { ...producto, cantidad: 1 }] 
        }
      }),

      /**
       * Quitar una unidad
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
       * Eliminar producto completamente
       */
      eliminarProducto: (varianteId) => set((state) => ({
        carrito: state.carrito.filter(item => item.variante_id !== varianteId)
      })),

      /**
       * Limpiar carrito
       */
      limpiarCarrito: () => set({ carrito: [] }),

      /**
       * Obtener total
       */
      obtenerTotal: () => {
        const { carrito } = get()
        return carrito.reduce((total, item) => 
          total + (item.precio_venta * item.cantidad), 0
        )
      },

      /**
       * Obtener cantidad de items
       */
      obtenerCantidadItems: () => {
        const { carrito } = get()
        return carrito.reduce((total, item) => total + item.cantidad, 0)
      },
    }),
    {
      name: 'carrito-cliente', // Nombre para localStorage
    }
  )
)
