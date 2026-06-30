import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CrimeBadge from '@/components/ui/CrimeBadge'
import AiConfidenceBar from '@/components/ui/AiConfidenceBar'
import ReplicaForm from '@/components/ReplicaForm'
import CompartirPerfil from '@/components/CompartirPerfil'
import { getAcusadoPorCedula } from '@/lib/data'

export const revalidate = 60

export async function generateMetadata({
  params,
}: {
  params: Promise<{ cedula: string }>
}): Promise<Metadata> {
  const { cedula } = await params
  const data = await getAcusadoPorCedula(cedula)
  if (!data) return { title: 'Acusado no encontrado' }

  const nombre = `${data.nombres} ${data.apellidos}`
  const delitos = data.delitos.join(', ')
  const titulo = `${nombre} — ${data.cargo || 'Funcionario'}`
  const desc = `${nombre}${data.cargo ? `, ${data.cargo}` : ''}${
    data.estado ? ` (${data.estado})` : ''
  }. Señalado por ${delitos || 'denuncias ciudadanas'}. ${data.denunciasCount} denuncia(s) documentada(s).`
  const url = `/acusado/${cedula}`

  return {
    title: titulo,
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      type: 'profile',
      url,
      title: `${titulo} · Enemigos del Pueblo`,
      description: desc,
      images: data.fotoUrl ? [{ url: data.fotoUrl, alt: nombre }] : ['/logo.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${titulo} · Enemigos del Pueblo`,
      description: desc,
      images: data.fotoUrl ? [data.fotoUrl] : ['/logo.png'],
    },
  }
}

const EVIDENCE_ICON: Record<string, string> = {
  VIDEO: 'video_library',
  AUDIO: 'audio_file',
  DOCUMENTO: 'description',
  IMAGEN: 'image',
  ENLACE: 'public',
}

