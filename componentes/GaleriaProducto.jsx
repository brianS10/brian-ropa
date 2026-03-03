/**
 * Componente: GaleriaProducto
 * ============================
 * Galería de fotos a pantalla completa con:
 * - Swipe horizontal para cambiar de foto
 * - Pinch-to-zoom en cada imagen
 * - Miniaturas en la parte inferior
 * - Animaciones suaves
 */

'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utilidades'

export default function GaleriaProducto({ imagenes = [], indiceInicial = 0, nombre = '', onCerrar }) {
    const [indiceActual, setIndiceActual] = useState(indiceInicial)
    const [zoom, setZoom] = useState(1)
    const [posicion, setPosicion] = useState({ x: 0, y: 0 })
    const [arrastrando, setArrastrando] = useState(false)

    // Refs para gestos touch
    const touchStartRef = useRef({ x: 0, y: 0, time: 0 })
    const lastTouchRef = useRef({ x: 0, y: 0 })
    const pinchStartRef = useRef(0)
    const pinchZoomRef = useRef(1)
    const containerRef = useRef(null)
    const swipeOffsetRef = useRef(0)
    const [swipeOffset, setSwipeOffset] = useState(0)
    const [transitioning, setTransitioning] = useState(false)

    // Calcular distancia entre dos dedos
    const getDistance = (touches) => {
        if (touches.length < 2) return 0
        const dx = touches[0].clientX - touches[1].clientX
        const dy = touches[0].clientY - touches[1].clientY
        return Math.sqrt(dx * dx + dy * dy)
    }

    // Reset zoom
    const resetZoom = useCallback(() => {
        setZoom(1)
        setPosicion({ x: 0, y: 0 })
    }, [])

    // Navegar a otra imagen
    const irA = useCallback((indice) => {
        if (indice < 0 || indice >= imagenes.length) return
        setTransitioning(true)
        resetZoom()
        setIndiceActual(indice)
        setSwipeOffset(0)
        setTimeout(() => setTransitioning(false), 300)
    }, [imagenes.length, resetZoom])

    // Touch handlers
    const handleTouchStart = useCallback((e) => {
        if (e.touches.length === 2) {
            // Pinch start
            pinchStartRef.current = getDistance(e.touches)
            pinchZoomRef.current = zoom
            return
        }

        const touch = e.touches[0]
        touchStartRef.current = {
            x: touch.clientX,
            y: touch.clientY,
            time: Date.now()
        }
        lastTouchRef.current = { x: touch.clientX, y: touch.clientY }
        setArrastrando(true)
    }, [zoom])

    const handleTouchMove = useCallback((e) => {
        // Pinch to zoom
        if (e.touches.length === 2) {
            e.preventDefault()
            const currentDistance = getDistance(e.touches)
            const scale = currentDistance / pinchStartRef.current
            const newZoom = Math.max(1, Math.min(pinchZoomRef.current * scale, 5))
            setZoom(newZoom)

            if (newZoom <= 1) {
                setPosicion({ x: 0, y: 0 })
            }
            return
        }

        if (!arrastrando) return
        const touch = e.touches[0]

        if (zoom > 1) {
            // Si hay zoom, mover la imagen
            e.preventDefault()
            const dx = touch.clientX - lastTouchRef.current.x
            const dy = touch.clientY - lastTouchRef.current.y
            setPosicion(prev => ({
                x: prev.x + dx,
                y: prev.y + dy
            }))
            lastTouchRef.current = { x: touch.clientX, y: touch.clientY }
        } else {
            // Sin zoom: swipe horizontal para cambiar de foto
            const dx = touch.clientX - touchStartRef.current.x
            swipeOffsetRef.current = dx
            setSwipeOffset(dx)
        }
    }, [arrastrando, zoom])

    const handleTouchEnd = useCallback((e) => {
        setArrastrando(false)

        if (zoom <= 1 && e.touches.length === 0) {
            const dx = swipeOffsetRef.current
            const dt = Date.now() - touchStartRef.current.time
            const velocity = Math.abs(dx) / dt

            // Swipe rápido o suficiente distancia
            if (Math.abs(dx) > 60 || velocity > 0.5) {
                if (dx < 0 && indiceActual < imagenes.length - 1) {
                    irA(indiceActual + 1)
                } else if (dx > 0 && indiceActual > 0) {
                    irA(indiceActual - 1)
                } else {
                    setSwipeOffset(0)
                }
            } else {
                setSwipeOffset(0)
            }
            swipeOffsetRef.current = 0
        }

        // Si el zoom vuelve a 1[ish], resetear posición
        if (zoom <= 1.05) {
            resetZoom()
        }
    }, [zoom, indiceActual, imagenes.length, irA, resetZoom])

    // Doble tap para zoom
    const lastTapRef = useRef(0)
    const handleDoubleTap = useCallback((e) => {
        const now = Date.now()
        if (now - lastTapRef.current < 300) {
            // Doble tap
            if (zoom > 1) {
                resetZoom()
            } else {
                setZoom(2.5)
                // Centrar en el punto donde se hizo tap
                const rect = containerRef.current?.getBoundingClientRect()
                if (rect) {
                    const x = e.changedTouches?.[0]?.clientX || e.clientX
                    const y = e.changedTouches?.[0]?.clientY || e.clientY
                    const centerX = rect.width / 2
                    const centerY = rect.height / 2
                    setPosicion({
                        x: (centerX - x) * 1.5,
                        y: (centerY - y) * 1.5
                    })
                }
            }
        }
        lastTapRef.current = now
    }, [zoom, resetZoom])

    // Cerrar con escape
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') onCerrar()
            if (e.key === 'ArrowRight') irA(indiceActual + 1)
            if (e.key === 'ArrowLeft') irA(indiceActual - 1)
        }
        window.addEventListener('keydown', handleKey)
        return () => window.removeEventListener('keydown', handleKey)
    }, [onCerrar, irA, indiceActual])

    // Bloquear scroll del body
    useEffect(() => {
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = '' }
    }, [])

    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col select-none">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-10">
                <p className="text-white font-medium text-sm truncate flex-1 drop-shadow-lg">
                    {nombre}
                </p>
                <div className="flex items-center gap-3">
                    <span className="text-white/80 text-sm font-medium bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-sm">
                        {indiceActual + 1} / {imagenes.length}
                    </span>
                    <button
                        onClick={onCerrar}
                        className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center active:scale-90 transition-transform"
                    >
                        <X className="w-6 h-6 text-white" />
                    </button>
                </div>
            </div>

            {/* Imagen principal con swipe y zoom */}
            <div
                ref={containerRef}
                className="flex-1 flex items-center justify-center overflow-hidden touch-none"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onClick={handleDoubleTap}
            >
                <div
                    className={cn(
                        "w-full h-full flex items-center justify-center",
                        transitioning && "transition-transform duration-300 ease-out"
                    )}
                >
                    <img
                        src={imagenes[indiceActual]}
                        alt={`Foto ${indiceActual + 1}`}
                        className="max-w-full max-h-full object-contain pointer-events-none"
                        style={{
                            transform: `translate(${posicion.x + swipeOffset}px, ${posicion.y}px) scale(${zoom})`,
                            transition: arrastrando ? 'none' : 'transform 0.2s ease-out',
                        }}
                        draggable={false}
                    />
                </div>

                {/* Indicador de zoom */}
                {zoom > 1 && (
                    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
                        {Math.round(zoom * 100)}% · Doble tap para resetear
                    </div>
                )}
            </div>

            {/* Miniaturas */}
            {imagenes.length > 1 && (
                <div className="p-3 bg-gradient-to-t from-black/80 to-transparent absolute bottom-0 left-0 right-0">
                    <div className="flex gap-2 justify-center overflow-x-auto no-scrollbar pb-safe">
                        {imagenes.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => irA(idx)}
                                className={cn(
                                    'w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all',
                                    idx === indiceActual
                                        ? 'border-white shadow-lg shadow-white/20 scale-110'
                                        : 'border-white/30 opacity-60 hover:opacity-100'
                                )}
                            >
                                <img src={img} alt="" className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
