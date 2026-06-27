'use client'

import Link from 'next/link'
import Image from 'next/image'

interface NavbarProps {
  activePage?: 'catalogo' | 'seguimiento'
  showSearch?: boolean
  /** Cuando se provee, la esquina izquierda muestra filtros de categoría en vez del logo. */
  categories?: string[]
  activeCategory?: string | null
  onCategoryChange?: (category: string | null) => void
}

export default function Navbar({
  activePage,
  showSearch,
  categories,
  activeCategory = null,
  onCategoryChange,
}: NavbarProps) {
  const showFilters = categories && categories.length > 0

  return (
    <header className="fixed top-0 w-full z-40 bg-background border-b border-borderDefault">
      <div className="flex justify-between items-center px-4 md:px-8 h-16 max-w-[1280px] mx-auto gap-4">
        <div className="flex items-center gap-6 min-w-0">
          {showFilters ? (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <button
                onClick={() => onCategoryChange?.(null)}
                className={`whitespace-nowrap px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider border transition-colors ${
                  activeCategory === null
                    ? 'bg-primary border-primary text-white'
                    : 'border-borderSubtle text-textSecondary hover:text-textPrimary hover:border-primary'
                }`}
              >
                Todos
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => onCategoryChange?.(cat)}
                  className={`whitespace-nowrap px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider border transition-colors ${
                    activeCategory === cat
                      ? 'bg-primary border-primary text-white'
                      : 'border-borderSubtle text-textSecondary hover:text-textPrimary hover:border-primary'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          ) : (
            <>
              <Link href="/" className="flex items-center" aria-label="Enemigos del Pueblo - Inicio">
                <Image
                  src="/logo.png"
                  alt="EnemigosDelPueblo.com - Denuncia Ciudadana Venezolana"
                  width={158}
                  height={40}
                  priority
                  className="h-9 w-auto md:h-10"
                />
              </Link>
              <nav className="hidden md:flex items-center gap-8 text-sm font-bold tracking-tight">
                <Link
                  href="/"
                  className={`pb-1 transition-colors duration-200 ${
                    activePage === 'catalogo'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-textSecondary hover:text-textPrimary'
                  }`}
                >
                  Catálogo
                </Link>
                <Link
                  href="/seguimiento"
                  className={`pb-1 transition-colors duration-200 ${
                    activePage === 'seguimiento'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-textSecondary hover:text-textPrimary'
                  }`}
                >
                  Seguimiento
                </Link>
              </nav>
            </>
          )}
        </div>
        <div className="flex items-center gap-4 shrink-0">
          {showSearch && (
            <div className="relative hidden sm:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary text-sm">
                search
              </span>
              <input
                type="text"
                placeholder="Buscar funcionario..."
                className="bg-surface border border-borderDefault text-textPrimary text-sm py-2 pl-10 pr-4 rounded focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
          )}
          <Link
            href="/denuncia"
            className="bg-primary text-white px-4 py-2 text-sm font-bold uppercase tracking-wider hover:bg-red-700 active:scale-95 transition-all whitespace-nowrap"
          >
            Nueva Denuncia
          </Link>
        </div>
      </div>
    </header>
  )
}
