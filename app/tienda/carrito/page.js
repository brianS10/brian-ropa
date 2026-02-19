/**
 * Página: Carrito del Cliente
 * ============================
 * Muestra los productos seleccionados y permite confirmar el pedido via WhatsApp
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag, MessageCircle } from 'lucide-react'
import { usarCarritoCliente } from '@/hooks/usarCarritoCliente'
import { usarPedidos } from '@/hooks/usarPedidos'
import { formatearMoneda } from '@/lib/utilidades'
import { WHATSAPP_VENDEDOR } from '@/lib/constantes'
import BotonPrimario from '@/componentes/ui/BotonPrimario'
import EntradaTexto from '@/componentes/ui/EntradaTexto'

export default function PaginaCarrito() {
  const router = useRouter()
  const { 
    carrito, 
    agregarProducto, 
    quitarProducto, 
    eliminarProducto, 
    limpiarCarrito,
    obtenerTotal 
  } = usarCarritoCliente()
  const { crearPedido } = usarPedidos()

  const [paso, setPaso] = useState('carrito') // carrito | datos | confirmacion
  const [enviando, setEnviando] = useState(false)
  const [pedidoId, setPedidoId] = useState(null)
  const [datosCliente, setDatosCliente] = useState({
    nombre: '',
    telefono: '',
    notas: ''
  })
  const [error, setError] = useState('')

  const total = obtenerTotal()

  // Generar mensaje de WhatsApp con el pedido
  const generarMensajeWhatsApp = (pedidoId) => {
    let mensaje = `🛒 *NUEVO PEDIDO*\n`
    mensaje += `━━━━━━━━━━━━━━━━━━\n\n`
    mensaje += `👤 *Cliente:* ${datosCliente.nombre}\n`
    mensaje += `📱 *Teléfono:* ${datosCliente.telefono}\n`
    if (datosCliente.notas) {
      mensaje += `📝 *Notas:* ${datosCliente.notas}\n`
    }
    mensaje += `\n📦 *PRODUCTOS:*\n`
    mensaje += `━━━━━━━━━━━━━━━━━━\n`
    
    carrito.forEach((item, index) => {
      mensaje += `\n${index + 1}. *${item.nombre_producto}*\n`
      mensaje += `   • Talla: ${item.talla}\n`
      mensaje += `   • Color: ${item.color}\n`
      mensaje += `   • Cantidad: ${item.cantidad}\n`
      mensaje += `   • Precio: ${formatearMoneda(item.precio_venta)} c/u\n`
      mensaje += `   • Subtotal: ${formatearMoneda(item.precio_venta * item.cantidad)}\n`
    })
    
    mensaje += `\n━━━━━━━━━━━━━━━━━━\n`
    mensaje += `💰 *TOTAL: ${formatearMoneda(total)}*\n`
    mensaje += `━━━━━━━━━━━━━━━━━━\n\n`
    mensaje += `🔖 Pedido #${pedidoId?.slice(0, 8).toUpperCase() || 'NUEVO'}`
    
    return encodeURIComponent(mensaje)
  }

  // Enviar pedido a WhatsApp
  const enviarPedido = async () => {
    if (!datosCliente.nombre.trim()) {
      setError('Ingresa tu nombre')
      return
    }
    if (!datosCliente.telefono.trim()) {
      setError('Ingresa tu teléfono')
      return
    }

    setEnviando(true)
    setError('')

    // Crear pedido en la base de datos
    const resultado = await crearPedido(datosCliente, carrito, total)

    if (resultado.exito) {
      const idPedido = resultado.pedidoId
      setPedidoId(idPedido)
      
      // Generar mensaje y abrir WhatsApp
      const mensaje = generarMensajeWhatsApp(idPedido)
      const urlWhatsApp = `https://wa.me/${WHATSAPP_VENDEDOR}?text=${mensaje}`
      
      // Abrir WhatsApp en nueva pestaña
      window.open(urlWhatsApp, '_blank')
      
      // Limpiar carrito y mostrar confirmación
      limpiarCarrito()
      setPaso('confirmacion')
    } else {
      // Si falla el guardado en BD, igual enviar a WhatsApp
      const mensaje = generarMensajeWhatsApp('PENDIENTE')
      const urlWhatsApp = `https://wa.me/${WHATSAPP_VENDEDOR}?text=${mensaje}`
      window.open(urlWhatsApp, '_blank')
      
      limpiarCarrito()
      setPaso('confirmacion')
    }

    setEnviando(false)
  }

  // Vista: Carrito vacío
  if (carrito.length === 0 && paso !== 'confirmacion') {
    return (
      <div className="p-4 text-center py-20">
        <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-slate-300" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Tu carrito está vacío
        </h2>
        <p className="text-slate-500 mb-6">
          Agrega productos para hacer tu pedido
        </p>
        <Link href="/tienda">
          <BotonPrimario>Ver productos</BotonPrimario>
        </Link>
      </div>
    )
  }

  // Vista: Confirmación exitosa
  if (paso === 'confirmacion') {
    return (
      <div className="p-4 text-center py-16">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">✅</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          ¡Pedido enviado!
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-2">
          Tu pedido fue enviado por WhatsApp
        </p>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          Te contactaremos pronto para confirmar la entrega
        </p>
        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-slate-500">Número de pedido</p>
          <p className="font-mono font-bold text-slate-900 dark:text-white">
            {pedidoId?.slice(0, 8).toUpperCase()}
          </p>
        </div>
        <Link href="/tienda">
          <BotonPrimario>Seguir comprando</BotonPrimario>
        </Link>
      </div>
    )
  }

  // Vista: Datos del cliente
  if (paso === 'datos') {
    return (
      <div className="p-4">
        <header className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setPaso('carrito')}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Tus datos
          </h1>
        </header>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-6">
          <EntradaTexto
            etiqueta="Tu nombre"
            placeholder="¿Cómo te llamas?"
            value={datosCliente.nombre}
            onChange={(e) => setDatosCliente({ ...datosCliente, nombre: e.target.value })}
          />
          <EntradaTexto
            etiqueta="Teléfono / WhatsApp"
            placeholder="Para confirmar tu pedido"
            type="tel"
            value={datosCliente.telefono}
            onChange={(e) => setDatosCliente({ ...datosCliente, telefono: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Notas (opcional)
            </label>
            <textarea
              placeholder="¿Algo que debamos saber?"
              value={datosCliente.notas}
              onChange={(e) => setDatosCliente({ ...datosCliente, notas: e.target.value })}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 h-24 resize-none"
            />
          </div>
        </div>

        {/* Resumen */}
        <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-600 dark:text-slate-400">
              {carrito.length} producto(s)
            </span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatearMoneda(total)}
            </span>
          </div>
        </div>

        {/* Botón de WhatsApp */}
        <button
          onClick={enviarPedido}
          disabled={enviando}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-3 transition-colors disabled:opacity-50"
        >
          {enviando ? (
            <span>Enviando...</span>
          ) : (
            <>
              <MessageCircle className="w-6 h-6" />
              <span>Enviar pedido por WhatsApp</span>
            </>
          )}
        </button>
        
        <p className="text-center text-sm text-slate-500 mt-3">
          Se abrirá WhatsApp con tu pedido listo para enviar
        </p>
      </div>
    )
  }

  // Vista: Carrito (default)
  return (
    <div className="p-4 pb-32">
      <header className="flex items-center gap-3 mb-6">
        <Link
          href="/tienda"
          className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          Tu carrito
        </h1>
      </header>

      {/* Lista de productos */}
      <div className="space-y-3 mb-6">
        {carrito.map(item => (
          <div 
            key={item.variante_id}
            className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700"
          >
            <div className="flex gap-3">
              {/* Imagen */}
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                {item.imagen_url ? (
                  <img src={item.imagen_url} alt="" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <span className="text-2xl">👖</span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-slate-900 dark:text-white truncate">
                  {item.nombre_producto}
                </h3>
                <p className="text-sm text-slate-500">
                  Talla: {item.talla} | {item.color}
                </p>
                <p className="font-bold text-blue-600 dark:text-blue-400">
                  {formatearMoneda(item.precio_venta)}
                </p>
              </div>

              {/* Eliminar */}
              <button
                onClick={() => eliminarProducto(item.variante_id)}
                className="text-slate-400 hover:text-red-500 p-1"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            {/* Controles de cantidad */}
            <div className="flex items-center justify-end gap-3 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
              <button
                onClick={() => quitarProducto(item.variante_id)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-bold">{item.cantidad}</span>
              <button
                onClick={() => agregarProducto(item)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer con total y botón */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 p-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-600 dark:text-slate-400">Total</span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatearMoneda(total)}
            </span>
          </div>
          <BotonPrimario
            onClick={() => setPaso('datos')}
            className="w-full"
            tamanio="lg"
          >
            Continuar
          </BotonPrimario>
        </div>
      </div>
    </div>
  )
}
