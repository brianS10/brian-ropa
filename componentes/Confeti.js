/**
 * Componente: Confeti
 * ====================
 * Animación de confeti celebratoria
 * Usa cuando: venta exitosa, logro desbloqueado
 */

'use client'

import { useEffect, useState } from 'react'

const COLORES = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
  '#BB8FCE', '#85C1E9', '#F8B500', '#FF69B4'
]

export default function Confeti({ activo, duracion = 3000 }) {
  const [piezas, setPiezas] = useState([])

  useEffect(() => {
    if (!activo) {
      setPiezas([])
      return
    }

    // Crear piezas de confeti
    const nuevasPiezas = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      color: COLORES[Math.floor(Math.random() * COLORES.length)],
      size: Math.random() * 8 + 6,
      rotation: Math.random() * 360,
    }))

    setPiezas(nuevasPiezas)

    // Limpiar después de la duración
    const timer = setTimeout(() => {
      setPiezas([])
    }, duracion)

    return () => clearTimeout(timer)
  }, [activo, duracion])

  if (!activo || piezas.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      {piezas.map((pieza) => (
        <div
          key={pieza.id}
          className="confetti-piece"
          style={{
            left: `${pieza.left}%`,
            animationDelay: `${pieza.delay}s`,
            backgroundColor: pieza.color,
            width: `${pieza.size}px`,
            height: `${pieza.size}px`,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            transform: `rotate(${pieza.rotation}deg)`,
          }}
        />
      ))}
    </div>
  )
}
