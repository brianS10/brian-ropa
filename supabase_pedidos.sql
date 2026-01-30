-- ============================================
-- SISTEMA DE PEDIDOS - TABLAS ADICIONALES
-- ============================================
-- Ejecuta este script en Supabase SQL Editor
-- después de haber creado las tablas principales
-- ============================================

-- 1. TABLA: pedidos (Pedidos de clientes online)
CREATE TABLE IF NOT EXISTS pedidos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre_cliente TEXT NOT NULL,
  telefono TEXT NOT NULL,
  notas TEXT,
  estado TEXT DEFAULT 'pendiente',  -- pendiente | confirmado | entregado | cancelado
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  fecha_pedido TIMESTAMP WITH TIME ZONE DEFAULT now(),
  fecha_entrega TIMESTAMP WITH TIME ZONE,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para búsquedas
CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON pedidos(estado);
CREATE INDEX IF NOT EXISTS idx_pedidos_fecha ON pedidos(fecha_pedido);

COMMENT ON TABLE pedidos IS 'Pedidos realizados por clientes desde la tienda online';
COMMENT ON COLUMN pedidos.estado IS 'pendiente | confirmado | entregado | cancelado';

-- 2. TABLA: detalle_pedido (Productos en cada pedido)
CREATE TABLE IF NOT EXISTS detalle_pedido (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pedido_id UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  variante_id UUID NOT NULL REFERENCES variantes_producto(id),
  cantidad INTEGER NOT NULL DEFAULT 1,
  precio_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_detalle_pedido_id ON detalle_pedido(pedido_id);

COMMENT ON TABLE detalle_pedido IS 'Productos incluidos en cada pedido de cliente';

-- 3. POLÍTICAS DE SEGURIDAD
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE detalle_pedido ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas (para desarrollo)
CREATE POLICY "Permitir todo en pedidos" ON pedidos FOR ALL USING (true);
CREATE POLICY "Permitir todo en detalle_pedido" ON detalle_pedido FOR ALL USING (true);

-- ============================================
-- ¡LISTO! Ahora tienes las tablas de pedidos.
-- ============================================
