import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Seguimiento de denuncia',
  description:
    'Consulta el estado de tu denuncia con tu número de seguimiento en Enemigos del Pueblo.',
  alternates: { canonical: '/seguimiento' },
}

export default function SeguimientoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
