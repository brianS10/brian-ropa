/**
 * Página: Acceso Administrador
 * =============================
 * Pantalla de login con PIN para acceder al panel de administración
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { usarAutenticacion } from '@/hooks/usarAutenticacion'
import BotonPrimario from '@/componentes/ui/BotonPrimario'

export default function PaginaAcceso() {
  const router = useRouter()
  const { estaAutenticado, verificarSesion, iniciarSesion } = usarAutenticacion()
  
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [mostrarPin, setMostrarPin] = useState(false)
  const [cargando, setCargando] = useState(false)

  // Si ya está autenticado, redirigir al tablero
  useEffect(() => {
    const autenticado = verificarSesion()
    if (autenticado) {
      router.replace('/tablero')
    }
  }, [])

  // Manejar envío del formulario
  const manejarSubmit = (e) => {
    e.preventDefault()
    setError('')
    setCargando(true)

    const resultado = iniciarSesion(pin)
    
    if (resultado.exito) {
      router.push('/tablero')
    } else {
      setError(resultado.error)
      setPin('')
      setCargando(false)
    }
  }

  // Manejar botones del teclado numérico
  const agregarDigito = (digito) => {
    if (pin.length < 6) {
      setPin(pin + digito)
      setError('')
    }
  }

  const borrarDigito = () => {
    setPin(pin.slice(0, -1))
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex flex-col items-center justify-center p-6">
      {/* Botón volver */}
      <Link 
        href="/"
        className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
      </Link>

      {/* Logo */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Lock className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Acceso Administrador
        </h1>
        <p className="text-slate-400">
          Ingresa tu PIN para continuar
        </p>
      </div>

      {/* Indicadores de PIN */}
      <div className="flex gap-3 mb-6">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`
              w-4 h-4 rounded-full transition-all
              ${pin.length > i 
                ? 'bg-blue-500 scale-110' 
                : 'bg-slate-600'}
            `}
          />
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Teclado numérico */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => agregarDigito(num.toString())}
            className="h-16 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-2xl font-semibold transition-colors active:scale-95"
          >
            {num}
          </button>
        ))}
        
        {/* Fila inferior */}
        <button
          onClick={() => setMostrarPin(!mostrarPin)}
          className="h-16 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 flex items-center justify-center transition-colors"
        >
          {mostrarPin ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
        </button>
        
        <button
          onClick={() => agregarDigito('0')}
          className="h-16 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-2xl font-semibold transition-colors active:scale-95"
        >
          0
        </button>
        
        <button
          onClick={borrarDigito}
          className="h-16 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 text-lg font-medium transition-colors"
        >
          ⌫
        </button>
      </div>

      {/* Mostrar PIN (debug) */}
      {mostrarPin && pin && (
        <p className="mt-4 text-slate-500 font-mono">{pin}</p>
      )}

      {/* Botón entrar */}
      <div className="mt-6 w-full max-w-xs">
        <BotonPrimario
          onClick={manejarSubmit}
          disabled={pin.length < 4}
          cargando={cargando}
          className="w-full"
          tamanio="lg"
        >
          Entrar
        </BotonPrimario>
      </div>


    </main>
  )
}
