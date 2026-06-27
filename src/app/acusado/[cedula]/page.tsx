import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CrimeBadge from '@/components/ui/CrimeBadge'
import AiConfidenceBar from '@/components/ui/AiConfidenceBar'
import { Acusado, DenunciaPublicada } from '@/types'

type AcusadoWithDenuncias = Acusado & { denuncias: DenunciaPublicada[] }

const ACUSADOS_DB: Record<string, AcusadoWithDenuncias> = {
  '14523891': {
    cedula: '14523891',
    cedulaPrefix: 'V',
    nombres: 'Carlos Eduardo',
    apellidos: 'Martínez Pérez',
    cargo: 'Comisario de Policía',
    institucion: 'CPBEZ — Cuerpo de Policía del Estado Zulia',
    estado: 'Zulia',
    municipio: 'Maracaibo',
    fotoUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC7cSOtQtO_Av_bXFZzqRCwZV-Qfn94jIjrtZj_MnTtn2Qzvg-DpDX-U_yI6axb1gh9vsL2ZRhO-XZ81BY8s21ELgtgousYTvnwUGqVPTJxGPYsUvmSdbTHv0_RvRZnFEpBHuxQfGj8FTRAoGfVSdNdQohxF3HK9BrHPaH8LaH86pvT09VrwbpdJZfsdl90L6ZaV7cszv20K7sx2jXIRPFAKqmO-gdjWZhwDx7PtQzub3XmUzt-hkqCxEfVYMbVYr8faE3R8YGSpXW_',
    delitos: ['CORRUPCIÓN', 'EXTORSIÓN', 'ABUSO DE AUTORIDAD'],
    denunciasCount: 14,
    activo: true,
    denuncias: [
      {
        id: 'ENP-2024-A7F3',
        fecha: '15 MAR 2024',
        tipo: 'CORRUPCIÓN',
        descripcion:
          'El comisario exigió una suma de Bs. 50.000 para liberar a detenidos sin cargos. Los testigos confirmaron el pago en efectivo en las afueras del comando.',
        evidencias: [
          {
            tipo: 'IMAGEN',
            thumbnailUrl:
              'https://lh3.googleusercontent.com/aida-public/AB6AXuCOE8yE8FVIiD2q-FOYn_hebRF3LK86d2NRcWSEb44lU5ndA9JXjl20UqHnMqSjhaFkgaLGzSK2TicAA_FmfbmNXtB_LDIOWWB2HYMraea6RYBgzUzqyOvliUp_UGG7_-DVFhimXlY8-nBH6mBKx_udVCEttof8x3yIalZ-9OWPix4WaQbq3AfM9MMyQYjGE3TEi0Qb47b-vqD-VTDaKPcB2e0IMw-LMCSLE0_p0jj5LLXIDVcTo5gfD9puPUxz0oC5a5TXsJTCO8k2',
          },
          {
            tipo: 'IMAGEN',
            thumbnailUrl:
              'https://lh3.googleusercontent.com/aida-public/AB6AXuBMPdgqh-XDDpDWsKmPnyHFgZClpzJXG-ffgcKZGEMMMz6lPkudrqomIDyhk7iaY6gwVyIGyKAWlMlDMX7EV8_eHan1MnFuM1D0SZY2rnNXSQEYrb4MRcqHzY2DsuJcJ1yTiARwXSjMjVhGFJ6hP-ZBY2T-45ZtYioA38nwM_46yvYP6OoGmO1X_04pIIN7jJprc2XLFDdRutgDQUKBQ_6IysXvVaIuIM6IWfM-dc_wKFhQnlt-IsjPXIUl2sl7AYgg560M3ImXhu1y',
          },
          { tipo: 'DOCUMENTO' },
        ],
        aiScore: 0.89,
        estado: 'PUBLICADA',
      },
      {
        id: 'ENP-2024-B2X9',
        fecha: '02 FEB 2024',
        tipo: 'ABUSO DE AUTORIDAD',
        descripcion:
          'Detención arbitraria de comerciantes locales durante operativo nocturno. Se reportó confiscación de mercancía sin acta policial ni orden judicial.',
        evidencias: [
          {
            tipo: 'IMAGEN',
            thumbnailUrl:
              'https://lh3.googleusercontent.com/aida-public/AB6AXuA2cvFHSyamgPqS2rCGDUEhspVh4TXvr8HW8OPqE5kgtn3Ajr2uXteqeW5yfov7x0knbsVXo5_G_MUp0XU7858qVI8l4Uctkcq2XJsiYL4z8NgukjpM5Uwb67z-iYHU7gr9rjJaWeGOK6Ni8VhnUBCyf3Mvu5DbqR3KTB5RrGNfCNrisSoAY4407janaZ9t5aKgoywFuGdtDpdc9WetWX6C1xchVB5jgP2q3jPlnnUmap87lGHMvdZI10ZA69kSUYls7zds1ayVB_j3',
          },
          {
            tipo: 'IMAGEN',
            thumbnailUrl:
              'https://lh3.googleusercontent.com/aida-public/AB6AXuB8_FvqdztQdQDMmy5crj2M2JtXWGhHOasQzk-yFArr-d4X_i5NYzeu_wRQsAPWfWuWb5DUrrcIX3BJFIEVCgVW4n8BC1IdCDEo7XGlXO2Xd-a_Pgg9WKmjv7wOHK1mk4EQc-kkdwZ8jjYtRJcqywAEH3uR_-n-CN7GWOeFxLfv750lSz-a29nV0rkTW6R5xmIraAxqG0f1a2N0X2twpD0ALEihm8j8muGF_u36X-rAUyq8bysXjh-4gq8hmgfoohK0D2Pa_uOJ',
          },
          { tipo: 'VIDEO' },
        ],
        aiScore: 0.94,
        estado: 'PUBLICADA',
      },
      {
        id: 'ENP-2024-C1M4',
        fecha: '12 JAN 2024',
        tipo: 'EXTORSIÓN',
        descripcion:
          'Solicitud de pagos mensuales a transportistas del sector Los Haticos para permitir la libre circulación y evitar multas inventadas por la patrulla.',
        evidencias: [
          { tipo: 'AUDIO' },
          { tipo: 'IMAGEN' },
          {
            tipo: 'IMAGEN',
            thumbnailUrl:
              'https://lh3.googleusercontent.com/aida-public/AB6AXuAouJMls9ncT-NMl-GaXOgj1ghv-J9m_H6D2cmghg2qySIs9MngR6TFeNpi6nWNpl4rRsAZ6p4CKJWb5-vt59xLiTtUpPvVnL8-KYalrSzqUPNmldAf39J1-SUAj57SOzPzA_AgLIN4qM31xfVCuyB-crHjZGtzPnANxRN_LS7Ecb2iKtzmzp5m1tG25SuhPqWUegfj60eWh-Pt6K8wiA7WANnQCS9udgKiCeNR45upI__8qYFkX7vlEfeYGMwoAfr60pwtShwHibuD',
          },
        ],
        aiScore: 0.82,
        estado: 'PUBLICADA',
      },
    ],
  },
}

