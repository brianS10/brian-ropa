-- =====================================================
-- DATOS DE PRUEBA - Productos de Pantalones
-- =====================================================
-- Ejecuta este script en Supabase:
-- 1. Ve a https://supabase.com/dashboard
-- 2. Selecciona tu proyecto
-- 3. Ve a "SQL Editor" (icono de base de datos)
-- 4. Pega todo este código y haz clic en "Run"
-- =====================================================

-- Primero insertamos los productos
INSERT INTO productos (nombre, descripcion, categoria, estado) VALUES
('Pantalón Mezclilla Clásico', 'Pantalón de mezclilla azul corte recto, ideal para uso diario', 'mezclilla', true),
('Pantalón Mezclilla Skinny', 'Pantalón ajustado de mezclilla stretch, muy cómodo', 'mezclilla', true),
('Pantalón Mezclilla Negro', 'Mezclilla negra, corte slim fit moderno', 'mezclilla', true),
('Pantalón Cargo Café', 'Pantalón cargo con bolsillos laterales, estilo casual', 'cargo', true),
('Pantalón Cargo Verde Militar', 'Cargo verde olivo con múltiples bolsillos', 'cargo', true),
('Pantalón de Vestir Negro', 'Pantalón formal negro, perfecto para oficina', 'vestir', true),
('Pantalón de Vestir Gris', 'Pantalón formal gris oxford, corte ejecutivo', 'vestir', true),
('Pantalón de Vestir Azul Marino', 'Formal azul marino, ideal para eventos', 'vestir', true),
('Jogger Negro Deportivo', 'Jogger cómodo para ejercicio o uso casual', 'deportivo', true),
('Jogger Gris Jaspeado', 'Jogger de algodón suave, muy versátil', 'deportivo', true),
('Pantalón Chino Beige', 'Chino clásico beige, estilo casual elegante', 'casual', true),
('Pantalón Chino Azul', 'Chino azul navy, combinable con todo', 'casual', true),
('Short Mezclilla', 'Short de mezclilla para verano', 'short', true),
('Short Cargo Beige', 'Short cargo con bolsillos, ideal para playa', 'short', true),
('Pantalón Mezclilla Roto', 'Mezclilla con desgaste y roturas de moda', 'mezclilla', true);

-- Ahora insertamos las variantes (tallas, colores y PRECIOS) para cada producto

-- Producto 1: Pantalón Mezclilla Clásico - $299
INSERT INTO variantes_producto (producto_id, talla, color, precio_venta, precio_costo, stock_actual, stock_minimo) 
SELECT id, talla, 'Azul', 299.00, 150.00, stock, 3
FROM productos, 
     (VALUES ('28', 10), ('30', 15), ('32', 20), ('34', 15), ('36', 8)) AS t(talla, stock)
WHERE nombre = 'Pantalón Mezclilla Clásico';

-- Producto 2: Pantalón Mezclilla Skinny - $349
INSERT INTO variantes_producto (producto_id, talla, color, precio_venta, precio_costo, stock_actual, stock_minimo)
SELECT id, talla, color, 349.00, 180.00, stock, 3
FROM productos,
     (VALUES 
       ('28', 'Azul', 8), ('30', 'Azul', 12), ('32', 'Azul', 15), ('34', 'Azul', 10),
       ('28', 'Negro', 6), ('30', 'Negro', 10), ('32', 'Negro', 12), ('34', 'Negro', 8)
     ) AS t(talla, color, stock)
WHERE nombre = 'Pantalón Mezclilla Skinny';

-- Producto 3: Pantalón Mezclilla Negro - $329
INSERT INTO variantes_producto (producto_id, talla, color, precio_venta, precio_costo, stock_actual, stock_minimo)
SELECT id, talla, 'Negro', 329.00, 170.00, stock, 3
FROM productos,
     (VALUES ('28', 7), ('30', 12), ('32', 18), ('34', 14), ('36', 6)) AS t(talla, stock)
WHERE nombre = 'Pantalón Mezclilla Negro';

-- Producto 4: Pantalón Cargo Café - $279
INSERT INTO variantes_producto (producto_id, talla, color, precio_venta, precio_costo, stock_actual, stock_minimo)
SELECT id, talla, 'Café', 279.00, 140.00, stock, 2
FROM productos,
     (VALUES ('30', 8), ('32', 12), ('34', 10), ('36', 6)) AS t(talla, stock)
WHERE nombre = 'Pantalón Cargo Café';

-- Producto 5: Pantalón Cargo Verde Militar - $289
INSERT INTO variantes_producto (producto_id, talla, color, precio_venta, precio_costo, stock_actual, stock_minimo)
SELECT id, talla, 'Verde Militar', 289.00, 145.00, stock, 2
FROM productos,
     (VALUES ('28', 5), ('30', 10), ('32', 15), ('34', 12), ('36', 7)) AS t(talla, stock)
WHERE nombre = 'Pantalón Cargo Verde Militar';

