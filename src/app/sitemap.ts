import type { MetadataRoute } from 'next'
import { getAcusadosPublicados } from '@/lib/data'

const SITE_URL = 'https://www.enemigosdelpueblo.com'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const estaticas: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: 'hourly', priority: 1 },
    { url: `${SITE_URL}/denuncia`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/seguimiento`, changeFrequency: 'monthly', priority: 0.5 },
  ]

  let fichas: MetadataRoute.Sitemap = []
  try {
    const acusados = await getAcusadosPublicados()
    fichas = acusados.map((a) => ({
      url: `${SITE_URL}/acusado/${a.cedula}`,
      changeFrequency: 'daily',
      priority: 0.7,
    }))
  } catch {
    // sin datos: solo estáticas
  }

  return [...estaticas, ...fichas]
}
