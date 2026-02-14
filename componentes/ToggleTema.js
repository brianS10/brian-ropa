/**
 * Componente: ToggleTema
 * =======================
 * Botón para cambiar entre modo claro y oscuro
 */

'use client'

import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function ToggleTema({ className = '' }) {
  const [esOscuro, setEsOscuro] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Detectar tema inicial
  useEffect(() => {
    setMounted(true)
    const temaGuardado = localStorage.getItem('tema-catalogo')
    
    if (temaGuardado === 'oscuro') {
      setEsOscuro(true)
      document.documentElement.classList.add('dark')
    } else if (temaGuardado === 'claro') {
      setEsOscuro(false)
      document.documentElement.classList.remove('dark')
    } else {
      // Detectar preferencia del sistema
      const prefiereDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setEsOscuro(prefiereDark)
      if (prefiereDark) {
        document.documentElement.classList.add('dark')
      }
    }
  }, [])

  const cambiarTema = () => {
    const nuevoTema = !esOscuro
    setEsOscuro(nuevoTema)
    
    if (nuevoTema) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('tema-catalogo', 'oscuro')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('tema-catalogo', 'claro')
    }
  }

  // Evitar hydration mismatch
  if (!mounted) {
    return (
      <button className={`w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center ${className}`}>
        <div className="w-5 h-5 bg-slate-300 dark:bg-slate-600 rounded-full animate-pulse" />
      </button>
    )
  }

  return (
    <button
      onClick={cambiarTema}
      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 active:scale-90 shadow-lg ${
        esOscuro 
          ? 'bg-slate-800 hover:bg-slate-700 shadow-slate-900/30' 
          : 'bg-amber-100 hover:bg-amber-200 shadow-amber-500/30'
      } ${className}`}
      title={esOscuro ? 'Cambiar a modo claro ☀️' : 'Cambiar a modo oscuro 🌙'}
    >
      <div className="relative w-5 h-5">
        {/* Sol */}
        <Sun 
          className={`w-5 h-5 absolute inset-0 transition-all duration-300 ${
            esOscuro 
              ? 'opacity-0 rotate-90 scale-0 text-yellow-400' 
              : 'opacity-100 rotate-0 scale-100 text-amber-500'
          }`} 
        />
        {/* Luna */}
        <Moon 
          className={`w-5 h-5 absolute inset-0 transition-all duration-300 ${
            esOscuro 
              ? 'opacity-100 rotate-0 scale-100 text-blue-300' 
              : 'opacity-0 -rotate-90 scale-0 text-slate-600'
          }`} 
        />
      </div>
    </button>
  )
}
