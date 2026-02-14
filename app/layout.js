import "./globals.css";

export const metadata = {
  title: "Sistema de Inventario | Gestión de Ventas",
  description: "Sistema de gestión de ventas e inventario para negocios de ropa",
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#2563eb",
};

export default function LayoutRaiz({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="apple-touch-icon" href="/icono-192.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
