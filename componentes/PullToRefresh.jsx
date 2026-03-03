/**
 * Componente: PullToRefresh
 * ==========================
 * Permite jalar hacia abajo para refrescar el contenido (como Instagram)
 * Solo funciona en móvil con touch events
 */

'use client'

import { useState, useRef, useCallback } from 'react'

export default function PullToRefresh({ onRefresh, children }) {
    const [pulling, setPulling] = useState(false)
    const [pullDistance, setPullDistance] = useState(0)
    const [refreshing, setRefreshing] = useState(false)
    const startY = useRef(0)
    const containerRef = useRef(null)

    const THRESHOLD = 80 // Distancia mínima para activar refresh

    const handleTouchStart = useCallback((e) => {
        // Solo activar si estamos arriba del todo
        if (window.scrollY === 0) {
            startY.current = e.touches[0].clientY
            setPulling(true)
        }
    }, [])

    const handleTouchMove = useCallback((e) => {
        if (!pulling || refreshing) return

        const currentY = e.touches[0].clientY
        const diff = currentY - startY.current

        if (diff > 0 && window.scrollY === 0) {
            // Resistencia: cuanto más jalas, más cuesta
            const distance = Math.min(diff * 0.4, 120)
            setPullDistance(distance)
        }
    }, [pulling, refreshing])

    const handleTouchEnd = useCallback(async () => {
        if (!pulling) return

        if (pullDistance >= THRESHOLD && !refreshing) {
            setRefreshing(true)
            setPullDistance(THRESHOLD)

            try {
                await onRefresh()
            } catch (err) {
                console.error('Error al refrescar:', err)
            }

            // Pequeña pausa para que se vea la animación
            await new Promise(r => setTimeout(r, 500))
            setRefreshing(false)
        }

        setPulling(false)
        setPullDistance(0)
    }, [pulling, pullDistance, refreshing, onRefresh])

    const progress = Math.min(pullDistance / THRESHOLD, 1)

    return (
        <div
            ref={containerRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Indicador de pull-to-refresh */}
            <div
                className="flex items-center justify-center overflow-hidden transition-all duration-200"
                style={{
                    height: pullDistance > 0 ? `${pullDistance}px` : '0px',
                    opacity: progress
                }}
            >
                <div className="flex flex-col items-center gap-1">
                    {refreshing ? (
                        <>
                            <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            <span className="text-xs font-medium text-blue-500">Actualizando...</span>
                        </>
                    ) : (
                        <>
                            <div
                                className="text-2xl transition-transform duration-200"
                                style={{
                                    transform: `rotate(${progress * 180}deg)`,
                                }}
                            >
                                ↓
                            </div>
                            <span className="text-xs font-medium text-slate-500">
                                {progress >= 1 ? '¡Suelta para actualizar!' : 'Jala para actualizar'}
                            </span>
                        </>
                    )}
                </div>
            </div>

            {children}
        </div>
    )
}
