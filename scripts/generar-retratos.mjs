// Genera retratos ficticios (estilo foto de ficha) para los acusados de prueba
// con Imagen 4 (Gemini API), los sube a Storage y actualiza foto_url.
//
// Uso:  GEMINI_API_KEY=xxx node --env-file=.env.local scripts/generar-retratos.mjs
import { createClient } from '@supabase/supabase-js'

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY
const GKEY = process.env.GEMINI_API_KEY
if (!SUPA_URL || !SERVICE || !GKEY) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY o GEMINI_API_KEY')
  process.exit(1)
}
const db = createClient(SUPA_URL, SERVICE, { auth: { persistSession: false } })
const MODEL = 'imagen-4.0-fast-generate-001'

const BASE =
  'studio ID headshot photograph, front-facing, neutral expression, plain light gray seamless background, even studio lighting, sharp focus, realistic. Fictional person, not a real individual.'

const RETRATOS = [
  { cedula: '00000001', prompt: `${BASE} A fictional Latin American man in his 50s, short graying hair, wearing a dark business suit and tie.` },
  { cedula: '00000002', prompt: `${BASE} A fictional Latin American woman in her 40s, hair tied back, wearing a plain dark uniform-style collared shirt.` },
  { cedula: '00000003', prompt: `${BASE} A fictional Latin American man in his mid-40s, short dark hair, light mustache, wearing a plain collared shirt.` },
  { cedula: '00000004', prompt: `${BASE} A fictional Latin American man in his 50s, balding, wearing glasses and a gray business suit.` },
]

// Bucket público para retratos
await db.storage.createBucket('retratos', { public: true }).catch(() => {})
const { error: bErr } = await db.storage.createBucket('retratos', { public: true })
if (bErr && !/already exists/i.test(bErr.message)) console.warn('bucket:', bErr.message)

async function generar(prompt) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:predict?key=${GKEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: { sampleCount: 1, aspectRatio: '3:4' },
      }),
    },
  )
  if (!res.ok) throw new Error(`Imagen ${res.status}: ${await res.text()}`)
  const json = await res.json()
  const p = json.predictions?.[0]
  if (!p?.bytesBase64Encoded) throw new Error('sin imagen en la respuesta')
  return { buffer: Buffer.from(p.bytesBase64Encoded, 'base64'), mime: p.mimeType || 'image/png' }
}

for (const r of RETRATOS) {
  try {
    const { buffer, mime } = await generar(r.prompt)
    const ext = mime.includes('jpeg') ? 'jpg' : 'png'
    const path = `${r.cedula}.${ext}`
    const { error: upErr } = await db.storage
      .from('retratos')
      .upload(path, buffer, { contentType: mime, upsert: true })
    if (upErr) throw upErr
    const { data: pub } = db.storage.from('retratos').getPublicUrl(path)
    const { error: updErr } = await db
      .from('acusados')
      .update({ foto_url: pub.publicUrl })
      .eq('cedula', r.cedula)
    if (updErr) throw updErr
    console.log(`  ✓ ${r.cedula} -> ${pub.publicUrl} (${(buffer.length / 1024).toFixed(0)} KB)`)
  } catch (e) {
    console.error(`  ✗ ${r.cedula}:`, e.message)
  }
}
console.log('Listo.')
