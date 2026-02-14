-- ============================================
-- AGREGAR TIPOS DE PRODUCTO Y DESCUENTOS
-- ============================================
-- Copia y pega este script en:
-- Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================

-- Agregar columna tipo_producto a la tabla productos
ALTER TABLE productos 
ADD COLUMN IF NOT EXISTS tipo_producto TEXT DEFAULT 'ropa';

-- Agregar columna descuento a la tabla productos
ALTER TABLE productos 
ADD COLUMN IF NOT EXISTS descuento INTEGER DEFAULT NULL;

-- Comentarios de las columnas
COMMENT ON COLUMN productos.tipo_producto IS 'Tipo de producto: ropa | perfumes | juguetes';
COMMENT ON COLUMN productos.descuento IS 'Porcentaje de descuento (ej: 10 = 10%, 25 = 25%). NULL = sin descuento';

-- Actualizar productos existentes (todos serán 'ropa' por defecto)
UPDATE productos SET tipo_producto = 'ropa' WHERE tipo_producto IS NULL;

-- ============================================
-- VERIFICAR QUE SE AGREGARON LAS COLUMNAS
-- ============================================
-- Ejecuta esta consulta para verificar:
-- SELECT id, nombre, tipo_producto, categoria, descuento FROM productos LIMIT 5;
