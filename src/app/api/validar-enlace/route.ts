import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 60

const MODEL = 'gemini-2.5-flash'

function esYouTube(url: string) {
  return /(?:youtube\.com\/(?:watch\?v=|shorts\/|live\/)|youtu\.be\/)/i.test(url)
}

export async function POST(req: Request) {
  const key = process.env.GEMINI_API_KEY
  if (!key) {
    return NextResponse.json({ soportado: false, motivo: 'IA no configurada' })
  }

  let url = ''
  let descripcion = ''
  try {
    const body = await req.json()
    url = String(body.url || '').trim()
    descripcion = String(body.descripcion || '').trim()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  if (!url || !descripcion) {
    return NextResponse.json({ error: 'Faltan url o descripcion' }, { status: 400 })
  }

  // Solo se puede analizar el contenido de videos de YouTube directamente.
  if (!esYouTube(url)) {
    return NextResponse.json({
      soportado: false,
      motivo: 'Solo se valida el contenido de videos de YouTube. Otras redes requieren revisión humana.',
    })
  }

  const prompt = `Eres un verificador de denuncias ciudadanas. Te doy un VIDEO y la DESCRIPCIÓN escrita por el denunciante.
Evalúa si el contenido del video respalda/coincide con la descripción.

DESCRIPCIÓN DEL DENUNCIANTE:
"""${descripcion}"""

Responde SOLO JSON con:
{
  "coincide": boolean,        // true si el video respalda la descripción
  "confianza": number,        // 0 a 1
  "resumen": string,          // qué se ve en el video (1-2 frases)
  "razon": string             // por qué coincide o no (1 frase)
}`

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ fileData: { fileUri: url } }, { text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.1 },
        }),
      },
    )

    if (!res.ok) {
      return NextResponse.json({
        soportado: false,
        motivo: 'No se pudo analizar el video (puede ser privado o no accesible).',
      })
    }

    const data = await res.json()
    const txt = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    let verdict: { coincide?: boolean; confianza?: number; resumen?: string; razon?: string } = {}
    try {
      verdict = JSON.parse(txt)
    } catch {
      return NextResponse.json({ soportado: false, motivo: 'Respuesta de IA no interpretable.' })
    }

    return NextResponse.json({
      soportado: true,
      coincide: !!verdict.coincide,
      confianza: typeof verdict.confianza === 'number' ? verdict.confianza : 0,
      resumen: verdict.resumen ?? '',
      razon: verdict.razon ?? '',
    })
  } catch {
    return NextResponse.json({ soportado: false, motivo: 'Error al contactar la IA.' })
  }
}
