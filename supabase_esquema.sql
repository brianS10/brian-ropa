-- ============================================
-- SISTEMA DE INVENTARIO - ESQUEMA DE BASE DE DATOS
-- ============================================
-- Copia y pega este script completo en:
-- Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================

-- 1. TABLA: productos (El Padre)
-- Contiene la información genérica del producto
CREATE TABLE IF NOT EXISTS productos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  imagen_url TEXT,
  categoria TEXT DEFAULT 'Pantalones',
  estado BOOLEAN DEFAULT true,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Comentarios de la tabla
COMMENT ON TABLE productos IS 'Tabla padre con información genérica de cada modelo de ropa';
COMMENT ON COLUMN productos.nombre IS 'Nombre del modelo. Ej: Jeans Slim Fit';
COMMENT ON COLUMN productos.estado IS 'true=activo, false=archivado';

-- 2. TABLA: variantes_producto (El Hijo - Donde vive el inventario)
-- Cada variante es una combinación única de Talla + Color con su propio stock
CREATE TABLE IF NOT EXISTS variantes_producto (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  talla TEXT NOT NULL,
  color TEXT DEFAULT 'Sin especificar',
  precio_venta DECIMAL(10,2) NOT NULL DEFAULT 0,
  precio_costo DECIMAL(10,2) DEFAULT 0,
  stock_actual INTEGER NOT NULL DEFAULT 0,
  stock_minimo INTEGER DEFAULT 2,
  codigo_barras TEXT UNIQUE,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_variantes_producto_id ON variantes_producto(producto_id);

COMMENT ON TABLE variantes_producto IS 'Variantes de cada producto (talla/color) con su stock real';
COMMENT ON COLUMN variantes_producto.stock_minimo IS 'Alerta cuando el stock llegue a este número';

-- 3. TABLA: ventas (Cabecera de cada venta)
CREATE TABLE IF NOT EXISTS ventas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fecha_venta TIMESTAMP WITH TIME ZONE DEFAULT now(),
  total_venta DECIMAL(10,2) NOT NULL DEFAULT 0,
  metodo_pago TEXT NOT NULL DEFAULT 'efectivo',
  usuario_id UUID,
  notas TEXT,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índice para filtrar por fecha (corte de caja)
CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas(fecha_venta);

COMMENT ON TABLE ventas IS 'Registro de cada transacción de venta';
COMMENT ON COLUMN ventas.metodo_pago IS 'efectivo | transferencia | tarjeta';

-- 4. TABLA: detalle_venta (Renglones de cada venta)
CREATE TABLE IF NOT EXISTS detalle_venta (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  venta_id UUID NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
  variante_id UUID NOT NULL REFERENCES variantes_producto(id),
  cantidad INTEGER NOT NULL DEFAULT 1,
  precio_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL
);

-- Índice para consultas de historial
CREATE INDEX IF NOT EXISTS idx_detalle_venta_id ON detalle_venta(venta_id);

COMMENT ON TABLE detalle_venta IS 'Productos incluidos en cada venta';

-- ============================================
-- POLÍTICAS DE SEGURIDAD (Row Level Security)
-- ============================================
-- Por ahora permitimos todo acceso público (después se restringe con auth)

ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE variantes_producto ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE detalle_venta ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas (para desarrollo)
CREATE POLICY "Permitir todo en productos" ON productos FOR ALL USING (true);
CREATE POLICY "Permitir todo en variantes" ON variantes_producto FOR ALL USING (true);
CREATE POLICY "Permitir todo en ventas" ON ventas FOR ALL USING (true);
CREATE POLICY "Permitir todo en detalle_venta" ON detalle_venta FOR ALL USING (true);

-- ============================================
-- DATOS DE EJEMPLO (Opcional)
-- ============================================
-- Descomenta las siguientes líneas para insertar datos de prueba

/*
-- Producto de ejemplo
INSERT INTO productos (nombre, categoria, descripcion) VALUES
  ('Jeans Slim Fit', 'Pantalones', 'Jeans corte ajustado en mezclilla stretch'),
  ('Pantalón Cargo', 'Pantalones', 'Pantalón cargo con bolsillos laterales'),
  ('Bermuda Casual', 'Shorts', 'Bermuda de algodón ligero');

-- Variantes del primer producto (Jeans Slim Fit)
INSERT INTO variantes_producto (producto_id, talla, color, precio_venta, precio_costo, stock_actual, stock_minimo)
SELECT 
  p.id,
  talla,
  'Azul Oscuro',
  350.00,
  180.00,
  FLOOR(RANDOM() * 10 + 1)::INTEGER,
  2
FROM productos p, unnest(ARRAY['28', '30', '32', '34', '36']) AS talla
WHERE p.nombre = 'Jeans Slim Fit';

-- Variantes del segundo producto (Pantalón Cargo)
INSERT INTO variantes_producto (producto_id, talla, color, precio_venta, precio_costo, stock_actual, stock_minimo)
SELECT 
  p.id,
  talla,
  'Negro',
  420.00,
  210.00,
  FLOOR(RANDOM() * 8 + 1)::INTEGER,
  2
FROM productos p, unnest(ARRAY['30', '32', '34', '36']) AS talla
WHERE p.nombre = 'Pantalón Cargo';
*/

-- ============================================
-- ¡LISTO! Ahora tienes las tablas creadas.
-- Ve a Table Editor para ver tu estructura.
-- ============================================
