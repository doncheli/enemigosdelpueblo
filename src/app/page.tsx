import Footer from '@/components/Footer'
import CatalogoClient from '@/components/CatalogoClient'
import { getAcusadosPublicados } from '@/lib/data'

export const revalidate = 60

export default async function CatalogoPage() {
  const acusados = await getAcusadosPublicados()

  return (
    <div className="flex flex-col min-h-screen">
      <CatalogoClient acusados={acusados} />
      <Footer />
    </div>
  )
}
