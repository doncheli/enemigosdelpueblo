import 'server-only'
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * Cliente de administración (service_role). OMITE RLS — úsalo SOLO en código
 * de servidor (route handlers, server actions) para moderar: publicar,
 * rechazar o editar denuncias y réplicas. NUNCA importar desde el cliente.
 */
export const supabaseAdmin = createClient<Database>(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})
