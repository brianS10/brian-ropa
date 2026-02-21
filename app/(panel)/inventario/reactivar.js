import { useState } from 'react'
import { supabase, estaConfigurado } from '@/lib/base_datos/cliente_supabase'
import BotonPrimario from '@/componentes/ui/BotonPrimario'

export default function ReactivarProducto() {
  const [id, setId] = useState('')
  const [mensaje, setMensaje] = useState('')

  const reactivar = async () => {
    if (!id) return setMensaje('Ingresa el ID del producto')
    if (!estaConfigurado() || !supabase) return setMensaje('Supabase no configurado')
    try {
      const { error } = await supabase
        .from('productos')
        .update({ estado: true, nombre: '' })
        .eq('id', id)
      if (error) throw error
      setMensaje('Producto reactivado')
    } catch (err) {
      setMensaje('Error: ' + err.message)
    }
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Reactivar producto eliminado</h2>
      <input
        type="text"
        value={id}
        onChange={e => setId(e.target.value)}
        placeholder="ID del producto"
        className="w-full mb-4 p-2 border rounded"
      />
      <BotonPrimario onClick={reactivar}>Reactivar</BotonPrimario>
      {mensaje && <p className="mt-4 text-blue-600">{mensaje}</p>}
    </div>
  )
}
