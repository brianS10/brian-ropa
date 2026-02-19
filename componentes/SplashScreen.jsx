/**
 * Componente: SplashScreen
 * =========================
 * Pantalla de carga con logo animado de Productos Sanchez
 */

'use client'

import { useEffect, useState, useRef } from 'react'
import { NOMBRE_TIENDA, LOGO_TIENDA } from '@/lib/constantes'

export default function SplashScreen({ onFinish, duracion = 2000 }) {
  const [animando, setAnimando] = useState(true)
  const [saliendo, setSaliendo] = useState(false)
  const onFinishRef = useRef(onFinish)
  
  // Mantener referencia actualizada sin causar re-renders
  useEffect(() => {
    onFinishRef.current = onFinish
  }, [onFinish])

  useEffect(() => {
    // Después de la duración, iniciar animación de salida
    const timer = setTimeout(() => {
      setSaliendo(true)
      // Esperar que termine la animación de salida
      setTimeout(() => {
        setAnimando(false)
        onFinishRef.current?.()
      }, 500)
    }, duracion)

    return () => clearTimeout(timer)
  }, [duracion]) // Solo depende de duracion

  if (!animando) return null

  return (
    <div 
      className={`
        fixed inset-0 z-[100] flex flex-col items-center justify-center
        bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700
        transition-all duration-500
        ${saliendo ? 'opacity-0 scale-110' : 'opacity-100 scale-100'}
      `}
    >
      {/* Círculos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-3xl" />
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo con animación */}
        <div className="relative">
          {/* Anillo giratorio */}
          <div className="absolute inset-0 w-40 h-40 border-4 border-white/20 rounded-full animate-spin-slow" 
               style={{ borderTopColor: 'white' }} />
          
          {/* Contenedor del logo */}
          <div className="w-40 h-40 bg-white rounded-3xl shadow-2xl flex items-center justify-center p-4 animate-bounce-slow">
            <img 
              src={LOGO_TIENDA}
              alt={NOMBRE_TIENDA}
              className="w-full h-full object-contain drop-shadow-lg"
            />
          </div>
        </div>

        {/* Nombre de la tienda */}
        <h1 className="mt-8 text-3xl font-black text-white drop-shadow-lg animate-fade-in-up">
          {NOMBRE_TIENDA}
        </h1>
        
        {/* Subtítulo */}
        <p className="mt-2 text-white/80 text-sm animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          Ropa • Perfumes • Juguetes
        </p>

        {/* Indicador de carga */}
        <div className="mt-8 flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
        </div>
      </div>

      {/* Texto inferior */}
      <p className="absolute bottom-8 text-white/50 text-xs animate-fade-in">
        Cargando catálogo...
      </p>
    </div>
  )
}
