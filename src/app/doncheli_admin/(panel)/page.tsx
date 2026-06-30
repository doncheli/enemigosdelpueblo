import Link from 'next/link'
import CrimeBadge from '@/components/ui/CrimeBadge'
import { createSupabaseServer } from '@/lib/supabase/server'
import { rechazarDenuncia, aprobarReplica, rechazarReplica } from '../actions'

export const dynamic = 'force-dynamic'

const fecha = (iso: string) =>
  new Date(iso).toLocaleString('es-VE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

export default async function AdminDashboard() {
  const supabase = await createSupabaseServer()

  const { data: denuncias } = await supabase
    .from('denuncias')
    .select(
      'id, codigo, tipo, descripcion, origen, created_at, acusado_id, acusados(nombres, apellidos, cedula, cargo, estado, estado_revision)',
    )
    .eq('estado', 'PUBLICADA')
    .order('created_at', { ascending: false })
    .limit(50)

  const { data: replicas } = await supabase
    .from('replicas')
    .select('id, contenido, autor, created_at, acusados(nombres, apellidos, cedula)')
    .eq('estado', 'PENDIENTE')
    .order('created_at', { ascending: true })

  const pendDen = denuncias ?? []
  const pendRep = replicas ?? []

  return (
    <div className="space-y-12">
      <div className="flex flex-wrap gap-4">
        <Stat label="Denuncias publicadas" value={pendDen.length} />
        <Stat label="Réplicas pendientes" value={pendRep.length} />
      </div>

      {/* Denuncias publicadas — moderación reactiva */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-widest text-textPrimary mb-1">
          Denuncias publicadas
        </h2>
        <p className="text-textSecondary text-xs mb-4">
          Se publican al instante. Usa <strong>Quitar</strong> para bajar contenido indebido.
        </p>
        {pendDen.length === 0 ? (
          <Empty>No hay denuncias publicadas.</Empty>
        ) : (
          <div className="space-y-4">
            {pendDen.map((d) => {
              const a = Array.isArray(d.acusados) ? d.acusados[0] : d.acusados
              return (
                <article key={d.id} className="bg-surface border border-borderDefault p-5">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <CrimeBadge tipo={d.tipo} size="sm" />
                    <span className="font-mono text-xs text-primary font-bold">{d.codigo}</span>
                    <span className="text-[10px] uppercase tracking-widest text-textSecondary">
                      {d.origen}
                    </span>
                    <span className="text-[10px] text-textSecondary ml-auto">
                      {fecha(d.created_at)}
                    </span>
                  </div>
                  <p className="text-textPrimary text-sm mb-1">
                    <strong>
                      {a?.nombres} {a?.apellidos}
                    </strong>{' '}
                    {a?.cedula && <span className="font-mono text-textSecondary">· {a.cedula}</span>}
                  </p>
                  <p className="text-textSecondary text-xs mb-4">
                    {a?.cargo} {a?.estado ? `— ${a.estado}` : ''}
                  </p>
                  <p className="text-textPrimary text-sm leading-relaxed mb-5 bg-background border border-borderDefault p-4">
                    {d.descripcion}
                  </p>
                  <div className="flex gap-3">
                    <Link
                      href={`/doncheli_admin/editar/${d.id}`}
                      className="px-5 py-2 text-[11px] font-bold uppercase tracking-widest text-textPrimary border border-borderSubtle hover:border-primary transition-all"
                    >
                      Editar
                    </Link>
                    <form action={rechazarDenuncia.bind(null, d.id, d.acusado_id)}>
                      <button className="bg-[#1C0A0A] text-[#FCA5A5] border border-[#7F1D1D] px-5 py-2 text-[11px] font-bold uppercase tracking-widest hover:bg-[#2a0f0f] transition-all">
                        Quitar
                      </button>
                    </form>
                    <a
                      href={a?.cedula ? `/acusado/${a.cedula}` : `/acusado/${d.acusado_id}`}
                      target="_blank"
                      className="px-5 py-2 text-[11px] font-bold uppercase tracking-widest text-textSecondary hover:text-textPrimary border border-borderSubtle transition-all"
                    >
                      Ver ficha
                    </a>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      {/* Réplicas */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-widest text-textPrimary mb-4">
          Réplicas por revisar
        </h2>
        {pendRep.length === 0 ? (
          <Empty>No hay réplicas pendientes.</Empty>
        ) : (
          <div className="space-y-4">
            {pendRep.map((r) => {
              const a = Array.isArray(r.acusados) ? r.acusados[0] : r.acusados
              return (
                <article key={r.id} className="bg-surface border border-borderDefault p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="material-symbols-outlined text-textSecondary text-base">
                      balance
                    </span>
                    <span className="text-textPrimary text-sm font-bold">
                      {a?.nombres} {a?.apellidos}
                    </span>
                    <span className="text-[10px] text-textSecondary ml-auto">
                      {fecha(r.created_at)}
                    </span>
                  </div>
                  <blockquote className="border-l-2 border-borderSubtle pl-4 text-textPrimary text-sm mb-2">
                    {r.contenido}
                  </blockquote>
                  {r.autor && (
                    <p className="text-[10px] uppercase tracking-widest text-textSecondary mb-4">
                      {r.autor}
                    </p>
                  )}
                  <div className="flex gap-3">
                    <form action={aprobarReplica.bind(null, r.id)}>
                      <button className="bg-[#052E16] text-[#4ADE80] border border-[#4ADE80]/40 px-5 py-2 text-[11px] font-bold uppercase tracking-widest hover:bg-[#063d1d] transition-all">
                        Publicar réplica
                      </button>
                    </form>
                    <form action={rechazarReplica.bind(null, r.id)}>
                      <button className="bg-[#1C0A0A] text-[#FCA5A5] border border-[#7F1D1D] px-5 py-2 text-[11px] font-bold uppercase tracking-widest hover:bg-[#2a0f0f] transition-all">
                        Rechazar
                      </button>
                    </form>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-surface border border-borderDefault px-6 py-4">
      <div className="text-3xl font-bold text-primary leading-none">{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-textSecondary mt-1">{label}</div>
    </div>
  )
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-dashed border-borderSubtle py-12 text-center text-textSecondary text-sm">
      {children}
    </div>
  )
}
