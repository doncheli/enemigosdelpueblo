import type { Metadata } from 'next'

// Panel privado: nunca debe indexarse en buscadores.
export const metadata: Metadata = {
  title: 'Panel',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
}

export default function DoncheliAdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