-- Producto 6: Pantalón de Vestir Negro - $399
INSERT INTO variantes_producto (producto_id, talla, color, precio_venta, precio_costo, stock_actual, stock_minimo)
SELECT id, talla, 'Negro', 399.00, 200.00, stock, 2
FROM productos,
     (VALUES ('28', 4), ('30', 8), ('32', 12), ('34', 10), ('36', 5)) AS t(talla, stock)
WHERE nombre = 'Pantalón de Vestir Negro';

-- Producto 7: Pantalón de Vestir Gris - $379
INSERT INTO variantes_producto (producto_id, talla, color, precio_venta, precio_costo, stock_actual, stock_minimo)
SELECT id, talla, 'Gris', 379.00, 190.00, stock, 2
FROM productos,
     (VALUES ('30', 6), ('32', 10), ('34', 8), ('36', 4)) AS t(talla, stock)
WHERE nombre = 'Pantalón de Vestir Gris';

-- Producto 8: Pantalón de Vestir Azul Marino - $389
INSERT INTO variantes_producto (producto_id, talla, color, precio_venta, precio_costo, stock_actual, stock_minimo)
SELECT id, talla, 'Azul Marino', 389.00, 195.00, stock, 2
FROM productos,
     (VALUES ('30', 5), ('32', 9), ('34', 7), ('36', 3)) AS t(talla, stock)
WHERE nombre = 'Pantalón de Vestir Azul Marino';

-- Producto 9: Jogger Negro Deportivo - $249
INSERT INTO variantes_producto (producto_id, talla, color, precio_venta, precio_costo, stock_actual, stock_minimo)
SELECT id, talla, 'Negro', 249.00, 120.00, stock, 3
FROM productos,
     (VALUES ('S', 10), ('M', 15), ('L', 12), ('XL', 8)) AS t(talla, stock)
WHERE nombre = 'Jogger Negro Deportivo';

-- Producto 10: Jogger Gris Jaspeado - $239
INSERT INTO variantes_producto (producto_id, talla, color, precio_venta, precio_costo, stock_actual, stock_minimo)
SELECT id, talla, 'Gris Jaspeado', 239.00, 115.00, stock, 3
FROM productos,
     (VALUES ('S', 8), ('M', 14), ('L', 11), ('XL', 6)) AS t(talla, stock)
WHERE nombre = 'Jogger Gris Jaspeado';

-- Producto 11: Pantalón Chino Beige - $319
INSERT INTO variantes_producto (producto_id, talla, color, precio_venta, precio_costo, stock_actual, stock_minimo)
SELECT id, talla, 'Beige', 319.00, 160.00, stock, 2
FROM productos,
     (VALUES ('30', 7), ('32', 11), ('34', 9), ('36', 5)) AS t(talla, stock)
WHERE nombre = 'Pantalón Chino Beige';

-- Producto 12: Pantalón Chino Azul - $319
INSERT INTO variantes_producto (producto_id, talla, color, precio_venta, precio_costo, stock_actual, stock_minimo)
SELECT id, talla, 'Azul Navy', 319.00, 160.00, stock, 2
FROM productos,
     (VALUES ('30', 6), ('32', 10), ('34', 8), ('36', 4)) AS t(talla, stock)
WHERE nombre = 'Pantalón Chino Azul';

-- Producto 13: Short Mezclilla - $199
INSERT INTO variantes_producto (producto_id, talla, color, precio_venta, precio_costo, stock_actual, stock_minimo)
SELECT id, talla, color, 199.00, 100.00, stock, 3
FROM productos,
     (VALUES 
       ('28', 'Azul', 8), ('30', 'Azul', 12), ('32', 'Azul', 10), ('34', 'Azul', 6),
       ('28', 'Negro', 5), ('30', 'Negro', 8), ('32', 'Negro', 7), ('34', 'Negro', 4)
     ) AS t(talla, color, stock)
WHERE nombre = 'Short Mezclilla';

-- Producto 14: Short Cargo Beige - $179
INSERT INTO variantes_producto (producto_id, talla, color, precio_venta, precio_costo, stock_actual, stock_minimo)
SELECT id, talla, 'Beige', 179.00, 90.00, stock, 2
FROM productos,
     (VALUES ('30', 9), ('32', 13), ('34', 10), ('36', 6)) AS t(talla, stock)
WHERE nombre = 'Short Cargo Beige';

-- Producto 15: Pantalón Mezclilla Roto - $369
INSERT INTO variantes_producto (producto_id, talla, color, precio_venta, precio_costo, stock_actual, stock_minimo)
SELECT id, talla, 'Azul Desgastado', 369.00, 190.00, stock, 2
FROM productos,
     (VALUES ('28', 4), ('30', 8), ('32', 10), ('34', 7)) AS t(talla, stock)
WHERE nombre = 'Pantalón Mezclilla Roto';

-- =====================================================
-- ¡LISTO! Ahora tienes 15 productos con sus variantes
-- Total aproximado: 15 productos y ~70 variantes
-- =====================================================
