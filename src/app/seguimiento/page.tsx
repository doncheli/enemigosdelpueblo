'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CrimeBadge from '@/components/ui/CrimeBadge'
import { TrackingResult, TrackingStepStatus } from '@/types'

const MOCK_RESULTS: Record<string, TrackingResult> = {
  'ENP-2024-A7F3': {
    id: 'ENP-2024-A7F3',
    acusado: {
      nombres: 'Carlos Eduardo',
      apellidos: 'Martínez Pérez',
      cargo: 'Comisario',
      institucion: 'CPBEZ',
      estado: 'Zulia',
      fotoUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBaDkSe3mcJhM1F6M1swoLj7-6rsRAQTN0NCxU001sOnRhODkqI7ol_POVk_qezKfsAi6KudpWFN0iySVFDF9PexMDYDg6BKSyutbLr7LrSIOtmbTnzU7a6CLr_-sRGHVNPxTAYDJcWjiY4w_wmRDaDVlPQefIV54J3Ht19PSX0oCgAx1mVFvw1JvG2H9rXiDunTD6Qbuuls9utRqiLHJRpI3nfnkj2jhXw8juEIbRQK95rBtOunnXE9twFtQ7hW_6lbyA0RiVu28GP',
    },
    tipo: 'CORRUPCIÓN',
    estado: 'EN_REVISION',
    aiScore: 0.61,
    timeline: [
      {
        status: 'COMPLETADO',
        titulo: 'Denuncia recibida',
        descripcion: 'Tu denuncia fue registrada correctamente en el sistema.',
        fecha: '15 mar 2024',
        hora: '14:32',
      },
      {
        status: 'COMPLETADO',
        titulo: 'Validación IA en progreso',
        descripcion: 'Gemini analizó la descripción y evidencias.',
        fecha: '15 mar 2024',
        hora: '14:35',
      },
      {
        status: 'EN_PROGRESO',
        titulo: 'En revisión editorial',
        descripcion: 'Score intermedio (0.61). Un moderador revisará manualmente para asegurar veracidad.',
        fecha: '15 mar 2024',
        hora: '15:10',
      },
      {
        status: 'PENDIENTE',
        titulo: 'Decisión final',
        descripcion: 'La denuncia será publicada o rechazada tras la validación humana.',
      },
    ],
  },
}

const STATUS_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  PENDIENTE: { label: 'PENDIENTE', bg: 'bg-elevated', text: 'text-textSecondary' },
  EN_REVISION: { label: 'EN REVISIÓN', bg: 'bg-[#2D1B00]', text: 'text-[#FCD34D]' },
  PUBLICADA: { label: 'PUBLICADA', bg: 'bg-[#052E16]', text: 'text-[#4ADE80]' },
  RECHAZADA: { label: 'RECHAZADA', bg: 'bg-[#1C0A0A]', text: 'text-[#FCA5A5]' },
}

function StepIcon({ status }: { status: TrackingStepStatus }) {
  if (status === 'COMPLETADO') {
    return (
      <div className="z-10 bg-[#052E16] text-[#4ADE80] rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-1">
        <span className="material-symbols-outlined text-[16px]">check</span>
      </div>
    )
  }
  if (status === 'EN_PROGRESO') {
    return (
      <div className="z-10 bg-[#2D1B00] text-[#FCD34D] rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-1 border border-[#FCD34D]/30">
        <span className="material-symbols-outlined text-[18px] loading-spinner">autorenew</span>
      </div>
    )
  }
  return (
    <div className="z-10 bg-surface text-borderSubtle rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-1 border border-borderSubtle">
      <span className="material-symbols-outlined text-[16px]">circle</span>
    </div>
  )
}

