/**
 * Cliente de Supabase
 * ===================
 * Configuración centralizada para conectar con la base de datos.
 * Se importa en cualquier archivo que necesite acceso a Supabase.
 * 
 * Uso: import { supabase } from '@/lib/base_datos/cliente_supabase'
 */

import { createClient } from '@supabase/supabase-js'

const urlSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL
const claveAnonima = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Verificar si las variables están configuradas
const supabaseConfigurado = urlSupabase && claveAnonima && 
  urlSupabase !== 'AQUI_VA_TU_URL_DE_SUPABASE' && 
  claveAnonima !== 'AQUI_VA_TU_CLAVE_ANONIMA'

// Mostrar advertencia si no está configurado
if (!supabaseConfigurado && typeof window !== 'undefined') {
  console.warn(
    '⚠️ Supabase no está configurado. ' +
    'Edita el archivo .env.local con tus credenciales de Supabase.'
  )
}

// Crear cliente solo si hay credenciales válidas, sino usar un placeholder
export const supabase = supabaseConfigurado 
  ? createClient(urlSupabase, claveAnonima)
  : null

// Helper para verificar si Supabase está listo
export const estaConfigurado = () => supabaseConfigurado
