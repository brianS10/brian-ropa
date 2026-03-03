/**
 * Componente: AnimacionCarrito
 * =============================
 * Muestra una mini imagen del producto que "vuela" desde su posición
 * hasta el ícono del carrito cuando se agrega un producto.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'

export default function AnimacionCarrito() {
    const [animaciones, setAnimaciones] = useState([])

    // Función global para disparar la animación
    useEffect(() => {
        window.dispararAnimacionCarrito = (config) => {
            const id = Date.now() + Math.random()
            setAnimaciones(prev => [...prev, { id, ...config }])

            // Limpiar después de la animación
            setTimeout(() => {
                setAnimaciones(prev => prev.filter(a => a.id !== id))
            }, 800)
        }

        return () => {
            delete window.dispararAnimacionCarrito
        }
    }, [])

    return (
        <>
            {animaciones.map(({ id, fromX, fromY, toX, toY, imagen, emoji }) => (
                <div
                    key={id}
                    className="fixed z-[200] pointer-events-none"
                    style={{
                        left: fromX,
                        top: fromY,
                        animation: 'fly-to-cart 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
                        '--fly-to-x': `${toX - fromX}px`,
                        '--fly-to-y': `${toY - fromY}px`,
                    }}
                >
                    {imagen ? (
                        <div className="w-14 h-14 rounded-xl overflow-hidden shadow-2xl shadow-blue-500/50 border-2 border-white">
                            <img src={imagen} alt="" className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-2xl shadow-blue-500/50 border-2 border-white flex items-center justify-center text-2xl">
                            {emoji || '🛒'}
                        </div>
                    )}
                </div>
            ))}

            <style jsx global>{`
        @keyframes fly-to-cart {
          0% {
            transform: scale(1) translate(0, 0);
            opacity: 1;
          }
          40% {
            transform: scale(1.2) translate(
              calc(var(--fly-to-x) * 0.3),
              calc(var(--fly-to-y) * 0.1 - 60px)
            );
            opacity: 1;
          }
          100% {
            transform: scale(0.3) translate(var(--fly-to-x), var(--fly-to-y));
            opacity: 0.3;
          }
        }
      `}</style>
        </>
    )
}
