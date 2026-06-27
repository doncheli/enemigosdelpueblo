'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { createSupabaseBrowser } from '@/lib/supabase/browser'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createSupabaseBrowser()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Credenciales inválidas.')
      setLoading(false)
      return
    }
    router.replace(params.get('next') || '/doncheli_admin')
    router.refresh()
  }

  const inputClass =
    'w-full bg-elevated border border-borderSubtle text-textPrimary px-4 py-3 rounded focus:ring-1 focus:ring-primary focus:outline-none transition-all'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <Image
        src="/logo.png"
        alt="Enemigos del Pueblo"
        width={220}
        height={56}
        priority
        className="h-12 w-auto mb-8"
      />
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-surface border border-borderDefault p-8 space-y-5"
      >
        <div>
          <h1 className="text-lg font-bold text-textPrimary">Panel de moderación</h1>
          <p className="text-textSecondary text-sm mt-1">Acceso restringido a moderadores.</p>
        </div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Correo"
          autoComplete="email"
          required
          className={inputClass}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          autoComplete="current-password"
          required
          className={inputClass}
        />
        {error && <p className="text-primary text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white font-bold py-3 uppercase tracking-widest text-sm hover:bg-red-700 transition-all disabled:opacity-50"
        >
          {loading ? 'Entrando…' : 'Iniciar sesión'}
        </button>
      </form>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
