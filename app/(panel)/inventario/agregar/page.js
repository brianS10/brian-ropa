/**
 * Página: Agregar Producto
 * =========================
 * Formulario para crear un nuevo producto con sus variantes (tallas/colores)
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react'
import Link from 'next/link'
import { supabase, estaConfigurado } from '@/lib/base_datos/cliente_supabase'
import BotonPrimario from '@/componentes/ui/BotonPrimario'
import EntradaTexto from '@/componentes/ui/EntradaTexto'
import SubirImagen from '@/componentes/SubirImagen'
import { CATEGORIAS, TALLAS_ESTANDAR, COLORES_ROPA, TIPOS_PRODUCTO, CATEGORIAS_POR_TIPO, TAMANOS_PERFUMES, EDADES_JUGUETES } from '@/lib/constantes'

export default function PaginaAgregarProducto() {
  const router = useRouter()
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' })
  
  // Estado del producto
  const [producto, setProducto] = useState({
    nombre: '',
    descripcion: '',
    tipo_producto: 'ropa',
    categoria: 'Pantalones',
  })

  // Estado de las imágenes
  const [imagenes, setImagenes] = useState([])

  // Estado de las variantes (tallas)
  const [variantes, setVariantes] = useState([
    { talla: '30', color: 'Negro', precio_venta: '', precio_costo: '', stock_actual: '' }
  ])

  // Obtener variante por defecto según tipo
  const obtenerVarianteDefault = (tipo) => {
    switch(tipo) {
      case 'perfumes':
        return { talla: '100ml', color: '', precio_venta: '', precio_costo: '', stock_actual: '' }
      case 'juguetes':
        return { talla: 'Todas las edades', color: '', precio_venta: '', precio_costo: '', stock_actual: '' }
      default:
        return { talla: '30', color: 'Negro', precio_venta: '', precio_costo: '', stock_actual: '' }
    }
  }

  // Cambiar tipo de producto
  const cambiarTipoProducto = (nuevoTipo) => {
    setProducto({ 
      ...producto, 
      tipo_producto: nuevoTipo,
      categoria: CATEGORIAS_POR_TIPO[nuevoTipo]?.[1]?.valor || 'otros'
    })
    // Resetear variantes al cambiar tipo
    setVariantes([obtenerVarianteDefault(nuevoTipo)])
  }

  // Agregar nueva variante
  const agregarVariante = () => {
    const nuevaVariante = obtenerVarianteDefault(producto.tipo_producto)
    nuevaVariante.precio_venta = variantes[0]?.precio_venta || ''
    nuevaVariante.precio_costo = variantes[0]?.precio_costo || ''
    setVariantes([...variantes, nuevaVariante])
  }

  // Eliminar variante
  const eliminarVariante = (indice) => {
    if (variantes.length > 1) {
      setVariantes(variantes.filter((_, i) => i !== indice))
    }
  }

  // Actualizar variante
  const actualizarVariante = (indice, campo, valor) => {
    const nuevasVariantes = [...variantes]
    nuevasVariantes[indice] = { ...nuevasVariantes[indice], [campo]: valor }
    setVariantes(nuevasVariantes)
  }

  // Agregar múltiples tallas rápidamente
  const agregarTallasRapido = () => {
    const tallasBase = ['28', '30', '32', '34', '36']
    const precioBase = variantes[0]?.precio_venta || '350'
    const costoBase = variantes[0]?.precio_costo || '180'
    const colorBase = variantes[0]?.color || 'Negro'
    
    const nuevasVariantes = tallasBase.map(talla => ({
      talla,
      color: colorBase,
      precio_venta: precioBase,
      precio_costo: costoBase,
      stock_actual: '5'
    }))
    
    setVariantes(nuevasVariantes)
  }

  // Guardar producto
  const guardarProducto = async () => {
    // Validaciones
    if (!producto.nombre.trim()) {
      setMensaje({ tipo: 'error', texto: 'El nombre del producto es requerido' })
      return
    }

    if (variantes.some(v => !v.precio_venta || !v.stock_actual)) {
      setMensaje({ tipo: 'error', texto: 'Todas las variantes necesitan precio y stock' })
      return
    }

    if (!estaConfigurado() || !supabase) {
      setMensaje({ tipo: 'error', texto: 'Supabase no está configurado' })
      return
    }

    setGuardando(true)
    setMensaje({ tipo: '', texto: '' })

    try {
      // 1. Crear el producto con imágenes
      const { data: productoCreado, error: errorProducto } = await supabase
        .from('productos')
        .insert({
          nombre: producto.nombre,
          descripcion: producto.descripcion,
          categoria: producto.categoria,
          tipo_producto: producto.tipo_producto,
          imagen_url: imagenes[0] || null, // Imagen principal
          imagenes: imagenes, // Array de todas las imágenes
        })
        .select()
        .single()

      if (errorProducto) throw errorProducto

      // 2. Crear las variantes
      const variantesParaInsertar = variantes.map(v => ({
        producto_id: productoCreado.id,
        talla: v.talla,
        color: v.color,
        precio_venta: parseFloat(v.precio_venta),
        precio_costo: parseFloat(v.precio_costo) || 0,
        stock_actual: parseInt(v.stock_actual),
        stock_minimo: 2,
      }))

      const { error: errorVariantes } = await supabase
        .from('variantes_producto')
        .insert(variantesParaInsertar)

      if (errorVariantes) throw errorVariantes

      setMensaje({ tipo: 'exito', texto: '¡Producto guardado exitosamente!' })
      
      // Redirigir después de 1.5 segundos
      setTimeout(() => {
        router.push('/inventario')
      }, 1500)

    } catch (error) {
      console.error('Error al guardar:', error)
      setMensaje({ tipo: 'error', texto: error.message })
    } finally {
      setGuardando(false)
    }
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
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          Agregar Producto
        </h1>
      </header>

      {/* Mensaje de estado */}
      {mensaje.texto && (
        <div className={`mb-4 p-3 rounded-lg ${
          mensaje.tipo === 'error' 
            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
        }`}>
          {mensaje.texto}
        </div>
      )}

      {/* Formulario del producto */}
      <div className="space-y-4 mb-6">
        <EntradaTexto
          etiqueta="Nombre del producto"
          placeholder={
            producto.tipo_producto === 'perfumes' ? 'Ej: Perfume Acqua Di Gio 100ml' :
            producto.tipo_producto === 'juguetes' ? 'Ej: Peluche Oso Gigante' :
            'Ej: Jeans Slim Fit Azul'
          }
          value={producto.nombre}
          onChange={(e) => setProducto({ ...producto, nombre: e.target.value })}
        />

        {/* Tipo de producto */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Tipo de producto
          </label>
          <div className="flex gap-2 flex-wrap">
            {TIPOS_PRODUCTO.map(tipo => (
              <button
                key={tipo.valor}
                type="button"
                onClick={() => cambiarTipoProducto(tipo.valor)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all border-2 ${
                  producto.tipo_producto === tipo.valor
                    ? `bg-gradient-to-r ${tipo.color} text-white border-transparent shadow-lg`
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}
              >
                <span className="text-xl">{tipo.emoji}</span>
                <span>{tipo.etiqueta}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Categoría
          </label>
          <select
            value={producto.categoria}
            onChange={(e) => setProducto({ ...producto, categoria: e.target.value })}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-slate-900 dark:text-white"
          >
            {(CATEGORIAS_POR_TIPO[producto.tipo_producto] || [])
              .filter(cat => cat.valor !== 'todos')
              .map(cat => (
                <option key={cat.valor} value={cat.valor}>
                  {cat.emoji} {cat.etiqueta}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Descripción (opcional)
          </label>
          <textarea
            placeholder="Detalles del producto..."
            value={producto.descripcion}
            onChange={(e) => setProducto({ ...producto, descripcion: e.target.value })}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-slate-900 dark:text-white h-20 resize-none"
          />
        </div>
      </div>

      {/* Sección de Imágenes */}
      <div className="mb-6">
        <SubirImagen
          imagenes={imagenes}
          onImagenesChange={setImagenes}
          maxImagenes={10}
        />
      </div>

      {/* Sección de Variantes */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-900 dark:text-white">
            {producto.tipo_producto === 'ropa' ? '👖 Tallas y Stock' : 
             producto.tipo_producto === 'perfumes' ? '🧴 Tamaños y Stock' : '🧸 Opciones y Stock'}
          </h2>
          {producto.tipo_producto === 'ropa' && (
            <button
              type="button"
              onClick={agregarTallasRapido}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              + Agregar tallas 28-36
            </button>
          )}
        </div>

        <div className="space-y-3">
          {variantes.map((variante, indice) => (
            <div 
              key={indice}
              className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {producto.tipo_producto === 'ropa' ? `Talla #${indice + 1}` : 
                   producto.tipo_producto === 'perfumes' ? `Tamaño #${indice + 1}` : `Opción #${indice + 1}`}
                </span>
                {variantes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => eliminarVariante(indice)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* ROPA: Talla y Color */}
              {producto.tipo_producto === 'ropa' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-slate-500">Talla</label>
                    <select
                      value={variante.talla}
                      onChange={(e) => actualizarVariante(indice, 'talla', e.target.value)}
                      className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-2 py-1.5 text-sm"
                    >
                      {TALLAS_ESTANDAR.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Color</label>
                    <select
                      value={variante.color}
                      onChange={(e) => actualizarVariante(indice, 'color', e.target.value)}
                      className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-2 py-1.5 text-sm"
                    >
                      {COLORES_ROPA.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* PERFUMES: Tamaño */}
              {producto.tipo_producto === 'perfumes' && (
                <div>
                  <label className="text-xs text-slate-500">Tamaño</label>
                  <select
                    value={variante.talla}
                    onChange={(e) => actualizarVariante(indice, 'talla', e.target.value)}
                    className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-2 py-1.5 text-sm"
                  >
                    {TAMANOS_PERFUMES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* JUGUETES: Edad recomendada */}
              {producto.tipo_producto === 'juguetes' && (
                <div>
                  <label className="text-xs text-slate-500">Edad recomendada</label>
                  <select
                    value={variante.talla}
                    onChange={(e) => actualizarVariante(indice, 'talla', e.target.value)}
                    className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-2 py-1.5 text-sm"
                  >
                    {EDADES_JUGUETES.map(e => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-slate-500">Precio venta $</label>
                  <input
                    type="number"
                    placeholder="350"
                    value={variante.precio_venta}
                    onChange={(e) => actualizarVariante(indice, 'precio_venta', e.target.value)}
                    className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-2 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Costo $</label>
                  <input
                    type="number"
                    placeholder="180"
                    value={variante.precio_costo}
                    onChange={(e) => actualizarVariante(indice, 'precio_costo', e.target.value)}
                    className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-2 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Stock</label>
                  <input
                    type="number"
                    placeholder="10"
                    value={variante.stock_actual}
                    onChange={(e) => actualizarVariante(indice, 'stock_actual', e.target.value)}
                    className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-2 py-1.5 text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={agregarVariante}
          className="mt-3 w-full py-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-slate-500 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {producto.tipo_producto === 'ropa' ? 'Agregar otra talla' : 
           producto.tipo_producto === 'perfumes' ? 'Agregar otro tamaño' : 'Agregar otra opción'}
        </button>
      </div>

      {/* Botón Guardar */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
        <BotonPrimario
          onClick={guardarProducto}
          cargando={guardando}
          icono={Save}
          className="w-full"
          tamanio="lg"
        >
          Guardar Producto
        </BotonPrimario>
      </div>
    </div>
  )
}
