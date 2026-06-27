import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createSupabaseServer } from '@/lib/supabase/server'
import { cerrarSesion } from './actions'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // El login renderiza su propio árbol; si no hay user, el middleware ya redirige.
  if (!user) {
    return <>{children}</>
  }

  // Autorización fina: ¿es moderador? (consulta protegida por RLS / SECURITY DEFINER)
  const { data: esModerador } = await supabase.rpc('es_moderador')
  if (!esModerador) {
    await supabase.auth.signOut()
    redirect('/doncheli_admin/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-borderDefault">
        <div className="max-w-[1100px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link href="/doncheli_admin" className="flex items-center gap-3">
            <Image src="/logo.png" alt="Enemigos del Pueblo" width={150} height={38} className="h-8 w-auto" />
            <span className="text-textSecondary text-xs font-bold uppercase tracking-widest hidden sm:inline">
              Moderación
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-textSecondary text-xs hidden sm:inline">{user.email}</span>
            <form action={cerrarSesion}>
              <button className="text-textSecondary hover:text-primary text-xs font-bold uppercase tracking-widest">
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="max-w-[1100px] mx-auto px-4 md:px-8 py-10">{children}</main>
    </div>
  )
}