function TrackingContent() {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('id') ?? '')
  const [result, setResult] = useState<TrackingResult | null>(null)
  const [searched, setSearched] = useState(false)
  const [notFound, setNotFound] = useState(false)

  const handleSearch = () => {
    const found = MOCK_RESULTS[query.trim().toUpperCase()]
    setSearched(true)
    if (found) {
      setResult(found)
      setNotFound(false)
    } else {
      setResult(null)
      setNotFound(true)
    }
  }

  useEffect(() => {
    if (searchParams.get('id')) {
      handleSearch()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const statusInfo = result ? STATUS_LABELS[result.estado] : null

  return (
    <div className="max-w-[680px] mx-auto">
      {/* Search */}
      <section className="mb-12">
        <h1 className="text-[32px] font-headline font-bold text-textPrimary leading-tight mb-2">
          Seguimiento de Denuncia
        </h1>
        <p className="text-textSecondary text-base mb-8">
          Ingresa tu número de seguimiento para consultar el estado de tu denuncia.
        </p>
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-grow">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="ENP-2024-A7F3"
              className="w-full bg-surface border border-borderSubtle rounded-lg py-4 px-6 font-mono text-xl text-textPrimary placeholder:text-borderSubtle focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
            />
          </div>
          <button
            onClick={handleSearch}
            className="bg-primary text-white px-8 py-4 font-bold rounded-lg hover:bg-red-700 active:scale-[0.98] transition-all"
          >
            Consultar
          </button>
        </div>
      </section>

      {/* Not found */}
      {searched && notFound && (
        <div className="bg-surface border border-borderDefault p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-borderSubtle mb-4 block">
            search_off
          </span>
          <p className="text-textSecondary">
            No se encontró ninguna denuncia con el número{' '}
            <span className="font-mono text-textPrimary">{query}</span>.
          </p>
          <p className="text-xs text-textSecondary/60 mt-2">
            Verifica el número e intenta de nuevo.
          </p>
        </div>
      )}

      {/* Result Card */}
      {result && statusInfo && (
        <section className="bg-elevated border border-borderSubtle rounded-xl overflow-hidden shadow-2xl">
          {/* Card Header */}
          <div className="p-6 md:p-8 border-b border-borderSubtle flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-xs font-bold text-textSecondary uppercase tracking-widest block mb-1">
                NÚMERO DE EXPEDIENTE
              </span>
              <h2 className="text-2xl font-mono font-bold text-primary">{result.id}</h2>
            </div>
            <div
              className={`${statusInfo.bg} ${statusInfo.text} px-3 py-1 rounded text-xs font-bold uppercase tracking-tighter flex items-center gap-2`}
            >
              <span className="material-symbols-outlined text-sm">visibility</span>
              {statusInfo.label}
            </div>
          </div>

          {/* Timeline */}
          <div className="p-6 md:p-8">
            <div className="space-y-10">
              {result.timeline.map((step, i) => (
                <div key={i} className="relative flex gap-6">
                  {i < result.timeline.length - 1 && (
                    <div
                      className={`absolute left-[11px] top-7 bottom-[-2.5rem] w-0.5 ${
                        step.status === 'COMPLETADO' ? 'bg-primary' : 'bg-borderDefault'
                      }`}
                    />
                  )}
                  <StepIcon status={step.status} />
                  <div>
                    <h3
                      className={`font-bold ${
                        step.status === 'EN_PROGRESO'
                          ? 'text-[#FCD34D]'
                          : step.status === 'PENDIENTE'
                          ? 'text-borderSubtle'
                          : 'text-textPrimary'
                      }`}
                    >
                      {step.titulo}
                    </h3>
                    {(step.fecha || step.hora) && (
                      <div
                        className={`text-xs font-mono mb-1 ${
                          step.status === 'EN_PROGRESO'
                            ? 'text-[#FCD34D]/70'
                            : 'text-textSecondary'
                        }`}
                      >
                        {step.fecha && step.hora
                          ? `${step.fecha}, ${step.hora}`
                          : step.fecha ?? step.hora ?? 'Pendiente'}
                      </div>
                    )}
                    {!step.fecha && !step.hora && (
                      <div className="text-xs font-mono text-borderSubtle mb-1">Pendiente</div>
                    )}
                    <p
                      className={`text-sm ${
                        step.status === 'PENDIENTE' ? 'text-borderSubtle' : 'text-textSecondary'
                      }`}
                    >
                      {step.descripcion}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Accused Preview */}
            <div className="mt-12 pt-8 border-t border-borderSubtle/50 flex flex-col sm:flex-row items-center gap-6">
              <div className="w-24 h-32 bg-surface rounded border border-borderSubtle shrink-0 overflow-hidden relative">
                {result.acusado.fotoUrl ? (
                  <Image
                    src={result.acusado.fotoUrl}
                    alt={`${result.acusado.nombres} ${result.acusado.apellidos}`}
                    fill
                    className="object-cover filter grayscale"
                    sizes="96px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl text-borderSubtle">
                      person
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-grow text-center sm:text-left">
                <div className="mb-3">
                  <CrimeBadge tipo={result.tipo} size="sm" />
                </div>
                <h4 className="text-lg font-bold text-textPrimary">
                  {result.acusado.nombres} {result.acusado.apellidos}
                </h4>
                <p className="text-textSecondary text-sm font-mono tracking-tight">
                  {result.acusado.cargo} | {result.acusado.institucion} — {result.acusado.estado}
                </p>
              </div>
            </div>
          </div>

          {/* Footer Warning */}
          <div className="bg-surface/50 p-4 border-t border-borderSubtle/30">
            <p className="text-[11px] text-textSecondary text-center leading-relaxed">
              <span className="material-symbols-outlined text-[12px] align-middle mr-1">info</span>
              Si tu denuncia fue publicada, aparecerá en el catálogo público. No compartas tu
              número de seguimiento con el denunciado.
            </p>
          </div>
        </section>
      )}

      {/* Hint */}
      {!searched && (
        <div className="text-center">
          <p className="text-textSecondary/60 text-xs">
            ¿No tienes tu número? Intenta con{' '}
            <button
              onClick={() => {
                setQuery('ENP-2024-A7F3')
              }}
              className="font-mono text-primary/70 hover:text-primary underline"
            >
              ENP-2024-A7F3
            </button>{' '}
            como ejemplo.
          </p>
        </div>
      )}
    </div>
  )
}

export default function SeguimientoPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar activePage="seguimiento" showSearch />
      <main className="pt-32 pb-24 px-4 md:px-0 flex-grow">
        <Suspense fallback={<div className="max-w-[680px] mx-auto text-textSecondary text-sm">Cargando...</div>}>
          <TrackingContent />
        </Suspense>
      </main>
      <footer className="bg-background border-t border-borderDefault mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center py-8 px-6 max-w-[1280px] mx-auto gap-4">
          <div className="text-lg font-headline font-bold text-primary uppercase">
            ENEMIGOS DEL PUEBLO
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <Link
              href="/terminos"
              className="font-body text-sm uppercase tracking-widest text-textSecondary hover:text-textPrimary transition-colors"
            >
              Términos de Justicia
            </Link>
            <Link
              href="/privacidad"
              className="font-body text-sm uppercase tracking-widest text-textSecondary hover:text-textPrimary transition-colors"
            >
              Política de Privacidad
            </Link>
            <Link
              href="/contacto"
              className="font-body text-sm uppercase tracking-widest text-textSecondary hover:text-textPrimary transition-colors"
            >
              Contacto Seguro
            </Link>
          </div>
          <div className="text-[10px] text-textSecondary uppercase tracking-tighter">
            © 2024 ENEMIGOS DEL PUEBLO — VIGILANCIA CIUDADANA
          </div>
        </div>
      </footer>
    </div>
  )
}
