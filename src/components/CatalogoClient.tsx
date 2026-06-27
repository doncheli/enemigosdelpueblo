'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import CrimeBadge from '@/components/ui/CrimeBadge'
import { Acusado, TipoDelito } from '@/types'
import type { PuntoMapa } from '@/lib/data'

const CATEGORIAS: TipoDelito[] = ['CORRUPCIÓN', 'EXTORSIÓN', 'ABUSO DE AUTORIDAD']

// Leaflet necesita el DOM: carga solo en cliente.
const MapaMatraqueo = dynamic(() => import('@/components/MapaMatraqueo'), {
  ssr: false,
  loading: () => (
    <div className="h-[420px] w-full bg-surface border border-borderDefault animate-pulse" />
  ),
})

const LEYENDA: { tipo: TipoDelito; color: string }[] = [
  { tipo: 'EXTORSIÓN', color: '#FCA5A5' },
  { tipo: 'CORRUPCIÓN', color: '#FCD34D' },
  { tipo: 'ABUSO DE AUTORIDAD', color: '#93C5FD' },
]

function AcusadoCard({ acusado }: { acusado: Acusado }) {
  return (
    <Link
      href={`/acusado/${acusado.cedula}`}
      className="group block bg-surface border border-borderDefault hover:border-primary transition-all duration-200 hover:-translate-y-0.5"
    >
      <div className="aspect-[3/4] bg-black relative overflow-hidden">
        {acusado.fotoUrl ? (
          <Image
            src={acusado.fotoUrl}
            alt={`${acusado.nombres} ${acusado.apellidos}`}
            fill
            className="object-cover filter grayscale contrast-125 brightness-90"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-elevated">
            <span className="material-symbols-outlined text-6xl text-borderSubtle">person</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <span className="block bg-primary text-white text-[9px] font-bold py-0.5 px-2 tracking-widest text-center uppercase">
            {acusado.activo ? 'FICHA ACTIVA' : 'INACTIVO'}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-sm font-bold text-textPrimary leading-tight mb-1 group-hover:text-primary transition-colors">
          {acusado.nombres} {acusado.apellidos}
        </h3>
        <p className="font-mono text-[10px] text-textSecondary tracking-wider mb-1">
          {acusado.cedulaPrefix}-{acusado.cedula}
        </p>
        <p className="text-[11px] text-textSecondary mb-3">
          {acusado.cargo} — {acusado.estado}
        </p>
        <div className="flex flex-wrap gap-1 mb-3">
          {acusado.delitos.slice(0, 2).map((d) => (
            <CrimeBadge key={d} tipo={d} size="sm" />
          ))}
          {acusado.delitos.length > 2 && (
            <span className="text-[9px] text-textSecondary font-mono self-center">
              +{acusado.delitos.length - 2}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 pt-3 border-t border-borderDefault">
          <span className="text-lg font-bold text-primary">{acusado.denunciasCount}</span>
          <span className="text-[10px] font-bold text-textSecondary uppercase tracking-widest">
            denuncias
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function CatalogoClient({
  acusados: todos,
  puntos,
}: {
  acusados: Acusado[]
  puntos: PuntoMapa[]
}) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const acusados = activeCategory
    ? todos.filter((a) => a.delitos.includes(activeCategory as TipoDelito))
    : todos

  return (
    <>
      <Navbar
        showSearch
        categories={CATEGORIAS}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />
      <main className="mt-16 flex-grow">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-10">
          <div className="flex justify-center pt-2 pb-10">
            <Image
              src="/logo.png"
              alt="EnemigosDelPueblo.com - Denuncia Ciudadana Venezolana"
              width={520}
              height={132}
              priority
              className="h-20 w-auto md:h-28"
            />
          </div>

          {/* Mapa del Matraqueo y de la Extorsión */}
          <section className="mb-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-textPrimary tracking-tight">
                  Mapa del Matraqueo y de la Extorsión
                </h2>
                <p className="text-textSecondary text-sm mt-1">
                  Ubicaciones reportadas de los hechos · Gran Caracas y La Guaira
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {LEYENDA.map((l) => (
                  <span key={l.tipo} className="flex items-center gap-1.5">
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: l.color }}
                    />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-textSecondary">
                      {l.tipo}
                    </span>
                  </span>
                ))}
              </div>
            </div>
            <div className="border border-borderDefault overflow-hidden">
              <MapaMatraqueo puntos={puntos} />
            </div>
          </section>

          <div className="flex items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-textPrimary tracking-tight">
                Catálogo de Acusados
              </h1>
              <p className="text-textSecondary text-sm mt-1">
                {acusados.length}
                {activeCategory
                  ? ` · ${activeCategory}`
                  : ' funcionarios documentados · Base de datos ciudadana'}
              </p>
            </div>
            <div className="hidden md:block h-[1px] flex-grow bg-borderDefault" />
          </div>

          {acusados.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {acusados.map((acusado) => (
                <AcusadoCard key={acusado.cedula} acusado={acusado} />
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-borderSubtle py-20 px-6 flex flex-col items-center text-center">
              <span className="material-symbols-outlined text-5xl text-borderSubtle mb-4">
                folder_off
              </span>
              <p className="text-textPrimary font-bold tracking-tight">
                {activeCategory
                  ? `Sin registros en la categoría ${activeCategory}`
                  : 'Aún no hay acusados registrados'}
              </p>
              <p className="text-textSecondary text-sm mt-2 max-w-md">
                Las fichas aparecerán aquí una vez que las denuncias ciudadanas sean verificadas y
                publicadas.
              </p>
              <Link
                href="/denuncia"
                className="mt-6 bg-primary text-white px-6 py-3 text-[11px] font-bold uppercase tracking-widest hover:bg-red-700 active:scale-95 transition-all"
              >
                Crear una denuncia
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
