import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-background w-full py-8 mt-auto border-t border-borderDefault">
      <div className="flex flex-col md:flex-row justify-between items-center px-4 md:px-8 max-w-[1280px] mx-auto gap-4">
        <Link href="/" className="flex items-center" aria-label="Enemigos del Pueblo - Inicio">
          <Image
            src="/emblem.png"
            alt="Enemigos del Pueblo"
            width={36}
            height={40}
            className="h-10 w-auto"
          />
        </Link>
        <div className="flex flex-wrap justify-center gap-6">
          <Link
            href="/privacidad"
            className="font-body text-xs text-textSecondary hover:text-primary transition-colors opacity-80 hover:opacity-100"
          >
            Privacidad
          </Link>
          <Link
            href="/terminos"
            className="font-body text-xs text-textSecondary hover:text-primary transition-colors opacity-80 hover:opacity-100"
          >
            Términos
          </Link>
          <Link
            href="/metodologia"
            className="font-body text-xs text-textSecondary hover:text-primary transition-colors opacity-80 hover:opacity-100"
          >
            Metodología
          </Link>
          <Link
            href="/contacto"
            className="font-body text-xs text-textSecondary hover:text-primary transition-colors opacity-80 hover:opacity-100"
          >
            Contacto
          </Link>
        </div>
        <div className="font-body text-xs text-textSecondary">
          © {year} ENEMIGOS DEL PUEBLO. JUSTICIA CIUDADANA TRANSPARENTE.
        </div>
      </div>
    </footer>
  )
}
