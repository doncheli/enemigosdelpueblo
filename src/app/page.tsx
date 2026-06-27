'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CrimeBadge from '@/components/ui/CrimeBadge'
import { Acusado, TipoDelito } from '@/types'

const CATEGORIAS: TipoDelito[] = ['CORRUPCIÓN', 'EXTORSIÓN', 'ABUSO DE AUTORIDAD']

const MOCK_ACUSADOS: Acusado[] = [
  {
    cedula: '14523891',
    cedulaPrefix: 'V',
    nombres: 'Carlos Eduardo',
    apellidos: 'Martínez Pérez',
    cargo: 'Comisario de Policía',
    institucion: 'CPBEZ',
    estado: 'Zulia',
    municipio: 'Maracaibo',
    fotoUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC7cSOtQtO_Av_bXFZzqRCwZV-Qfn94jIjrtZj_MnTtn2Qzvg-DpDX-U_yI6axb1gh9vsL2ZRhO-XZ81BY8s21ELgtgousYTvnwUGqVPTJxGPYsUvmSdbTHv0_RvRZnFEpBHuxQfGj8FTRAoGfVSdNdQohxF3HK9BrHPaH8LaH86pvT09VrwbpdJZfsdl90L6ZaV7cszv20K7sx2jXIRPFAKqmO-gdjWZhwDx7PtQzub3XmUzt-hkqCxEfVYMbVYr8faE3R8YGSpXW_',
    delitos: ['CORRUPCIÓN', 'EXTORSIÓN', 'ABUSO DE AUTORIDAD'],
    denunciasCount: 14,
    activo: true,
  },
  {
    cedula: '9876543',
    cedulaPrefix: 'V',
    nombres: 'José Antonio',
    apellidos: 'Rodríguez Blanco',
    cargo: 'Inspector General',
    institucion: 'SENIAT',
    estado: 'Distrito Capital',
    municipio: 'Caracas',
    delitos: ['CORRUPCIÓN', 'EXTORSIÓN'],
    denunciasCount: 7,
    activo: true,
  },
  {
    cedula: '11234567',
    cedulaPrefix: 'V',
    nombres: 'Rafael Ignacio',
    apellidos: 'Fuentes Montoya',
    cargo: 'Director de Hacienda',
    institucion: 'Alcaldía de Valencia',
    estado: 'Carabobo',
    municipio: 'Valencia',
    delitos: ['CORRUPCIÓN'],
    denunciasCount: 3,
    activo: true,
  },
  {
    cedula: '8901234',
    cedulaPrefix: 'V',
    nombres: 'María Luisa',
    apellidos: 'Contreras Díaz',
    cargo: 'Fiscal Superior',
    institucion: 'Ministerio Público',
    estado: 'Miranda',
    municipio: 'Los Teques',
    delitos: ['ABUSO DE AUTORIDAD', 'CORRUPCIÓN'],
    denunciasCount: 5,
    activo: true,
  },
  {
    cedula: '12456789',
    cedulaPrefix: 'V',
    nombres: 'Pedro Luis',
    apellidos: 'Hernández Vargas',
    cargo: 'Comandante',
    institucion: 'GNB — Guardia Nacional',
    estado: 'Aragua',
    municipio: 'Maracay',
    delitos: ['EXTORSIÓN', 'ABUSO DE AUTORIDAD'],
    denunciasCount: 9,
    activo: true,
  },
  {
    cedula: '7654321',
    cedulaPrefix: 'V',
    nombres: 'Luis Alberto',
    apellidos: 'Castillo Ramos',
    cargo: 'Juez de Primera Instancia',
    institucion: 'Tribunal Supremo de Justicia',
    estado: 'Bolívar',
    municipio: 'Puerto Ordaz',
    delitos: ['CORRUPCIÓN'],
    denunciasCount: 2,
    activo: false,
  },
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

export default function CatalogoPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const acusados = activeCategory
    ? MOCK_ACUSADOS.filter((a) => a.delitos.includes(activeCategory as TipoDelito))
    : MOCK_ACUSADOS

  return (
    <div className="flex flex-col min-h-screen">
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

          <div className="flex items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-textPrimary tracking-tight">
                Catálogo de Acusados
              </h1>
              <p className="text-textSecondary text-sm mt-1">
                {acusados.length}
                {activeCategory ? ` · ${activeCategory}` : ' funcionarios documentados · Base de datos ciudadana'}
              </p>
            </div>
            <div className="hidden md:block h-[1px] flex-grow bg-borderDefault" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {acusados.map((acusado) => (
              <AcusadoCard key={acusado.cedula} acusado={acusado} />
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <button className="border border-borderSubtle text-textSecondary hover:text-textPrimary hover:border-primary px-8 py-3 text-[10px] font-bold uppercase tracking-widest transition-all">
              Cargar más registros
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
