// Seed de 4 casos de PRUEBA (datos ficticios) directamente en Supabase.
// Usa service_role para insertar como PUBLICADA y que aparezcan en el catálogo.
// Cédulas 0000000X => fáciles de identificar y limpiar.
//
// Uso:  node --env-file=.env.local scripts/seed-casos-prueba.mjs
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}
const db = createClient(url, key, { auth: { persistSession: false } })

const CASOS = [
  {
    acusado: {
      cedula: '00000001', cedula_prefix: 'V', nombres: 'Ramón Antonio', apellidos: 'Pérez Galindo',
      cargo: 'Director de Contrataciones', institucion: 'Alcaldía (caso de prueba)',
      estado: 'Distrito Capital', municipio: 'Libertador', estado_revision: 'PUBLICADA',
    },
    denuncias: [
      {
        tipo: 'CORRUPCIÓN', ai_score: 0.88, origen: 'TESTIMONIO',
        descripcion: 'Adjudicación directa de contratos de obra a una empresa vinculada a un familiar, sin licitación ni control. Sobreprecios documentados por vecinos del sector.',
        evidencias: [{ tipo: 'DOCUMENTO' }, { tipo: 'IMAGEN' }],
      },
    ],
  },
  {
    acusado: {
      cedula: '00000002', cedula_prefix: 'V', nombres: 'Luisa Carolina', apellidos: 'Mendoza Rangel',
      cargo: 'Oficial de Seguridad', institucion: 'Cuerpo policial (caso de prueba)',
      estado: 'Carabobo', municipio: 'Valencia', estado_revision: 'PUBLICADA',
    },
    denuncias: [
      {
        tipo: 'ABUSO DE AUTORIDAD', ai_score: 0.91, origen: 'REDES_SOCIALES',
        descripcion: 'Detención arbitraria y trato violento a comerciantes durante un operativo nocturno, sin orden judicial ni acta. Reportado por testigos en redes sociales.',
        evidencias: [{ tipo: 'VIDEO' }, { tipo: 'IMAGEN' }],
      },
    ],
  },
  {
    acusado: {
      cedula: '00000003', cedula_prefix: 'V', nombres: 'Jesús Eduardo', apellidos: 'Salcedo Marín',
      cargo: 'Inspector de Tránsito', institucion: 'Instituto de transporte (caso de prueba)',
      estado: 'Zulia', municipio: 'Maracaibo', estado_revision: 'PUBLICADA',
    },
    denuncias: [
      {
        tipo: 'EXTORSIÓN', ai_score: 0.84, origen: 'TESTIMONIO',
        descripcion: 'Cobro de "peaje" semanal a transportistas para permitir la libre circulación, bajo amenaza de multas inventadas y retención de vehículos.',
        evidencias: [{ tipo: 'AUDIO' }],
      },
    ],
  },
  {
    acusado: {
      cedula: '00000004', cedula_prefix: 'V', nombres: 'Gregorio José', apellidos: 'Villalba Ochoa',
      cargo: 'Jefe de Despacho', institucion: 'Ente público (caso de prueba)',
      estado: 'Miranda', municipio: 'Sucre', estado_revision: 'PUBLICADA',
    },
    denuncias: [
      {
        tipo: 'CORRUPCIÓN', ai_score: 0.79, origen: 'PRENSA',
        descripcion: 'Desvío de fondos destinados a un programa social hacia cuentas personales, según una investigación periodística local.',
        evidencias: [{ tipo: 'DOCUMENTO' }],
      },
      {
        tipo: 'EXTORSIÓN', ai_score: 0.86, origen: 'TESTIMONIO',
        descripcion: 'Exigencia de pagos a beneficiarios para "agilizar" trámites que deberían ser gratuitos, bajo amenaza de excluirlos del programa.',
        evidencias: [{ tipo: 'IMAGEN' }, { tipo: 'DOCUMENTO' }],
      },
    ],
    replica: {
      autor: 'Representación legal (caso de prueba)',
      contenido: 'Los señalamientos son falsos y carecen de sustento. Mi representado nunca ha manejado los fondos referidos y se reserva las acciones legales correspondientes.',
    },
  },
]

let total = 0
for (const caso of CASOS) {
  const { data: acusado, error: aErr } = await db
    .from('acusados').insert(caso.acusado).select('id').single()
  if (aErr) { console.error('acusado', caso.acusado.cedula, aErr.message); continue }

  for (const d of caso.denuncias) {
    const { evidencias = [], ...den } = d
    const { data: denuncia, error: dErr } = await db
      .from('denuncias')
      .insert({ ...den, acusado_id: acusado.id, estado: 'PUBLICADA' })
      .select('id, codigo').single()
    if (dErr) { console.error('denuncia', dErr.message); continue }
    total++
    if (evidencias.length) {
      await db.from('evidencias').insert(
        evidencias.map((e) => ({ ...e, denuncia_id: denuncia.id })),
      )
    }
    console.log(`  ✓ ${caso.acusado.apellidos} — ${den.tipo} — ${denuncia.codigo}`)
  }

  if (caso.replica) {
    await db.from('replicas').insert({
      acusado_id: acusado.id, contenido: caso.replica.contenido,
      autor: caso.replica.autor, estado: 'PUBLICADA',
    })
  }
}
console.log(`\nListo: ${CASOS.length} acusados, ${total} denuncias publicadas.`)
