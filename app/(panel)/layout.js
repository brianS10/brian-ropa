/**
 * Layout del Panel Principal
 * ===========================
 * Envuelve todas las páginas del área de trabajo.
 * Incluye la barra de navegación inferior.
 * PROTEGIDO: Solo usuarios autenticados pueden acceder
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { usarAutenticacion } from '@/hooks/usarAutenticacion'
import BarraNavegacion from '@/componentes/navegacion/BarraNavegacion'

export default function LayoutPanel({ children }) {
  const router = useRouter()
  const { estaAutenticado, verificado, verificarSesion } = usarAutenticacion()
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const autenticado = verificarSesion()
    
    if (!autenticado) {
      router.replace('/admin')
    } else {
      setCargando(false)
    }
  }, [])

  // Mostrar pantalla de carga mientras verifica
  if (cargando || !verificado) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-500">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  // Si no está autenticado, no mostrar nada (se redirige)
  if (!estaAutenticado) {
    return null
  }

  return (
    <div className="min-h-screen pb-20 bg-slate-50 dark:bg-slate-900">
      {children}
      <BarraNavegacion />
    </div>
  )
}
