import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { SUPABASE_CHAVE_PUBLICA, SUPABASE_URL } from '@/lib/config'

export async function supabaseServidor() {
  const loja = await cookies()
  return createServerClient(SUPABASE_URL, SUPABASE_CHAVE_PUBLICA, {
    cookies: {
      getAll: () => loja.getAll(),
      setAll: (lista) => {
        try {
          lista.forEach(({ name, value, options }) => loja.set(name, value, options))
        } catch {
          // Em componentes de servidor não dá para gravar cookies; o proxy renova a sessão.
        }
      },
    },
  })
}
