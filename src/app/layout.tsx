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

const SITE_URL = 'https://www.enemigosdelpueblo.com'
const SITE_NAME = 'Enemigos del Pueblo'
const SITE_DESC =
  'Plataforma venezolana de denuncia ciudadana contra la corrupción, el matraqueo, la extorsión y el abuso de autoridad. Denuncia de forma 100% anónima.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Enemigos del Pueblo — Denuncia Ciudadana Venezolana',
    template: '%s · Enemigos del Pueblo',
  },
  description: SITE_DESC,
  applicationName: SITE_NAME,
  keywords: [
    'denuncia ciudadana',
    'Venezuela',
    'corrupción',
    'matraqueo',
    'extorsión',
    'abuso de autoridad',
    'funcionarios corruptos',
    'denuncia anónima',
    'transparencia',
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: { canonical: '/' },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  openGraph: {
    type: 'website',
    locale: 'es_VE',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: 'Enemigos del Pueblo — Denuncia Ciudadana Venezolana',
    description: SITE_DESC,
    images: [{ url: '/logo.png', width: 760, height: 193, alt: SITE_NAME }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Enemigos del Pueblo — Denuncia Ciudadana Venezolana',
    description: SITE_DESC,
    images: ['/logo.png'],
  },
  icons: { icon: '/emblem.png', apple: '/emblem.png' },
  category: 'news',
}

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  alternateName: 'EnemigosDelPueblo.com',
  url: SITE_URL,
  description: SITE_DESC,
  inLanguage: 'es-VE',
  publisher: {
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
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
