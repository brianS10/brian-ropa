/**
 * Página: Nueva Venta (Punto de Venta)
 * =====================================
 * Interfaz principal para registrar ventas rápidas.
 * Muestra productos, permite seleccionar tallas y procesar pago.
 */

'use client'

import { useEffect, useState } from 'react'
import { Search, CheckCircle } from 'lucide-react'
import { usarInventario } from '@/hooks/usarInventario'
import { usarVentas } from '@/hooks/usarVentas'
import { usarCarrito } from '@/hooks/usarCarrito'
import TarjetaProducto from '@/componentes/ui/TarjetaProducto'
import EntradaTexto from '@/componentes/ui/EntradaTexto'
import ResumenCarrito from '@/componentes/ventas/ResumenCarrito'
import SelectorMetodoPago from '@/componentes/ventas/SelectorMetodoPago'

export default function PaginaNuevaVenta() {
  const { productos, cargando, obtenerProductos, buscarProductos } = usarInventario()
  const { procesarVenta, procesando } = usarVentas()
  const { carrito, agregarProducto, limpiarCarrito, metodoPago } = usarCarrito()
  
  const [busqueda, setBusqueda] = useState('')
  const [ventaExitosa, setVentaExitosa] = useState(false)

  // Cargar productos al montar
  useEffect(() => {
    obtenerProductos()
  }, [obtenerProductos])

  // Buscar mientras escribe
  useEffect(() => {
    const temporizador = setTimeout(() => {
      if (busqueda) {
        buscarProductos(busqueda)
      } else {
        obtenerProductos()
      }
    }, 300)

    return () => clearTimeout(temporizador)
  }, [busqueda, buscarProductos, obtenerProductos])

  // Manejar selección de variante
  const manejarSeleccionVariante = (variante, producto) => {
    agregarProducto({
      variante_id: variante.id,
      producto_id: producto.id,
      nombre_producto: producto.nombre,
      talla: variante.talla,
      color: variante.color,
      precio_venta: variante.precio_venta,
    })
  }

  // Procesar la venta
  const manejarVenta = async (total) => {
    const resultado = await procesarVenta(carrito, metodoPago, total)
    
    if (resultado.exito) {
      setVentaExitosa(true)
      limpiarCarrito()
      
      // Recargar productos (para actualizar stock)
      obtenerProductos()
      
      // Ocultar mensaje después de 3 segundos
      setTimeout(() => setVentaExitosa(false), 3000)
    }
  }

  return (
    <div className="p-4">
      {/* Encabezado */}
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Nueva Venta
        </h1>
      </header>

      {/* Mensaje de éxito */}
      {ventaExitosa && (
        <div className="mb-4 p-4 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3 animate-pulse">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <span className="text-green-700 dark:text-green-400 font-medium">
            ¡Venta registrada exitosamente!
          </span>
        </div>
      )}

      {/* Buscador */}
      <div className="mb-4">
        <EntradaTexto
          placeholder="Buscar producto..."
          icono={Search}
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Lista de productos */}
        <div className="space-y-4">
          <h2 className="font-semibold text-slate-700 dark:text-slate-300">
            Productos
          </h2>
          
          {cargando ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              ))}
            </div>
          ) : productos.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p>No hay productos registrados</p>
              <p className="text-sm mt-1">
                Agrega productos desde el módulo de Inventario
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[50vh] overflow-y-auto">
              {productos.map((producto) => (
                <TarjetaProducto
                  key={producto.id}
                  producto={producto}
                  variantes={producto.variantes_producto}
                  onSeleccionarVariante={(variante) => 
                    manejarSeleccionVariante(variante, producto)
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* Panel del carrito */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <h2 className="font-semibold text-slate-700 dark:text-slate-300 mb-4">
            Carrito ({carrito.length})
          </h2>
          
          <SelectorMetodoPago />
          
          <div className="mt-4">
            <ResumenCarrito 
              onProcesarVenta={manejarVenta}
              procesando={procesando}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
