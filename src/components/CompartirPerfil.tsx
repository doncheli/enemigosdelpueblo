'use client'

import { useState } from 'react'

interface Props {
  nombre: string
  cargo?: string
  delitos: string[]
  cedula: string
}

export default function CompartirPerfil({ nombre, cargo, delitos, cedula }: Props) {
  const [copiado, setCopiado] = useState(false)

  const url =
    typeof window !== 'undefined'
      ? window.location.href
      : `https://www.enemigosdelpueblo.com/acusado/${cedula}`

  const texto = `🚨 ${nombre}${cargo ? ` — ${cargo}` : ''}${
    delitos.length ? `. Señalado por ${delitos.join(', ')}.` : '.'
  } Mira la ficha en Enemigos del Pueblo:`

  const u = encodeURIComponent(url)
  const t = encodeURIComponent(texto)

  const redes: { nombre: string; icon: string; href: string; color: string }[] = [
    { nombre: 'WhatsApp', icon: 'chat', href: `https://wa.me/?text=${t}%20${u}`, color: '#25D366' },
    { nombre: 'X', icon: 'close', href: `https://twitter.com/intent/tweet?text=${t}&url=${u}`, color: '#FFFFFF' },
    { nombre: 'Facebook', icon: 'thumb_up', href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, color: '#1877F2' },
    { nombre: 'Telegram', icon: 'send', href: `https://t.me/share/url?url=${u}&text=${t}`, color: '#229ED9' },
  ]

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      /* noop */
    }
  }

  const compartirNativo = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: `${nombre} · Enemigos del Pueblo`, text: texto, url })
      } catch {
        /* cancelado */
      }
    } else {
      copiar()
    }
  }

  return (
    <div className="bg-surface border border-borderDefault p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-primary text-base">campaign</span>
        <h3 className="text-xs font-bold uppercase tracking-widest text-textPrimary">
          Difundir este perfil
        </h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {redes.map((r) => (
          <a
            key={r.nombre}
            href={r.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 border border-borderSubtle px-4 py-2.5 text-xs font-bold text-textSecondary hover:text-textPrimary hover:border-primary transition-all"
          >
            <span className="material-symbols-outlined text-base" style={{ color: r.color }}>
              {r.icon}
            </span>
            {r.nombre}
          </a>
        ))}
        <button
          onClick={copiar}
          className="flex items-center gap-2 border border-borderSubtle px-4 py-2.5 text-xs font-bold text-textSecondary hover:text-textPrimary hover:border-primary transition-all"
        >
          <span className="material-symbols-outlined text-base">
            {copiado ? 'check' : 'link'}
          </span>
          {copiado ? 'Copiado' : 'Copiar enlace'}
        </button>
        <button
          onClick={compartirNativo}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-all sm:hidden"
        >
          <span className="material-symbols-outlined text-base">share</span>
          Compartir
        </button>
      </div>
    </div>
  )
}
