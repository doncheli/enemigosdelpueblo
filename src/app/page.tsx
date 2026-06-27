import Footer from '@/components/Footer'
import CatalogoClient from '@/components/CatalogoClient'
import { getAcusadosPublicados, getUbicacionesMapa } from '@/lib/data'

export const revalidate = 60

export default async function CatalogoPage() {
  const [acusados, puntos] = await Promise.all([
    getAcusadosPublicados(),
    getUbicacionesMapa(),
  ])

  return (
    <div className="flex flex-col min-h-screen">
      <CatalogoClient acusados={acusados} puntos={puntos} />
      <Footer />
    </div>
  )
}
