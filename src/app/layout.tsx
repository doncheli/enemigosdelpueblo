import type { Metadata } from 'next'
import { Inter, Space_Mono, Public_Sans } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
  display: 'swap',
})

const publicSans = Public_Sans({
  subsets: ['latin'],
  variable: '--font-public-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ENEMIGOS DEL PUEBLO',
  description: 'Plataforma venezolana de denuncia ciudadana contra funcionarios corruptos.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body
        className={`${inter.variable} ${spaceMono.variable} ${publicSans.variable} bg-background text-textPrimary font-body min-h-screen flex flex-col`}
      >
        <div className="fixed inset-0 grain-overlay z-50" />
        {children}
      </body>
    </html>
  )
}
