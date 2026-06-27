// Crea un usuario moderador (Supabase Auth) y lo agrega a la allowlist `moderadores`.
// Requiere service_role (solo se ejecuta localmente, nunca se despliega).
//
// Uso:  MOD_EMAIL=... MOD_PASSWORD=... node --env-file=.env.local scripts/crear-moderador.mjs
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
const email = process.env.MOD_EMAIL
const password = process.env.MOD_PASSWORD
if (!url || !key || !email || !password) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, MOD_EMAIL o MOD_PASSWORD')
  process.exit(1)
}
const db = createClient(url, key, { auth: { persistSession: false } })

// 1) Crear o ubicar el usuario
let userId
const { data: created, error: cErr } = await db.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
})
if (cErr) {
  if (/already|registered|exists/i.test(cErr.message)) {
    const { data: list } = await db.auth.admin.listUsers()
    userId = list.users.find((u) => u.email === email)?.id
    if (userId) await db.auth.admin.updateUserById(userId, { password })
    console.log('Usuario ya existía; contraseña actualizada.')
  } else {
    console.error('Error creando usuario:', cErr.message)
    process.exit(1)
  }
} else {
  userId = created.user.id
  console.log('Usuario creado.')
}

// 2) Agregar a la allowlist de moderadores
const { error: mErr } = await db.from('moderadores').upsert({ user_id: userId, email })
if (mErr) {
  console.error('Error en allowlist:', mErr.message)
  process.exit(1)
}
console.log(`✓ Moderador autorizado: ${email}`)
