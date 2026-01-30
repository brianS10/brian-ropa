/**
 * Hook: usarInventario
 * =====================
 * Maneja la comunicación con Supabase para operaciones de inventario.
 * Incluye funciones para obtener productos, variantes y actualizar stock.
 * 
 * Uso:
 * const { productos, cargando, obtenerProductos, obtenerVariantes } = usarInventario()
 */

'use client'

import { useState, useCallback } from 'react'
import { supabase, estaConfigurado } from '@/lib/base_datos/cliente_supabase'

export function usarInventario() {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Obtiene todos los productos con sus variantes
   * Agrupa las variantes dentro de cada producto
   */
  const obtenerProductos = useCallback(async () => {
    // Si Supabase no está configurado, retornar vacío
    if (!estaConfigurado() || !supabase) {
      setError('Supabase no está configurado. Edita .env.local')
      return []
    }

    setCargando(true)
    setError(null)

    try {
      const { data, error: errorConsulta } = await supabase
        .from('productos')
        .select(`
          *,
          variantes_producto (*)
        `)
        .eq('estado', true)
        .order('nombre')

      if (errorConsulta) throw errorConsulta

      setProductos(data || [])
      return data
    } catch (err) {
      setError(err.message)
      console.error('Error al obtener productos:', err)
      return []
    } finally {
      setCargando(false)
    }
  }, [])

  /**
   * Obtiene las variantes de un producto específico
   * @param {string} productoId - UUID del producto
   */
  const obtenerVariantes = useCallback(async (productoId) => {
    if (!estaConfigurado() || !supabase) return []
    
    try {
      const { data, error: errorConsulta } = await supabase
        .from('variantes_producto')
        .select('*')
        .eq('producto_id', productoId)
        .order('talla')

      if (errorConsulta) throw errorConsulta

      return data || []
    } catch (err) {
      console.error('Error al obtener variantes:', err)
      return []
    }
  }, [])

  /**
   * Actualiza el stock de una variante específica
   * @param {string} varianteId - UUID de la variante
   * @param {number} cantidadVendida - Cantidad a restar del stock
   */
  const descontarStock = useCallback(async (varianteId, cantidadVendida) => {
    if (!estaConfigurado() || !supabase) {
      return { exito: false, error: 'Supabase no configurado' }
    }
    
    try {
      // Primero obtenemos el stock actual
      const { data: variante, error: errorLectura } = await supabase
        .from('variantes_producto')
        .select('stock_actual')
        .eq('id', varianteId)
        .single()

      if (errorLectura) throw errorLectura

      const nuevoStock = variante.stock_actual - cantidadVendida

      // Actualizamos con el nuevo valor
      const { error: errorUpdate } = await supabase
        .from('variantes_producto')
        .update({ stock_actual: nuevoStock })
        .eq('id', varianteId)

      if (errorUpdate) throw errorUpdate

      return { exito: true, nuevoStock }
    } catch (err) {
      console.error('Error al descontar stock:', err)
      return { exito: false, error: err.message }
    }
  }, [])

  /**
   * Busca productos por nombre o categoría
   * @param {string} termino - Término de búsqueda
   */
  const buscarProductos = useCallback(async (termino) => {
    if (!estaConfigurado() || !supabase) return []
    
    if (!termino.trim()) {
      return obtenerProductos()
    }

    setCargando(true)
    try {
      const { data, error: errorConsulta } = await supabase
        .from('productos')
        .select(`
          *,
          variantes_producto (*)
        `)
        .eq('estado', true)
        .ilike('nombre', `%${termino}%`)

      if (errorConsulta) throw errorConsulta

      setProductos(data || [])
      return data
    } catch (err) {
      setError(err.message)
      return []
    } finally {
      setCargando(false)
    }
  }, [obtenerProductos])

  return {
    productos,
    cargando,
    error,
    obtenerProductos,
    obtenerVariantes,
    descontarStock,
    buscarProductos,
  }
}
