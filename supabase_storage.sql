-- =====================================================
-- CONFIGURACIÓN DE STORAGE PARA IMÁGENES
-- =====================================================
-- Ejecuta este script en Supabase SQL Editor
-- =====================================================

-- 1. Crear bucket para imágenes (si no existe)
INSERT INTO storage.buckets (id, name, public)
VALUES ('imagenes', 'imagenes', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Política para permitir subir imágenes (usuarios autenticados o anónimos)
CREATE POLICY "Permitir subir imagenes" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'imagenes');

-- 3. Política para permitir ver imágenes (público)
CREATE POLICY "Permitir ver imagenes" ON storage.objects
FOR SELECT USING (bucket_id = 'imagenes');

-- 4. Política para permitir eliminar imágenes
CREATE POLICY "Permitir eliminar imagenes" ON storage.objects
FOR DELETE USING (bucket_id = 'imagenes');

-- =====================================================
-- También necesitamos agregar el campo de imágenes a productos
-- =====================================================

-- Agregar columna para múltiples imágenes (array de URLs)
ALTER TABLE productos 
ADD COLUMN IF NOT EXISTS imagenes TEXT[] DEFAULT '{}';

-- Si ya tienes imagen_url, migrar a imagenes
UPDATE productos 
SET imagenes = ARRAY[imagen_url] 
WHERE imagen_url IS NOT NULL AND imagen_url != '' AND (imagenes IS NULL OR imagenes = '{}');

-- =====================================================
-- ¡LISTO! Ahora puedes subir imágenes
-- =====================================================
