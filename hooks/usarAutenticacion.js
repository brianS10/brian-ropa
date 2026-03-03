/**
 * Hook: usarAutenticacion
 * ========================
 * Maneja la autenticación simple del administrador con PIN
 * El PIN se guarda en sessionStorage (se borra al cerrar navegador)
 */

'use client'

import { create } from 'zustand'

// PIN de administrador (configurado en .env.local)
const PIN_ADMIN = process.env.NEXT_PUBLIC_ADMIN_PIN || '1234'

export const usarAutenticacion = create((set, get) => ({
  estaAutenticado: false,
  verificado: false, // Para saber si ya se verificó el sessionStorage

  // Verificar si hay sesión guardada
  verificarSesion: () => {
    if (typeof window === 'undefined') return false

    const sesion = sessionStorage.getItem('admin_autenticado')
    const autenticado = sesion === 'true'

    set({ estaAutenticado: autenticado, verificado: true })
    return autenticado
  },

  // Iniciar sesión con PIN
  iniciarSesion: (pin) => {
    if (pin === PIN_ADMIN) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('admin_autenticado', 'true')
      }
      set({ estaAutenticado: true })
      return { exito: true }
    }
    return { exito: false, error: 'PIN incorrecto' }
  },

  // Cerrar sesión
  cerrarSesion: () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('admin_autenticado')
    }
    set({ estaAutenticado: false })
  },
}))
