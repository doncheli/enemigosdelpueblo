import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

/**
 * Cliente de navegador con sesión sincronizada en cookies (para el panel de
 * administración). Usa el login del moderador; RLS aplica sus permisos.
 */
export function createSupabaseBrowser() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
