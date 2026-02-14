/**
 * Componente: ToggleTema
 * =======================
 * Botón para cambiar entre modo claro y oscuro
 */

'use client'

import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function ToggleTema({ className = '' }) {
  const [tema, setTema] = useState('sistema')
  const [mounted, setMounted] = useState(false)

  // Cargar tema guardado
  useEffect(() => {
    setMounted(true)
    const temaGuardado = localStorage.getItem('tema') || 'sistema'
    setTema(temaGuardado)
    aplicarTema(temaGuardado)
  }, [])

  const aplicarTema = (nuevoTema) => {
    const html = document.documentElement
    
    if (nuevoTema === 'oscuro') {
      html.classList.add('dark')
      html.classList.remove('light')
    } else if (nuevoTema === 'claro') {
      html.classList.remove('dark')
      html.classList.add('light')
    } else {
      // Sistema - usar preferencia del navegador
      html.classList.remove('dark', 'light')
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        html.classList.add('dark')
      }
    }
  }

  const cambiarTema = () => {
    let nuevoTema
    if (tema === 'claro') {
      nuevoTema = 'oscuro'
    } else if (tema === 'oscuro') {
      nuevoTema = 'claro'
    } else {
      // Si está en sistema, detectar y cambiar al opuesto
      const estaOscuro = window.matchMedia('(prefers-color-scheme: dark)').matches
      nuevoTema = estaOscuro ? 'claro' : 'oscuro'
    }
    
    setTema(nuevoTema)
    localStorage.setItem('tema', nuevoTema)
    aplicarTema(nuevoTema)
  }

  // Evitar hydration mismatch
  if (!mounted) {
    return (
      <button className={`w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center ${className}`}>
        <div className="w-5 h-5 bg-slate-300 dark:bg-slate-600 rounded-full" />
      </button>
    )
  }

  const esOscuro = tema === 'oscuro' || (tema === 'sistema' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  return (
    <button
      onClick={cambiarTema}
      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95 ${
        esOscuro 
          ? 'bg-slate-700 hover:bg-slate-600' 
          : 'bg-slate-100 hover:bg-slate-200'
      } ${className}`}
      title={esOscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      {esOscuro ? (
        <Sun className="w-5 h-5 text-yellow-400" />
      ) : (
        <Moon className="w-5 h-5 text-slate-600" />
      )}
    </button>
  )
}
