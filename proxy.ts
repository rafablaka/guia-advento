import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { SUPABASE_CHAVE_PUBLICA, SUPABASE_URL } from '@/lib/config'

// Páginas que abrem sem login
const PUBLICAS = ['/entrar', '/auth', '/convite', '/c', '/api/notificacoes', '/offline']

export async function proxy(request: NextRequest) {
  let resposta = NextResponse.next({ request })
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_CHAVE_PUBLICA, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (lista) => {
        lista.forEach(({ name, value }) => request.cookies.set(name, value))
        resposta = NextResponse.next({ request })
        lista.forEach(({ name, value, options }) => resposta.cookies.set(name, value, options))
      },
    },
  })
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const caminho = request.nextUrl.pathname
  if (!user && !PUBLICAS.some((p) => caminho === p || caminho.startsWith(p + '/'))) {
    const url = request.nextUrl.clone()
    url.pathname = '/entrar'
    url.search = caminho !== '/' ? `?depois=${encodeURIComponent(caminho + request.nextUrl.search)}` : ''
    return NextResponse.redirect(url)
  }
  return resposta
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|icones|manifest.webmanifest|sw.js|illustrations|audio|.*\\.(?:svg|png|jpg|jpeg|webp|wav|mp3|ttf)$).*)'],
}
