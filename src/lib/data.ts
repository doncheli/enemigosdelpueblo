import { supabase } from './supabase/client'
import { sanitizarEvidencia } from './sanitize'
import type {
  Acusado,
  DenunciaPublicada,
  TipoDelito,
  TrackingResult,
  TrackingStep,
  Evidencia,
} from '@/types'
import type { Database } from './supabase/types'

type AcusadoRow = Database['public']['Tables']['acusados']['Row']
type DenunciaRow = Database['public']['Tables']['denuncias']['Row']
type EvidenciaRow = Database['public']['Tables']['evidencias']['Row']

// ---------------------------------------------------------------------------
// Mapeo DB (snake_case) -> tipos de la app (camelCase)
// ---------------------------------------------------------------------------
function mapAcusado(row: AcusadoRow, delitos: TipoDelito[] = []): Acusado {
  return {
    cedula: row.cedula ?? row.id,
    cedulaPrefix: (row.cedula_prefix as Acusado['cedulaPrefix']) ?? 'V',
    nombres: row.nombres,
    apellidos: row.apellidos,
    cargo: row.cargo ?? '',
    institucion: row.institucion ?? '',
    estado: row.estado ?? '',
    municipio: row.municipio ?? undefined,
    fotoUrl: row.foto_url ?? undefined,
    delitos,
    denunciasCount: row.denuncias_count,
    activo: row.activo,
  }
}

function mapEvidencia(row: EvidenciaRow): Evidencia {
  return {
    tipo: row.tipo,
    thumbnailUrl: row.url ?? undefined,
    nombre: row.nombre ?? undefined,
  }
}

function mapDenuncia(row: DenunciaRow, evidencias: EvidenciaRow[]): DenunciaPublicada {
  return {
    id: row.codigo,
    fecha: new Date(row.created_at).toLocaleDateString('es-VE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    tipo: row.tipo,
    descripcion: row.descripcion,
    evidencias: evidencias.map(mapEvidencia),
    aiScore: row.ai_score ?? 0,
    estado: 'PUBLICADA',
  }
}

// ---------------------------------------------------------------------------
// Catálogo: acusados publicados (con sus tipos de delito publicados)
// ---------------------------------------------------------------------------
export async function getAcusadosPublicados(): Promise<Acusado[]> {
  const { data: acusados, error } = await supabase
    .from('acusados')
    .select('*')
    .order('denuncias_count', { ascending: false })

  if (error || !acusados) return []

  // Tipos de delito por acusado (a partir de denuncias publicadas)
  const { data: denuncias } = await supabase.from('denuncias').select('acusado_id, tipo')
  const delitosPorAcusado = new Map<string, Set<TipoDelito>>()
  for (const d of denuncias ?? []) {
    const set = delitosPorAcusado.get(d.acusado_id) ?? new Set<TipoDelito>()
    set.add(d.tipo)
    delitosPorAcusado.set(d.acusado_id, set)
  }

  return acusados.map((a) =>
    mapAcusado(a, Array.from(delitosPorAcusado.get(a.id) ?? [])),
  )
}

// ---------------------------------------------------------------------------
// Perfil: acusado por cédula + denuncias publicadas + réplicas publicadas
// ---------------------------------------------------------------------------
export type Replica = {
  id: string
  contenido: string
  autor: string | null
  fecha: string
}

export type AcusadoDetalle = Acusado & {
  denuncias: DenunciaPublicada[]
  replicas: Replica[]
}

// ---------------------------------------------------------------------------
// Mapa: ubicaciones de hechos publicados con coordenadas
// ---------------------------------------------------------------------------
export type PuntoMapa = {
  id: string
  lat: number
  lng: number
  tipo: TipoDelito
  codigo: string
  acusado: string
  cedula: string | null
}

export async function getUbicacionesMapa(): Promise<PuntoMapa[]> {
  const { data } = await supabase
    .from('denuncias')
    .select('id, codigo, tipo, lat, lng, acusados(nombres, apellidos, cedula)')
    .not('lat', 'is', null)
    .not('lng', 'is', null)

  return (data ?? [])
    .map((d) => {
      const a = Array.isArray(d.acusados) ? d.acusados[0] : d.acusados
      return {
        id: d.id,
        lat: Number(d.lat),
        lng: Number(d.lng),
        tipo: d.tipo,
        codigo: d.codigo,
        acusado: a ? `${a.nombres} ${a.apellidos}` : 'Acusado',
        cedula: a?.cedula ?? null,
      }
    })
    .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng))
}

