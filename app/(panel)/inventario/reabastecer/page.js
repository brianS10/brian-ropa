/**
 * Página: Reabastecer Stock
 * ==========================
 * Permite agregar stock rápidamente cuando llega nueva mercancía
 */

'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Package, Check } from 'lucide-react'
import Link from 'next/link'
import { supabase, estaConfigurado } from '@/lib/base_datos/cliente_supabase'
import BotonPrimario from '@/componentes/ui/BotonPrimario'
import { formatearMoneda } from '@/lib/utilidades'

export default function PaginaReabastecer() {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [cantidades, setCantidades] = useState({})
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' })

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
        .eq('estado', true)
        .order('nombre')

      setProductos(data || [])
      setCargando(false)
    }
    cargar()
  }, [])

  // Actualizar cantidad a agregar
  const actualizarCantidad = (varianteId, valor) => {
    const cantidad = Math.max(0, parseInt(valor) || 0)
    setCantidades(prev => ({
      ...prev,
      [varianteId]: cantidad
    }))
  }

  // Guardar reabastecimiento
  const guardarReabastecimiento = async () => {
    if (!estaConfigurado() || !supabase) return

    const variantesAActualizar = Object.entries(cantidades)
      .filter(([_, cantidad]) => cantidad > 0)

    if (variantesAActualizar.length === 0) {
      setMensaje({ tipo: 'error', texto: 'Ingresa al menos una cantidad' })
      return
    }

    setGuardando(true)
    setMensaje({ tipo: '', texto: '' })

    try {
      for (const [varianteId, cantidadAgregar] of variantesAActualizar) {
        // Obtener stock actual
        const { data: variante } = await supabase
          .from('variantes_producto')
          .select('stock_actual')
          .eq('id', varianteId)
          .single()

        // Actualizar con el nuevo total
        await supabase
          .from('variantes_producto')
          .update({ stock_actual: variante.stock_actual + cantidadAgregar })
          .eq('id', varianteId)
      }

      setMensaje({ tipo: 'exito', texto: `¡Stock actualizado! (${variantesAActualizar.length} variantes)` })
      setCantidades({})

      // Recargar productos
      const { data } = await supabase
        .from('productos')
        .select(`*, variantes_producto (*)`)
        .eq('estado', true)
        .order('nombre')
      setProductos(data || [])

    } catch (error) {
      setMensaje({ tipo: 'error', texto: error.message })
    } finally {
      setGuardando(false)
    }
  }

  const totalUnidadesAgregar = Object.values(cantidades).reduce((a, b) => a + b, 0)

  return (
    <div className="p-4 pb-24">
      {/* Encabezado */}
      <header className="flex items-center gap-3 mb-6">
        <Link 
          href="/inventario"
          className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Reabastecer Stock
          </h1>
          <p className="text-sm text-slate-500">Agrega mercancía nueva</p>
        </div>
      </header>

      {/* Mensaje */}
      {mensaje.texto && (
        <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
          mensaje.tipo === 'error' 
            ? 'bg-red-100 text-red-700'
            : 'bg-green-100 text-green-700'
        }`}>
          {mensaje.tipo === 'exito' && <Check className="w-5 h-5" />}
          {mensaje.texto}
        </div>
      )}

      {/* Lista de productos */}
      {cargando ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-slate-200 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {productos.map(producto => (
            <div 
              key={producto.id}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                  👖
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white flex-1">
                  {producto.nombre}
                </h3>
              </div>

              {/* Variantes */}
              <div className="space-y-2">
                {producto.variantes_producto?.map(variante => (
                  <div 
                    key={variante.id}
                    className="flex items-center gap-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2"
                  >
                    <div className="flex-1">
                      <span className="font-medium">T{variante.talla}</span>
                      <span className="text-slate-500 text-sm ml-2">
                        Stock: {variante.stock_actual}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-500">+</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={cantidades[variante.id] || ''}
                        onChange={(e) => actualizarCantidad(variante.id, e.target.value)}
                        className="w-16 h-9 text-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Botón flotante para guardar */}
      {totalUnidadesAgregar > 0 && (
        <div className="fixed bottom-20 left-0 right-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
          <BotonPrimario
            onClick={guardarReabastecimiento}
            cargando={guardando}
            icono={Package}
            className="w-full"
            tamanio="lg"
          >
            Agregar {totalUnidadesAgregar} unidades
          </BotonPrimario>
        </div>
      )}
    </div>
  )
}
