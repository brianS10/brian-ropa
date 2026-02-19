/**
 * Página: Arreglar Datos
 * =======================
 * Herramienta para corregir registros que tienen campos faltantes o vacíos
 */

'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Wrench, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { supabase, estaConfigurado } from '@/lib/base_datos/cliente_supabase'
import BotonPrimario from '@/componentes/ui/BotonPrimario'

export default function PaginaArreglarDatos() {
  const [cargando, setCargando] = useState(true)
  const [procesando, setProcesando] = useState(false)
  const [productos, setProductos] = useState([])
  const [variantes, setVariantes] = useState([])
  const [problemas, setProblemas] = useState([])
  const [resultados, setResultados] = useState([])

  // Cargar datos
  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    if (!estaConfigurado() || !supabase) {
      setCargando(false)
      return
    }

    setCargando(true)
    setProblemas([])

    try {
      // Cargar todos los productos
      const { data: prods, error: errorProds } = await supabase
        .from('productos')
        .select('*')

      if (errorProds) throw errorProds

      // Cargar todas las variantes
      const { data: vars, error: errorVars } = await supabase
        .from('variantes_producto')
        .select('*')

      if (errorVars) throw errorVars

      setProductos(prods || [])
      setVariantes(vars || [])

      // Detectar problemas
      const problemasDetectados = []

      // Verificar productos
      for (const prod of (prods || [])) {
        const problemasProd = []

        // Campos que pueden faltar en productos
        if (!prod.tipo_producto) {
          problemasProd.push('Sin tipo_producto (se asignará "ropa")')
        }
        if (!prod.categoria) {
          problemasProd.push('Sin categoría (se asignará "General")')
        }
        if (prod.estado === undefined || prod.estado === null) {
          problemasProd.push('Sin estado (se asignará true)')
        }
        if (!prod.imagenes) {
          problemasProd.push('Sin array de imágenes')
        }
        if (prod.descuento === undefined) {
          problemasProd.push('Sin campo descuento')
        }

        if (problemasProd.length > 0) {
          problemasDetectados.push({
            tipo: 'producto',
            id: prod.id,
            nombre: prod.nombre,
            problemas: problemasProd
          })
        }
      }

      // Verificar variantes
      for (const variante of (vars || [])) {
        const problemasVar = []

        if (!variante.talla) {
          problemasVar.push('Sin talla (se asignará "Única")')
        }
        if (variante.color === 'Sin especificar') {
          problemasVar.push('Color "Sin especificar" (se limpiará)')
        }
        if (variante.stock_actual === undefined || variante.stock_actual === null) {
          problemasVar.push('Sin stock_actual (se asignará 0)')
        }
        if (!variante.precio_venta || variante.precio_venta <= 0) {
          problemasVar.push('Sin precio_venta válido')
        }

        if (problemasVar.length > 0) {
          const prodRelacionado = (prods || []).find(p => p.id === variante.producto_id)
          problemasDetectados.push({
            tipo: 'variante',
            id: variante.id,
            nombre: `Variante de "${prodRelacionado?.nombre || 'Producto desconocido'}" - ${variante.talla || 'Sin talla'}`,
            problemas: problemasVar
          })
        }
      }

      setProblemas(problemasDetectados)

    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setCargando(false)
    }
  }

  // Arreglar todos los problemas
  const arreglarTodo = async () => {
    if (!estaConfigurado() || !supabase) return

    setProcesando(true)
    setResultados([])
    const resultadosNuevos = []

    try {
      // Arreglar productos
      for (const prod of productos) {
        const actualizaciones = {}
        let necesitaActualizar = false

        if (!prod.tipo_producto) {
          actualizaciones.tipo_producto = 'ropa'
          necesitaActualizar = true
        }
        if (!prod.categoria) {
          actualizaciones.categoria = 'General'
          necesitaActualizar = true
        }
        if (prod.estado === undefined || prod.estado === null) {
          actualizaciones.estado = true
          necesitaActualizar = true
        }
        if (!prod.imagenes) {
          actualizaciones.imagenes = prod.imagen_url ? [prod.imagen_url] : []
          necesitaActualizar = true
        }
        if (prod.descuento === undefined) {
          actualizaciones.descuento = null
          necesitaActualizar = true
        }

        if (necesitaActualizar) {
          const { error } = await supabase
            .from('productos')
            .update(actualizaciones)
            .eq('id', prod.id)

          if (error) {
            resultadosNuevos.push({
              tipo: 'error',
              mensaje: `Error en producto "${prod.nombre}": ${error.message}`
            })
          } else {
            resultadosNuevos.push({
              tipo: 'exito',
              mensaje: `✅ Producto "${prod.nombre}" arreglado`
            })
          }
        }
      }

      // Arreglar variantes
      for (const variante of variantes) {
        const actualizaciones = {}
        let necesitaActualizar = false

        if (!variante.talla) {
          actualizaciones.talla = 'Única'
          necesitaActualizar = true
        }
        if (variante.color === 'Sin especificar') {
          actualizaciones.color = ''
          necesitaActualizar = true
        }
        if (variante.stock_actual === undefined || variante.stock_actual === null) {
          actualizaciones.stock_actual = 0
          necesitaActualizar = true
        }

        if (necesitaActualizar) {
          const prod = productos.find(p => p.id === variante.producto_id)
          const { error } = await supabase
            .from('variantes_producto')
            .update(actualizaciones)
            .eq('id', variante.id)

          if (error) {
            resultadosNuevos.push({
              tipo: 'error',
              mensaje: `Error en variante de "${prod?.nombre || 'desconocido'}": ${error.message}`
            })
          } else {
            resultadosNuevos.push({
              tipo: 'exito',
              mensaje: `✅ Variante de "${prod?.nombre || 'desconocido'}" arreglada`
            })
          }
        }
      }

      if (resultadosNuevos.length === 0) {
        resultadosNuevos.push({
          tipo: 'info',
          mensaje: '👍 No había nada que arreglar'
        })
      }

      setResultados(resultadosNuevos)

      // Recargar datos
      await cargarDatos()

    } catch (error) {
      setResultados([{
        tipo: 'error',
        mensaje: `Error general: ${error.message}`
      }])
    } finally {
      setProcesando(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/inventario"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                Arreglar Datos
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Corregir registros con campos faltantes
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Resumen */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            📊 Resumen de la Base de Datos
          </h2>
          
          {cargando ? (
            <div className="flex items-center gap-2 text-slate-500">
              <RefreshCw className="w-5 h-5 animate-spin" />
              Analizando datos...
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-xl">
                <p className="text-2xl font-bold text-blue-600">{productos.length}</p>
                <p className="text-sm text-blue-600/70">Productos</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-xl">
                <p className="text-2xl font-bold text-purple-600">{variantes.length}</p>
                <p className="text-sm text-purple-600/70">Variantes</p>
              </div>
            </div>
          )}
        </div>

        {/* Problemas detectados */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {problemas.length > 0 ? '⚠️ Problemas Detectados' : '✅ Sin Problemas'}
            </h2>
            <button
              onClick={cargarDatos}
              disabled={cargando}
              className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1"
            >
              <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
              Reanalizar
            </button>
          </div>

          {!cargando && problemas.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
              <p className="text-lg font-semibold text-green-600">¡Todo está bien!</p>
              <p>No se detectaron problemas en los registros</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-auto">
              {problemas.map((problema, idx) => (
                <div 
                  key={idx}
                  className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl"
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-800 dark:text-amber-200">
                        {problema.tipo === 'producto' ? '📦' : '🏷️'} {problema.nombre}
                      </p>
                      <ul className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                        {problema.problemas.map((p, i) => (
                          <li key={i}>• {p}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Botón de arreglar */}
          {problemas.length > 0 && (
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
              <BotonPrimario
                onClick={arreglarTodo}
                cargando={procesando}
                className="w-full"
              >
                <Wrench className="w-5 h-5" />
                Arreglar Todos los Problemas ({problemas.length})
              </BotonPrimario>
            </div>
          )}
        </div>

        {/* Resultados */}
        {resultados.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              📋 Resultados
            </h2>
            <div className="space-y-2 max-h-60 overflow-auto">
              {resultados.map((resultado, idx) => (
                <div 
                  key={idx}
                  className={`p-2 rounded-lg text-sm ${
                    resultado.tipo === 'exito' 
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                      : resultado.tipo === 'error'
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                      : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  }`}
                >
                  {resultado.mensaje}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instrucciones */}
        <div className="bg-slate-100 dark:bg-slate-800/50 rounded-2xl p-6">
          <h3 className="font-bold text-slate-900 dark:text-white mb-3">
            💡 ¿Qué hace esta herramienta?
          </h3>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li>• <strong>tipo_producto</strong>: Si falta, asigna "ropa" por defecto</li>
            <li>• <strong>categoria</strong>: Si falta, asigna "General"</li>
            <li>• <strong>estado</strong>: Si falta, asigna "activo" (true)</li>
            <li>• <strong>imagenes</strong>: Convierte imagen_url a array si es necesario</li>
            <li>• <strong>descuento</strong>: Asigna null si no existe</li>
            <li>• <strong>talla</strong>: Si falta, asigna "Única"</li>
            <li>• <strong>color</strong>: Limpia "Sin especificar" a vacío</li>
            <li>• <strong>stock_actual</strong>: Si falta, asigna 0</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
