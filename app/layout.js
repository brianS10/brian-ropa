import "./globals.css";

export const metadata = {
  title: "Productos Sanchez | Ropa, Perfumes y Juguetes",
  description: "Tienda de ropa, perfumes y juguetes - Los mejores precios en Productos Sanchez",
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
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
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
