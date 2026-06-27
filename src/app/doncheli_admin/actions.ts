'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createSupabaseServer } from '@/lib/supabase/server'

/**
 * Verifica que el usuario actual sea moderador antes de cualquier acción.
 * Defensa adicional al RLS (que igualmente bloquea escrituras no autorizadas).
 */
async function requireModerador() {
  const supabase = await createSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/doncheli_admin/login')
  const { data: esModerador } = await supabase.rpc('es_moderador')
  if (!esModerador) redirect('/doncheli_admin/login')
  return { supabase, user }
}

function refrescar() {
  revalidatePath('/doncheli_admin')
  revalidatePath('/')
}

export async function aprobarDenuncia(denunciaId: string, acusadoId: string) {
  const { supabase, user } = await requireModerador()
  // Publica la denuncia y, para que sea visible, también su acusado.
  await supabase
    .from('denuncias')
    .update({ estado: 'PUBLICADA', moderado_en: new Date().toISOString(), moderado_por: user.id })
    .eq('id', denunciaId)
  await supabase.from('acusados').update({ estado_revision: 'PUBLICADA' }).eq('id', acusadoId)
  refrescar()
}

export async function rechazarDenuncia(denunciaId: string) {
  const { supabase, user } = await requireModerador()
  await supabase
    .from('denuncias')
    .update({ estado: 'RECHAZADA', moderado_en: new Date().toISOString(), moderado_por: user.id })
    .eq('id', denunciaId)
  refrescar()
}

export async function aprobarReplica(replicaId: string) {
  const { supabase } = await requireModerador()
  await supabase
    .from('replicas')
    .update({ estado: 'PUBLICADA', moderado_en: new Date().toISOString() })
    .eq('id', replicaId)
  refrescar()
}

export async function rechazarReplica(replicaId: string) {
  const { supabase } = await requireModerador()
  await supabase
    .from('replicas')
    .update({ estado: 'RECHAZADA', moderado_en: new Date().toISOString() })
    .eq('id', replicaId)
  refrescar()
}

export async function cerrarSesion() {
  const supabase = await createSupabaseServer()
  await supabase.auth.signOut()
  redirect('/doncheli_admin/login')
}