export async function getAcusadoPorCedula(cedula: string): Promise<AcusadoDetalle | null> {
  const { data: acusado } = await supabase
    .from('acusados')
    .select('*')
    .eq('cedula', cedula)
    .maybeSingle()

  if (!acusado) return null

  const { data: denuncias } = await supabase
    .from('denuncias')
    .select('*')
    .eq('acusado_id', acusado.id)
    .order('created_at', { ascending: false })

  const denunciaIds = (denuncias ?? []).map((d) => d.id)
  const { data: evidencias } = denunciaIds.length
    ? await supabase.from('evidencias').select('*').in('denuncia_id', denunciaIds)
    : { data: [] as EvidenciaRow[] }

  const evPorDenuncia = new Map<string, EvidenciaRow[]>()
  for (const e of evidencias ?? []) {
    const arr = evPorDenuncia.get(e.denuncia_id) ?? []
    arr.push(e)
    evPorDenuncia.set(e.denuncia_id, arr)
  }

  const { data: replicas } = await supabase
    .from('replicas')
    .select('id, contenido, autor, created_at')
    .eq('acusado_id', acusado.id)
    .order('created_at', { ascending: false })

  const delitos = Array.from(new Set((denuncias ?? []).map((d) => d.tipo))) as TipoDelito[]

  return {
    ...mapAcusado(acusado, delitos),
    id: acusado.id,
    denuncias: (denuncias ?? []).map((d) => mapDenuncia(d, evPorDenuncia.get(d.id) ?? [])),
    replicas: (replicas ?? []).map((r) => ({
      id: r.id,
      contenido: r.contenido,
      autor: r.autor,
      fecha: new Date(r.created_at).toLocaleDateString('es-VE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    })),
  } as AcusadoDetalle & { id: string }
}

// ---------------------------------------------------------------------------
// Derecho de réplica: el acusado envía su respuesta (queda PENDIENTE)
// ---------------------------------------------------------------------------
export async function crearReplica(input: {
  acusadoId: string
  contenido: string
  autor?: string
  contacto?: string
}): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from('replicas').insert({
    acusado_id: input.acusadoId,
    contenido: input.contenido,
    autor: input.autor || null,
    contacto: input.contacto || null,
    estado: 'PENDIENTE',
  })
  return error ? { ok: false, error: error.message } : { ok: true }
}

// ---------------------------------------------------------------------------
// Seguimiento por código (RPC segura, ve cualquier estado)
// ---------------------------------------------------------------------------
function buildTimeline(estado: string, createdAt: string, moderadoEn: string | null): TrackingStep[] {
  const fmt = (iso: string) => {
    const d = new Date(iso)
    return {
      fecha: d.toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' }),
      hora: d.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' }),
    }
  }
  const recibido = fmt(createdAt)
  const steps: TrackingStep[] = [
    {
      status: 'COMPLETADO',
      titulo: 'Denuncia recibida',
      descripcion: 'Tu denuncia fue registrada correctamente en el sistema.',
      ...recibido,
    },
  ]

  if (estado === 'RECHAZADA') {
    steps.push({
      status: 'COMPLETADO',
      titulo: 'Denuncia rechazada',
      descripcion: 'Tras la revisión, la denuncia no pudo ser verificada y no será publicada.',
      ...(moderadoEn ? fmt(moderadoEn) : {}),
    })
    return steps
  }

  steps.push({
    status: estado === 'PENDIENTE' ? 'EN_PROGRESO' : 'COMPLETADO',
    titulo: 'En revisión editorial',
    descripcion: 'Un moderador verifica la veracidad y las evidencias de la denuncia.',
    ...(estado !== 'PENDIENTE' && moderadoEn ? fmt(moderadoEn) : {}),
  })

  steps.push({
    status: estado === 'PUBLICADA' ? 'COMPLETADO' : 'PENDIENTE',
    titulo: estado === 'PUBLICADA' ? 'Publicada' : 'Decisión final',
    descripcion:
      estado === 'PUBLICADA'
        ? 'La denuncia fue verificada y publicada en el catálogo ciudadano.'
        : 'La denuncia será publicada o rechazada tras la validación humana.',
    ...(estado === 'PUBLICADA' && moderadoEn ? fmt(moderadoEn) : {}),
  })

  return steps
}

export async function getSeguimiento(codigo: string): Promise<TrackingResult | null> {
  const { data, error } = await supabase.rpc('obtener_seguimiento', { p_codigo: codigo })
  if (error || !data || data.length === 0) return null
  const r = data[0]

  return {
    id: r.codigo,
    acusado: {
      nombres: r.acusado_nombres,
      apellidos: r.acusado_apellidos,
      cargo: r.acusado_cargo ?? '',
      institucion: r.acusado_institucion ?? '',
      estado: r.acusado_estado ?? '',
      fotoUrl: r.acusado_foto_url ?? undefined,
    },
    tipo: r.tipo,
    estado: r.estado,
    aiScore: r.ai_score ?? undefined,
    timeline: buildTimeline(r.estado, r.created_at, r.moderado_en),
  }
}

// ---------------------------------------------------------------------------
// Crear denuncia: sube evidencias a Storage y llama a la RPC crear_denuncia
// ---------------------------------------------------------------------------
function evidenciaTipo(mime: string): Evidencia['tipo'] {
  if (mime.startsWith('image/')) return 'IMAGEN'
  if (mime.startsWith('video/')) return 'VIDEO'
  if (mime.startsWith('audio/')) return 'AUDIO'
  return 'DOCUMENTO'
}

export async function crearDenuncia(input: {
  acusado: {
    cedulaPrefix?: string
    cedula?: string
    nombres: string
    apellidos: string
    cargo?: string
    institucion?: string
    estado?: string
    municipio?: string
  }
  tipo: TipoDelito
  descripcion: string
  ocurridoEn?: string
  files: { file: File; hash: string }[]
}): Promise<{ codigo: string } | { error: string }> {
  // 1) Anonimizar y subir evidencias. Las imágenes se re-codifican para
  //    eliminar metadatos (EXIF/GPS) y nunca se guarda el nombre original
  //    del archivo: cero datos del denunciante.
  const evidencias: { tipo: string; url: string; nombre: string }[] = []
  for (let i = 0; i < input.files.length; i++) {
    const original = input.files[i].file
    const { file, nombre } = await sanitizarEvidencia(original, i)
    const fileExt = nombre.split('.').pop() || 'bin'
    // Ruta aleatoria (no derivada del contenido ni del denunciante).
    const rand = crypto.randomUUID()
    const path = `${rand}.${fileExt}`
    const { error: upErr } = await supabase.storage.from('evidencias').upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })
    if (upErr) {
      console.warn('Fallo al subir evidencia', upErr.message)
      continue
    }
    const { data: pub } = supabase.storage.from('evidencias').getPublicUrl(path)
    evidencias.push({ tipo: evidenciaTipo(original.type), url: pub.publicUrl, nombre })
  }

  // 2) Crear denuncia (RPC atómica). Devuelve el código de seguimiento.
  const { data, error } = await supabase.rpc('crear_denuncia', {
    p_acusado: {
      cedula_prefix: input.acusado.cedulaPrefix ?? null,
      cedula: input.acusado.cedula ?? null,
      nombres: input.acusado.nombres,
      apellidos: input.acusado.apellidos,
      cargo: input.acusado.cargo ?? null,
      institucion: input.acusado.institucion ?? null,
      estado: input.acusado.estado ?? null,
      municipio: input.acusado.municipio ?? null,
    },
    p_tipo: input.tipo,
    p_descripcion: input.descripcion,
    p_ocurrido_en: input.ocurridoEn || undefined,
    p_evidencias: evidencias,
  })

  if (error || !data) return { error: error?.message ?? 'No se pudo registrar la denuncia' }
  return { codigo: data as string }
}
