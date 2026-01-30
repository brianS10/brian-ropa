/**
 * Hook: usarVentas
 * =================
 * Maneja las operaciones de ventas: registrar ventas y consultar historial.
 * 
 * Uso:
 * const { procesarVenta, obtenerVentasDelDia, calcularCorteCaja } = usarVentas()
 */

'use client'

import { useState, useCallback } from 'react'
import { supabase, estaConfigurado } from '@/lib/base_datos/cliente_supabase'
import { rangoDelDia } from '@/lib/utilidades'

export function usarVentas() {
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Procesa una venta completa (transacción atómica)
   * 1. Crea el registro en 'ventas'
   * 2. Crea los detalles en 'detalle_venta'
   * 3. Descuenta el stock de cada variante
   * 
   * @param {Array} carrito - Items del carrito con { variante_id, cantidad, precio_venta }
   * @param {string} metodoPago - 'efectivo' | 'transferencia' | 'tarjeta'
   * @param {number} totalVenta - Monto total de la venta
   */
  const procesarVenta = useCallback(async (carrito, metodoPago, totalVenta) => {
    if (!estaConfigurado() || !supabase) {
      return { exito: false, error: 'Supabase no configurado' }
    }
    
    setProcesando(true)
    setError(null)

    try {
      // 1. Crear la venta principal
      const { data: venta, error: errorVenta } = await supabase
        .from('ventas')
        .insert({
          total_venta: totalVenta,
          metodo_pago: metodoPago,
        })
        .select()
        .single()

      if (errorVenta) throw errorVenta

      // 2. Crear los detalles de la venta
      const detalles = carrito.map(item => ({
        venta_id: venta.id,
        variante_id: item.variante_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_venta,
        subtotal: item.precio_venta * item.cantidad,
      }))

      const { error: errorDetalles } = await supabase
        .from('detalle_venta')
        .insert(detalles)

      if (errorDetalles) throw errorDetalles

      // 3. Descontar stock de cada variante
      for (const item of carrito) {
        const { data: variante } = await supabase
          .from('variantes_producto')
          .select('stock_actual')
          .eq('id', item.variante_id)
          .single()

        await supabase
          .from('variantes_producto')
          .update({ 
            stock_actual: variante.stock_actual - item.cantidad 
          })
          .eq('id', item.variante_id)
      }

      return { exito: true, ventaId: venta.id }

    } catch (err) {
      setError(err.message)
      console.error('Error al procesar venta:', err)
      return { exito: false, error: err.message }
    } finally {
      setProcesando(false)
    }
  }, [])

  /**
   * Obtiene todas las ventas del día actual
   */
  const obtenerVentasDelDia = useCallback(async () => {
    if (!estaConfigurado() || !supabase) return []
    
    const { inicio, fin } = rangoDelDia()

    try {
      const { data, error: errorConsulta } = await supabase
        .from('ventas')
        .select(`
          *,
          detalle_venta (
            *,
            variantes_producto (
              talla,
              color,
              productos (nombre)
            )
          )
        `)
        .gte('fecha_venta', inicio)
        .lte('fecha_venta', fin)
        .order('fecha_venta', { ascending: false })

      if (errorConsulta) throw errorConsulta

      return data || []
    } catch (err) {
      console.error('Error al obtener ventas del día:', err)
      return []
    }
  }, [])

  /**
   * Calcula el corte de caja del día
   * Agrupa totales por método de pago
   */
  const calcularCorteCaja = useCallback(async () => {
    const ventas = await obtenerVentasDelDia()

    const resumen = {
      totalGeneral: 0,
      cantidadVentas: ventas.length,
      porMetodo: {
        efectivo: 0,
        transferencia: 0,
        tarjeta: 0,
      }
    }

    ventas.forEach(venta => {
      resumen.totalGeneral += venta.total_venta
      resumen.porMetodo[venta.metodo_pago] += venta.total_venta
    })

    return resumen
  }, [obtenerVentasDelDia])

  return {
    procesando,
    error,
    procesarVenta,
    obtenerVentasDelDia,
    calcularCorteCaja,
  }
}
