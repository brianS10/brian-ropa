/**
 * Página: Editar Stock
 * =====================
 * Permite modificar rápidamente el stock de las variantes de un producto
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save, Plus, Minus } from 'lucide-react'
import Link from 'next/link'
import { supabase, estaConfigurado } from '@/lib/base_datos/cliente_supabase'
import BotonPrimario from '@/componentes/ui/BotonPrimario'
import { formatearMoneda } from '@/lib/utilidades'

export default function PaginaEditarStock() {
  const router = useRouter()
  const params = useParams()
  const productoId = params.id

  const [producto, setProducto] = useState(null)
  const [variantes, setVariantes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' })

  // Cargar producto y variantes
  useEffect(() => {
    async function cargar() {
      if (!estaConfigurado() || !supabase) {
        setMensaje({ tipo: 'error', texto: 'Supabase no configurado' })
        setCargando(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('productos')
          .select(`*, variantes_producto (*)`)
          .eq('id', productoId)
          .single()

        if (error) throw error

        setProducto(data)
        setVariantes(data.variantes_producto || [])
      } catch (error) {
        setMensaje({ tipo: 'error', texto: error.message })
      } finally {
        setCargando(false)
      }
    }

    if (productoId) cargar()
  }, [productoId])

  // Modificar stock
  const modificarStock = (varianteId, cambio) => {
    setVariantes(variantes.map(v => {
      if (v.id === varianteId) {
        const nuevoStock = Math.max(0, v.stock_actual + cambio)
        return { ...v, stock_actual: nuevoStock, modificado: true }
      }
      return v
    }))
  }

  // Establecer stock directo
  const establecerStock = (varianteId, valor) => {
    const nuevoStock = Math.max(0, parseInt(valor) || 0)
    setVariantes(variantes.map(v => {
      if (v.id === varianteId) {
        return { ...v, stock_actual: nuevoStock, modificado: true }
      }
      return v
    }))
  }

  // Guardar cambios
  const guardarCambios = async () => {
    if (!estaConfigurado() || !supabase) return

    setGuardando(true)
    setMensaje({ tipo: '', texto: '' })

    try {
      const variantesModificadas = variantes.filter(v => v.modificado)

      for (const variante of variantesModificadas) {
        const { error } = await supabase
          .from('variantes_producto')
          .update({ stock_actual: variante.stock_actual })
          .eq('id', variante.id)

        if (error) throw error
      }

      setMensaje({ tipo: 'exito', texto: '¡Stock actualizado!' })
      
      // Limpiar bandera de modificado
      setVariantes(variantes.map(v => ({ ...v, modificado: false })))

    } catch (error) {
      setMensaje({ tipo: 'error', texto: error.message })
    } finally {
      setGuardando(false)
    }
  }

  const hayModificaciones = variantes.some(v => v.modificado)

  if (cargando) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/2"></div>
          <div className="h-32 bg-slate-200 rounded"></div>
        </div>
      </div>
    )
  }

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
            Editar Stock
          </h1>
          <p className="text-sm text-slate-500">{producto?.nombre}</p>
        </div>
      </header>

      {/* Mensaje */}
      {mensaje.texto && (
        <div className={`mb-4 p-3 rounded-lg ${
          mensaje.tipo === 'error' 
            ? 'bg-red-100 text-red-700'
            : 'bg-green-100 text-green-700'
        }`}>
          {mensaje.texto}
        </div>
      )}

      {/* Lista de variantes */}
      <div className="space-y-3">
        {variantes.map((variante) => (
          <div 
            key={variante.id}
            className={`bg-white dark:bg-slate-800 rounded-xl border p-4 ${
              variante.modificado 
                ? 'border-blue-500' 
                : 'border-slate-200 dark:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="font-semibold text-slate-900 dark:text-white">
                  Talla {variante.talla}
                </span>
                <span className="text-slate-500 ml-2">· {variante.color}</span>
              </div>
              <span className="text-sm text-slate-500">
                {formatearMoneda(variante.precio_venta)}
              </span>
            </div>

            {/* Control de stock */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => modificarStock(variante.id, -1)}
                className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-colors"
              >
                <Minus className="w-6 h-6" />
              </button>
              
              <input
                type="number"
                value={variante.stock_actual}
                onChange={(e) => establecerStock(variante.id, e.target.value)}
                className="w-20 h-12 text-center text-2xl font-bold rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
              />
              
              <button
                onClick={() => modificarStock(variante.id, 1)}
                className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200 transition-colors"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Botón Guardar */}
      {hayModificaciones && (
        <div className="fixed bottom-20 left-0 right-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
          <BotonPrimario
            onClick={guardarCambios}
            cargando={guardando}
            icono={Save}
            className="w-full"
            tamanio="lg"
          >
            Guardar Cambios
          </BotonPrimario>
        </div>
      )}
    </div>
  )
}
