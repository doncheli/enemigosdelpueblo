import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Protege /doncheli_admin: refresca la sesión y exige usuario autenticado.
 * La autorización fina (ser moderador) se valida además en el layout y en RLS.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isLogin = path === '/doncheli_admin/login'

  if (path.startsWith('/doncheli_admin') && !isLogin && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/doncheli_admin/login'
    url.searchParams.set('next', path)
    return NextResponse.redirect(url)
  }

  if (isLogin && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/doncheli_admin'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ['/doncheli_admin', '/doncheli_admin/:path*'],
}