const EVIDENCE_ICON: Record<string, string> = {
  VIDEO: 'video_library',
  AUDIO: 'audio_file',
  DOCUMENTO: 'description',
  IMAGEN: 'image',
}

export default async function PerfilAcusado({
  params,
}: {
  params: Promise<{ cedula: string }>
}) {
  const { cedula } = await params
  const data = ACUSADOS_DB[cedula]

  if (!data) notFound()

  const { denuncias, ...acusado } = data

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

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/denuncia"
                  className="bg-primary hover:bg-red-700 text-white font-bold py-4 px-8 tracking-widest uppercase text-sm active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  <span className="material-symbols-outlined">add_alert</span>
                  Agregar denuncia contra este acusado
                </Link>
                <button className="border border-borderSubtle text-textSecondary hover:text-textPrimary hover:border-textPrimary font-bold py-4 px-8 tracking-widest uppercase text-sm transition-all flex items-center justify-center gap-3">
                  <span className="material-symbols-outlined">share</span>
                  Difundir perfil
                </button>
              </div>
            </div>
          </div>
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
                      {denuncia.evidencias.map((ev, i) => (
                        <div
                          key={i}
                          className="aspect-square bg-background border border-borderSubtle overflow-hidden cursor-pointer hover:border-primary transition-colors flex items-center justify-center"
                        >
                          {ev.thumbnailUrl ? (
                            <Image
                              src={ev.thumbnailUrl}
                              alt="Evidencia"
                              width={80}
                              height={80}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="material-symbols-outlined text-borderSubtle text-4xl">
                              {EVIDENCE_ICON[ev.tipo] ?? 'attachment'}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                    <AiConfidenceBar score={denuncia.aiScore} />
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <button className="border border-borderSubtle text-textSecondary hover:text-textPrimary hover:border-primary px-8 py-3 text-[10px] font-bold uppercase tracking-widest transition-all">
              Cargar denuncias anteriores
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
