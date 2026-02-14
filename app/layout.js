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
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icono-192.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var tema = localStorage.getItem('tema');
                  if (tema === 'oscuro') {
                    document.documentElement.classList.add('dark');
                  } else if (tema === 'claro') {
                    document.documentElement.classList.add('light');
                  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased">
        <main className="page-transition">
          {children}
        </main>
      </body>
    </html>
  );
}
