/**
 * Deduplicación de denuncias, acusados y archivos adjuntos.
 *
 * Trabajamos del lado del cliente con Web Crypto API y persistimos los hashes
 * conocidos en `localStorage`. Cuando exista un backend, los mismos
 * fingerprints sirven como claves canónicas (no hay que cambiar nada).
 */

const LS_KEY = 'enemigosdelpueblo.dedup.v1'

// ── Buckets de hashes conocidos ─────────────────────────────────────────────

interface KnownHashes {
  /** Hash → trackingId de la denuncia que ya está registrada. */
  records: Record<string, string>
  /** Hash → metadata del acusado (para mensajes contextuales). */
  acusados: Record<string, { displayName: string; denunciasCount: number }>
  /** Hash → archivo (display) que ya fue subido. */
  files: Record<string, { name: string; size: number; uploadedAt: string }>
}

function loadKnown(): KnownHashes {
  if (typeof window === 'undefined') {
    return { records: {}, acusados: {}, files: {} }
  }
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return { records: {}, acusados: {}, files: {} }
    const parsed = JSON.parse(raw) as Partial<KnownHashes>
    return {
      records: parsed.records ?? {},
      acusados: parsed.acusados ?? {},
      files: parsed.files ?? {},
    }
  } catch {
    return { records: {}, acusados: {}, files: {} }
  }
}

function persistKnown(known: KnownHashes) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(known))
  } catch { /* quota / private mode — degrade silently */ }
}

// ── Hash primitives (Web Crypto) ────────────────────────────────────────────

async function sha256Hex(buffer: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', buffer)
  const bytes = new Uint8Array(digest)
  let hex = ''
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0')
  }
  return hex
}

export async function sha256(text: string): Promise<string> {
  return sha256Hex(new TextEncoder().encode(text).buffer as ArrayBuffer)
}

export async function sha256File(file: File): Promise<string> {
  const buf = await file.arrayBuffer()
  return sha256Hex(buf)
}

// ── Canonicalización ────────────────────────────────────────────────────────

/**
 * Normaliza texto para hashing: lowercase, sin acentos, sin caracteres
 * especiales, espacios colapsados. Hace que "José Pérez", "JOSE  PEREZ" y
 * "jose.perez" matcheen como la misma persona.
 */
export function normalizeText(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // remove combining diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

// ── Fingerprint de acusado ──────────────────────────────────────────────────

export interface AcusadoFields {
  cedulaPrefix?: string
  cedula?: string
  nombres: string
  apellidos: string
  cargo?: string
  institucion?: string
  estado?: string
  municipio?: string
}

/**
 * Si la cédula está presente, mandó. Si no, derivamos un fingerprint a partir
 * del bloque demográfico — suficiente para detectar duplicados con alta
 * probabilidad aunque no haya cédula.
 */
export async function acusadoFingerprint(a: AcusadoFields): Promise<string> {
  const cedNorm = (a.cedula ?? '').replace(/\D/g, '')
  if (cedNorm) {
    return sha256(`cedula:${(a.cedulaPrefix ?? 'V').toUpperCase()}-${cedNorm}`)
  }
  const slug = [
    'demog',
    normalizeText(a.nombres),
    normalizeText(a.apellidos),
    normalizeText(a.cargo ?? ''),
    normalizeText(a.institucion ?? ''),
    normalizeText(a.estado ?? ''),
    normalizeText(a.municipio ?? ''),
  ].join('|')
  return sha256(slug)
}

// ── Fingerprint de denuncia ─────────────────────────────────────────────────

export interface DenunciaFields extends AcusadoFields {
  tipoDelito: string
  descripcion: string
  fecha?: string
  lugar?: string
}

/**
 * Fingerprint del registro completo: acusado + descripción + ubicación + fecha.
 * Si dos denuncias matchean este hash, son funcionalmente idénticas.
 */
export async function denunciaFingerprint(d: DenunciaFields): Promise<string> {
  const acusado = await acusadoFingerprint(d)
  const block = [
    'record',
    acusado,
    normalizeText(d.tipoDelito),
    normalizeText(d.descripcion),
    normalizeText(d.lugar ?? ''),
    (d.fecha ?? '').slice(0, 10),
  ].join('|')
  return sha256(block)
}

// ── Lookups ─────────────────────────────────────────────────────────────────

export function isFileKnown(hash: string): { name: string; size: number; uploadedAt: string } | null {
  const known = loadKnown()
  return known.files[hash] ?? null
}

export function isRecordKnown(hash: string): string | null {
  const known = loadKnown()
  return known.records[hash] ?? null
}

export function findAcusadoMatch(hash: string): { displayName: string; denunciasCount: number } | null {
  const known = loadKnown()
  return known.acusados[hash] ?? null
}

// ── Registration (after a successful submit) ────────────────────────────────

export function registerRecord(params: {
  recordHash: string
  acusadoHash: string
  acusadoDisplayName: string
  fileHashes: { hash: string; name: string; size: number }[]
  trackingId: string
}) {
  const known = loadKnown()
  known.records[params.recordHash] = params.trackingId
  const prev = known.acusados[params.acusadoHash]
  known.acusados[params.acusadoHash] = {
    displayName: params.acusadoDisplayName,
    denunciasCount: (prev?.denunciasCount ?? 0) + 1,
  }
  for (const f of params.fileHashes) {
    known.files[f.hash] = {
      name: f.name,
      size: f.size,
      uploadedAt: new Date().toISOString(),
    }
  }
  persistKnown(known)
}
