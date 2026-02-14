-- ============================================
-- AGREGAR TIPOS DE PRODUCTO
-- ============================================
-- Copia y pega este script en:
-- Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================

-- Agregar columna tipo_producto a la tabla productos
ALTER TABLE productos 
ADD COLUMN IF NOT EXISTS tipo_producto TEXT DEFAULT 'ropa';

-- Comentario de la columna
COMMENT ON COLUMN productos.tipo_producto IS 'Tipo de producto: ropa | perfumes | juguetes';

-- Actualizar productos existentes (todos serán 'ropa' por defecto)
UPDATE productos SET tipo_producto = 'ropa' WHERE tipo_producto IS NULL;

-- ============================================
-- VERIFICAR QUE SE AGREGÓ LA COLUMNA
-- ============================================
-- Ejecuta esta consulta para verificar:
-- SELECT id, nombre, tipo_producto, categoria FROM productos LIMIT 5;
