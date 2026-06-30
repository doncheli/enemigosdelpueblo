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
  const { supabase } = await requireModerador()
  // Publica la denuncia y, para que sea visible, también su acusado.
  // No se guarda quién moderó (moderado_por) por anonimato del operador.
  await supabase
    .from('denuncias')
    .update({ estado: 'PUBLICADA', moderado_en: new Date().toISOString() })
    .eq('id', denunciaId)
  await supabase.from('acusados').update({ estado_revision: 'PUBLICADA' }).eq('id', acusadoId)
  refrescar()
}

export async function rechazarDenuncia(denunciaId: string, acusadoId?: string) {
  const { supabase } = await requireModerador()
  await supabase
    .from('denuncias')
    .update({ estado: 'RECHAZADA', moderado_en: new Date().toISOString() })
    .eq('id', denunciaId)

  // Si el acusado se queda sin denuncias publicadas, se oculta también.
  if (acusadoId) {
    const { count } = await supabase
      .from('denuncias')
      .select('id', { count: 'exact', head: true })
      .eq('acusado_id', acusadoId)
      .eq('estado', 'PUBLICADA')
    if (!count) {
      await supabase.from('acusados').update({ estado_revision: 'RECHAZADA' }).eq('id', acusadoId)
    }
  }
  refrescar()
}

export async function actualizarDenuncia(formData: FormData) {
  const { supabase } = await requireModerador()
  const denunciaId = String(formData.get('denunciaId') || '')
  const acusadoId = String(formData.get('acusadoId') || '')
  if (!denunciaId || !acusadoId) redirect('/doncheli_admin')

  const txt = (k: string) => {
    const v = formData.get(k)
    const t = typeof v === 'string' ? v.trim() : ''
    return t.length ? t : null
  }
  const num = (k: string) => {
    const v = txt(k)
    if (v === null) return null
    const n = Number(v)
    return Number.isFinite(n) ? n : null
  }

  await supabase
    .from('acusados')
    .update({
      nombres: txt('nombres') ?? '',
      apellidos: txt('apellidos') ?? '',
      cedula: txt('cedula'),
      cedula_prefix: txt('cedula_prefix'),
      cargo: txt('cargo'),
      institucion: txt('institucion'),
      estado: txt('estado'),
      municipio: txt('municipio'),
    })
    .eq('id', acusadoId)

  await supabase
    .from('denuncias')
    .update({
      tipo: (txt('tipo') ?? 'OTRO') as 'CORRUPCIÓN' | 'EXTORSIÓN' | 'ABUSO DE AUTORIDAD' | 'OTRO',
      descripcion: txt('descripcion') ?? '',
      origen: (txt('origen') ?? 'TESTIMONIO') as
        | 'TESTIMONIO'
        | 'REDES_SOCIALES'
        | 'PRENSA'
        | 'REGISTRO_OFICIAL'
        | 'OTRO',
      ocurrido_en: txt('ocurrido_en'),
      lat: num('lat'),
      lng: num('lng'),
    })
    .eq('id', denunciaId)

  revalidatePath('/')
  revalidatePath('/doncheli_admin')
  redirect('/doncheli_admin')
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
