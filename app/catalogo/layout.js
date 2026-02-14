/**
 * Layout del Catálogo
 * ====================
 * Layout especial para la página del catálogo público
 * Sin ningún enlace a admin - solo para clientes
 */

export const metadata = {
  title: "Catálogo de Pantalones | Ver Productos",
  description: "Explora nuestro catálogo de pantalones de calidad. Mezclilla, vestir, cargo y más.",
  openGraph: {
    title: 'Catálogo de Pantalones',
    description: 'Pantalones de calidad para ti 👖',
    type: 'website',
  },
}

export default function LayoutCatalogo({ children }) {
  return children
}