export default async function PerfilAcusado({
  params,
}: {
  params: Promise<{ cedula: string }>
}) {
  const { cedula } = await params
  const data = await getAcusadoPorCedula(cedula)

  if (!data) notFound()

  const acusadoId = (data as typeof data & { id: string }).id
  const { denuncias, replicas, ...acusado } = data

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar activePage="catalogo" />
      <main className="mt-16 flex-grow">
        {/* Breadcrumb */}
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-4">
          <nav className="flex items-center gap-2 text-textSecondary text-[10px] tracking-[0.2em] font-bold uppercase">
            <Link href="/" className="hover:text-textPrimary transition-colors">
              CATÁLOGO
            </Link>
            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
            <span className="text-textPrimary">
              {acusado.nombres.toUpperCase()} {acusado.apellidos.toUpperCase()}
            </span>
          </nav>
        </div>

        {/* Profile Header */}
        <section className="w-full bg-elevated border-y border-borderSubtle mb-8">
          <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-10 flex flex-col md:flex-row gap-8 md:gap-12">
            {/* Mugshot */}
            <div className="w-full md:w-[280px] flex-shrink-0">
              <div className="aspect-[3/4] bg-black border-2 border-borderSubtle relative overflow-hidden">
                {acusado.fotoUrl ? (
                  <Image
                    src={acusado.fotoUrl}
                    alt={`${acusado.nombres} ${acusado.apellidos}`}
                    fill
                    className="object-cover filter grayscale contrast-125 brightness-90"
                    sizes="280px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-surface">
                    <span className="material-symbols-outlined text-8xl text-borderSubtle">
                      person
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="block bg-primary text-white text-[10px] font-bold py-1 px-2 tracking-widest text-center uppercase">
                    FICHA POLICIAL ACTIVA
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-primary font-bold text-sm tracking-widest uppercase">
                  {acusado.cargo}
                </p>
                <p className="text-textSecondary text-xs mt-1">Rango Superior — Activo</p>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <h1 className="text-3xl md:text-5xl font-bold text-textPrimary tracking-tight leading-none mb-2">
                      {acusado.nombres} {acusado.apellidos}
                    </h1>
                    <p className="font-mono text-xl text-textSecondary tracking-wider mb-6">
                      {acusado.cedulaPrefix}-{acusado.cedula}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-8">
                      {acusado.delitos.map((d) => (
                        <CrimeBadge key={d} tipo={d} />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-background border border-borderSubtle p-4 self-start flex-shrink-0">
                    <span className="text-4xl font-bold text-primary leading-none">
                      {acusado.denunciasCount}
                    </span>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-textSecondary leading-tight">
                      denuncias
                      <br />
                      publicadas
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-y border-borderSubtle/50">
                  <div>
                    <span className="block text-[10px] font-bold text-textSecondary uppercase tracking-widest mb-1">
                      Institución
                    </span>
                    <p className="text-sm font-semibold text-textPrimary">{acusado.institucion}</p>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-textSecondary uppercase tracking-widest mb-1">
                      Estado
                    </span>
                    <p className="text-sm font-semibold text-textPrimary">{acusado.estado}</p>
                  </div>
                  {acusado.municipio && (
                    <div>
                      <span className="block text-[10px] font-bold text-textSecondary uppercase tracking-widest mb-1">
                        Municipio
                      </span>
                      <p className="text-sm font-semibold text-textPrimary">
                        {acusado.municipio}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8">
                <Link
                  href="/denuncia"
                  className="inline-flex bg-primary hover:bg-red-700 text-white font-bold py-4 px-8 tracking-widest uppercase text-sm active:scale-95 transition-all items-center justify-center gap-3"
                >
                  <span className="material-symbols-outlined">add_alert</span>
                  Agregar denuncia contra este acusado
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Compartir */}
        <section className="max-w-[1280px] mx-auto px-4 md:px-8 mb-8">
          <CompartirPerfil
            nombre={`${acusado.nombres} ${acusado.apellidos}`}
            cargo={acusado.cargo}
            delitos={acusado.delitos}
            cedula={acusado.cedula}
          />
        </section>

        {/* Denuncias Timeline */}
        <section className="max-w-[1280px] mx-auto px-4 md:px-8 pb-20">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-xl font-bold tracking-[0.2em] uppercase text-textPrimary">
              Historial de Denuncias
            </h2>
            <div className="h-[1px] flex-grow bg-borderDefault" />
          </div>

          <div className="space-y-6">
            {denuncias.map((denuncia) => (
              <article
                key={denuncia.id}
                className="bg-surface border border-borderDefault p-6 relative overflow-hidden hover:border-primary hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-48 flex-shrink-0">
                    <div className="text-[10px] font-bold text-textSecondary tracking-widest uppercase mb-1">
                      {denuncia.fecha}
                    </div>
                    <CrimeBadge tipo={denuncia.tipo} size="sm" />
                    <div className="mt-4 font-mono text-xs text-primary font-bold">
                      ID: {denuncia.id}
                    </div>
                  </div>
                  <div className="flex-grow">
                    <p className="text-textPrimary text-sm leading-relaxed mb-6">
                      {denuncia.descripcion}
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6">
                      {denuncia.evidencias.map((ev, i) => {
                        const base =
                          'aspect-square bg-background border border-borderSubtle overflow-hidden hover:border-primary transition-colors flex items-center justify-center'
                        if (ev.thumbnailUrl) {
                          return (
                            <a
                              key={i}
                              href={ev.thumbnailUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`${base} cursor-pointer`}
                            >
                              <Image
                                src={ev.thumbnailUrl}
                                alt="Evidencia"
                                width={80}
                                height={80}
                                className="w-full h-full object-cover"
                              />
                            </a>
                          )
                        }
                        // Enlace de redes u otro archivo: tile clicable
                        if (ev.url) {
                          return (
                            <a
                              key={i}
                              href={ev.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={ev.tipo === 'ENLACE' ? ev.url : undefined}
                              className={`${base} cursor-pointer flex-col gap-1`}
                            >
                              <span className="material-symbols-outlined text-primary text-3xl">
                                {EVIDENCE_ICON[ev.tipo] ?? 'attachment'}
                              </span>
                              {ev.tipo === 'ENLACE' && (
                                <span className="text-[8px] font-bold uppercase tracking-wider text-textSecondary px-1 truncate max-w-full">
                                  {ev.nombre ?? 'enlace'}
                                </span>
                              )}
                            </a>
                          )
                        }
                        return (
                          <div key={i} className={base}>
                            <span className="material-symbols-outlined text-borderSubtle text-4xl">
                              {EVIDENCE_ICON[ev.tipo] ?? 'attachment'}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                    <AiConfidenceBar score={denuncia.aiScore} />
                  </div>
                </div>
              </article>
            ))}
          </div>

        </section>

        {/* Derecho de réplica */}
        <section className="max-w-[1280px] mx-auto px-4 md:px-8 pb-20">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-xl font-bold tracking-[0.2em] uppercase text-textPrimary">
              Derecho de Réplica
            </h2>
            <div className="h-[1px] flex-grow bg-borderDefault" />
          </div>

          {replicas.length > 0 && (
            <div className="space-y-4 mb-8">
              {replicas.map((r) => (
                <blockquote
                  key={r.id}
                  className="bg-elevated border-l-2 border-[#4ADE80] p-6"
                >
                  <p className="text-textPrimary text-sm leading-relaxed">{r.contenido}</p>
                  <footer className="mt-3 text-[10px] font-bold uppercase tracking-widest text-textSecondary">
                    {r.autor ?? 'Respuesta del señalado'} · {r.fecha}
                  </footer>
                </blockquote>
              ))}
            </div>
          )}

          <ReplicaForm acusadoId={acusadoId} />
        </section>
      </main>
      <Footer />
    </div>
  )
}
