import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Crear denuncia anónima',
  description:
    'Denuncia de forma 100% anónima la corrupción, el matraqueo, la extorsión o el abuso de autoridad de funcionarios en Venezuela. No guardamos ningún dato del denunciante.',
  alternates: { canonical: '/denuncia' },
}

export default function DenunciaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
