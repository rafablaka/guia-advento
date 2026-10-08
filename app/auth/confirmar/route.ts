import { NextResponse, type NextRequest } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import { supabaseServidor } from '@/lib/supabase/servidor'

// Destino do link mágico. Aceita os dois formatos do Supabase: ?code= (padrão) e ?token_hash= (modelo de e-mail próprio).
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const depoisBruto = url.searchParams.get('depois') || '/'
  const depois = depoisBruto.startsWith('/') && !depoisBruto.startsWith('//') ? depoisBruto : '/'
  const code = url.searchParams.get('code')
  const tokenHash = url.searchParams.get('token_hash')
  const tipo = (url.searchParams.get('type') || 'email') as EmailOtpType
  const supabase = await supabaseServidor()

  let erro = true
  if (code) erro = !!(await supabase.auth.exchangeCodeForSession(code)).error
  else if (tokenHash) erro = !!(await supabase.auth.verifyOtp({ token_hash: tokenHash, type: tipo })).error

  return NextResponse.redirect(new URL(erro ? '/entrar?erro=link' : depois, url.origin))
}
