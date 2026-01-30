/**
 * Hook: usarPedidos
 * ==================
 * Maneja los pedidos de clientes (crear, listar, actualizar estado)
 */

'use client'

import { useState, useCallback } from 'react'
import { supabase, estaConfigurado } from '@/lib/base_datos/cliente_supabase'

export function usarPedidos() {
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Crear un nuevo pedido (usado por el cliente)
   * @param {Object} datosCliente - { nombre_cliente, telefono, notas }
   * @param {Array} carrito - Items del carrito
   * @param {number} total - Total del pedido
   */
  const crearPedido = useCallback(async (datosCliente, carrito, total) => {
    if (!estaConfigurado() || !supabase) {
      return { exito: false, error: 'Sistema no disponible' }
    }

    try {
      // 1. Crear el pedido
      const { data: pedido, error: errorPedido } = await supabase
        .from('pedidos')
        .insert({
          nombre_cliente: datosCliente.nombre,
          telefono: datosCliente.telefono,
          notas: datosCliente.notas || '',
          total: total,
          estado: 'pendiente'
        })
        .select()
        .single()

      if (errorPedido) throw errorPedido

      // 2. Crear los detalles del pedido
      const detalles = carrito.map(item => ({
        pedido_id: pedido.id,
        variante_id: item.variante_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_venta,
        subtotal: item.precio_venta * item.cantidad
      }))

      const { error: errorDetalles } = await supabase
        .from('detalle_pedido')
        .insert(detalles)

      if (errorDetalles) throw errorDetalles

      return { exito: true, pedidoId: pedido.id }

    } catch (err) {
      console.error('Error al crear pedido:', err)
      return { exito: false, error: err.message }
    }
  }, [])

  /**
   * Obtener todos los pedidos (para el vendedor)
   * @param {string} estado - Filtrar por estado (opcional)
   */
  const obtenerPedidos = useCallback(async (estado = null) => {
    if (!estaConfigurado() || !supabase) return []

    setCargando(true)
    setError(null)

    try {
      let query = supabase
        .from('pedidos')
        .select(`
          *,
          detalle_pedido (
            *,
            variantes:variantes_producto (
              talla,
              color,
              productos (nombre)
            )
          )
        `)
        .order('creado_en', { ascending: false })

      if (estado) {
        query = query.eq('estado', estado)
      }

      const { data, error: errorConsulta } = await query

      if (errorConsulta) throw errorConsulta

      setPedidos(data || [])
      return { exito: true, datos: data || [] }

    } catch (err) {
      setError(err.message)
      return { exito: false, error: err.message }
    } finally {
      setCargando(false)
    }
  }, [])

  /**
   * Obtener cantidad de pedidos pendientes (para notificaciones/badge)
   */
  const obtenerPedidosPendientes = useCallback(async () => {
    if (!estaConfigurado() || !supabase) return { exito: false, cantidad: 0 }

    try {
      const { count, error } = await supabase
        .from('pedidos')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'pendiente')

      if (error) throw error

      return { exito: true, cantidad: count || 0 }
    } catch (err) {
      return { exito: false, cantidad: 0 }
    }
  }, [])

  /**
   * Actualizar estado de un pedido
   * @param {string} pedidoId - ID del pedido
   * @param {string} nuevoEstado - pendiente | confirmado | entregado | cancelado
   */
  const actualizarEstado = useCallback(async (pedidoId, nuevoEstado) => {
    if (!estaConfigurado() || !supabase) {
      return { exito: false, error: 'Sistema no disponible' }
    }

    try {
      const actualizacion = { estado: nuevoEstado }
      
      // Si se marca como entregado, registrar fecha
      if (nuevoEstado === 'entregado') {
        actualizacion.fecha_entrega = new Date().toISOString()
      }

      const { error } = await supabase
        .from('pedidos')
        .update(actualizacion)
        .eq('id', pedidoId)

      if (error) throw error

      // Actualizar lista local
      setPedidos(prev => prev.map(p => 
        p.id === pedidoId ? { ...p, ...actualizacion } : p
      ))

      return { exito: true }

    } catch (err) {
      return { exito: false, error: err.message }
    }
  }, [])

  /**
   * Confirmar pedido y descontar stock
   */
  const confirmarPedido = useCallback(async (pedidoId) => {
    if (!estaConfigurado() || !supabase) {
      return { exito: false, error: 'Sistema no disponible' }
    }

    try {
      // Obtener detalles del pedido
      const { data: detalles } = await supabase
        .from('detalle_pedido')
        .select('variante_id, cantidad')
        .eq('pedido_id', pedidoId)

      // Descontar stock de cada variante
      for (const item of detalles) {
        const { data: variante } = await supabase
          .from('variantes_producto')
          .select('stock_actual')
          .eq('id', item.variante_id)
          .single()

        await supabase
          .from('variantes_producto')
          .update({ stock_actual: variante.stock_actual - item.cantidad })
          .eq('id', item.variante_id)
      }

      // Actualizar estado del pedido
      await actualizarEstado(pedidoId, 'confirmado')

      return { exito: true }

    } catch (err) {
      return { exito: false, error: err.message }
    }
  }, [actualizarEstado])

  return {
    pedidos,
    cargando,
    error,
    crearPedido,
    obtenerPedidos,
    obtenerPedidosPendientes,
    actualizarEstado,
    confirmarPedido,
  }
}
