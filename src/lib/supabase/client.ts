import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Cliente público (anon). Respeta RLS: solo lee contenido PUBLICADO y solo
 * puede crear envíos en estado PENDIENTE. Seguro para usar en el navegador.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
