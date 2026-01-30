/**
 * Página: Gestión de Pedidos (Vendedor)
 * ======================================
 * Muestra los pedidos recibidos de clientes
 */

'use client'

import { useState, useEffect } from 'react'
import { Package, Clock, CheckCircle, Phone, User, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'
import { usarPedidos } from '@/hooks/usarPedidos'
import { formatearMoneda, formatearFecha } from '@/lib/utilidades'
import BotonPrimario from '@/componentes/ui/BotonPrimario'

// Componente tarjeta de pedido
function TarjetaPedido({ pedido, onConfirmar }) {
  const [expandido, setExpandido] = useState(false)
  const [confirmando, setConfirmando] = useState(false)

  const confirmar = async () => {
    setConfirmando(true)
    await onConfirmar(pedido.id)
    setConfirmando(false)
  }

  const esPendiente = pedido.estado === 'pendiente'

  return (
    <div className={`
      bg-white dark:bg-slate-800 rounded-xl border-2 overflow-hidden
      ${esPendiente 
        ? 'border-orange-300 dark:border-orange-600' 
        : 'border-slate-200 dark:border-slate-700'}
    `}>
      {/* Header */}
      <div 
        className="p-4 cursor-pointer"
        onClick={() => setExpandido(!expandido)}
      >
        <div className="flex items-start justify-between mb-2">
          <div>
            <span className={`
              inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full
              ${esPendiente 
                ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' 
                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}
            `}>
              {esPendiente ? <Clock className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
              {esPendiente ? 'Pendiente' : 'Entregado'}
            </span>
          </div>
          <span className="text-xs text-slate-500">
            {formatearFecha(pedido.creado_en, 'DD/MM HH:mm')}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-medium">
              <User className="w-4 h-4 text-slate-400" />
              {pedido.nombre_cliente}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
              <Phone className="w-3 h-3" />
              {pedido.telefono}
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {formatearMoneda(pedido.total)}
            </div>
            {expandido ? <ChevronUp className="w-4 h-4 ml-auto mt-1" /> : <ChevronDown className="w-4 h-4 ml-auto mt-1" />}
          </div>
        </div>
      </div>

      {/* Detalle expandido */}
      {expandido && (
        <div className="px-4 pb-4 border-t border-slate-100 dark:border-slate-700 pt-3">
          {pedido.notas && (
            <div className="mb-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-sm text-yellow-800 dark:text-yellow-200">
              📝 {pedido.notas}
            </div>
          )}

          {/* Productos del pedido */}
          <div className="space-y-2 mb-4">
            <p className="text-xs font-medium text-slate-500 uppercase">Productos:</p>
            {pedido.detalle_pedido?.map(item => (
              <div 
                key={item.id}
                className="flex items-center justify-between text-sm bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2"
              >
                <div>
                  <span className="text-slate-900 dark:text-white">
                    {item.variantes?.productos?.nombre || 'Producto'}
                  </span>
                  <span className="text-slate-500 mx-2">·</span>
                  <span className="text-slate-500">
                    Talla {item.variantes?.talla} - {item.variantes?.color}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500">x{item.cantidad}</span>
                  <span className="ml-2 font-medium text-slate-900 dark:text-white">
                    {formatearMoneda(item.precio_unitario * item.cantidad)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Botón confirmar */}
          {esPendiente && (
            <BotonPrimario
              onClick={confirmar}
              cargando={confirmando}
              className="w-full"
            >
              Marcar como entregado
            </BotonPrimario>
          )}
        </div>
      )}
    </div>
  )
}

export default function PaginaPedidos() {
  const { obtenerPedidos, confirmarPedido } = usarPedidos()
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtro, setFiltro] = useState('todos') // todos | pendientes | entregados

  // Cargar pedidos
  const cargarPedidos = async () => {
    setCargando(true)
    const resultado = await obtenerPedidos()
    if (resultado.exito) {
      setPedidos(resultado.datos)
    }
    setCargando(false)
  }

  useEffect(() => {
    cargarPedidos()
    // Actualizar cada 30 segundos
    const intervalo = setInterval(cargarPedidos, 30000)
    return () => clearInterval(intervalo)
  }, [])

  // Confirmar pedido
  const manejarConfirmar = async (pedidoId) => {
    const resultado = await confirmarPedido(pedidoId)
    if (resultado.exito) {
      setPedidos(pedidos.map(p => 
        p.id === pedidoId ? { ...p, estado: 'entregado' } : p
      ))
    }
  }

  // Filtrar pedidos
  const pedidosFiltrados = pedidos.filter(p => {
    if (filtro === 'pendientes') return p.estado === 'pendiente'
    if (filtro === 'entregados') return p.estado === 'entregado'
    return true
  })

  const cantidadPendientes = pedidos.filter(p => p.estado === 'pendiente').length

  return (
    <div className="p-4 pb-24">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="w-7 h-7" />
            Pedidos
          </h1>
          {cantidadPendientes > 0 && (
            <p className="text-orange-600 dark:text-orange-400 mt-1">
              {cantidadPendientes} pedido(s) pendiente(s)
            </p>
          )}
        </div>
        <button
          onClick={cargarPedidos}
          className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
        >
          <RefreshCw className={`w-5 h-5 ${cargando ? 'animate-spin' : ''}`} />
        </button>
      </header>

      {/* Filtros */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {[
          { valor: 'todos', etiqueta: 'Todos' },
          { valor: 'pendientes', etiqueta: 'Pendientes' },
          { valor: 'entregados', etiqueta: 'Entregados' },
        ].map(f => (
          <button
            key={f.valor}
            onClick={() => setFiltro(f.valor)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
              ${filtro === f.valor
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}
            `}
          >
            {f.etiqueta}
          </button>
        ))}
      </div>

      {/* Lista de pedidos */}
      {cargando && pedidos.length === 0 ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-500">Cargando pedidos...</p>
        </div>
      ) : pedidosFiltrados.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            {filtro === 'todos' ? 'No hay pedidos' : `No hay pedidos ${filtro}`}
          </h2>
          <p className="text-slate-500">
            Los pedidos de clientes aparecerán aquí
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {pedidosFiltrados.map(pedido => (
            <TarjetaPedido
              key={pedido.id}
              pedido={pedido}
              onConfirmar={manejarConfirmar}
            />
          ))}
        </div>
      )}
    </div>
  )
}
