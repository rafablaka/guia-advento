'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabaseNavegador } from '@/lib/supabase/navegador'

function destinoSeguro(valor: string | null) {
  return valor && valor.startsWith('/') && !valor.startsWith('//') ? valor : '/'
}

export function FormEntrar() {
  const params = useSearchParams()
  const router = useRouter()
  const depois = destinoSeguro(params.get('depois'))
  const [email, setEmail] = useState('')
  const [codigo, setCodigo] = useState('')
  const [etapa, setEtapa] = useState<'email' | 'enviado'>('email')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState(params.get('erro') ? 'Esse link expirou ou já foi usado. Peça um novo.' : '')

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setCarregando(true)
    const supabase = supabaseNavegador()
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: `${window.location.origin}/auth/confirmar?depois=${encodeURIComponent(depois)}` },
    })
    setCarregando(false)
    if (error) {
      setErro(
        error.status === 429 || /rate|limit/i.test(error.message)
          ? 'Muitos pedidos seguidos. Espere alguns minutos e tente de novo.'
          : 'Não conseguimos enviar o e-mail. Confira o endereço e tente de novo.',
      )
      return
    }
    setEtapa('enviado')
  }

  async function confirmarCodigo(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setCarregando(true)
    const supabase = supabaseNavegador()
    const { error } = await supabase.auth.verifyOtp({ email: email.trim().toLowerCase(), token: codigo.trim(), type: 'email' })
    setCarregando(false)
    if (error) {
      setErro('Código inválido ou expirado.')
      return
    }
    router.replace(depois)
    router.refresh()
  }

  if (etapa === 'enviado') {
    return (
      <div className="mt-6 aparecer">
        <div className="cartao p-4" role="status">
          <p style={{ fontSize: 15, fontWeight: 600 }}>Confira seu e-mail</p>
          <p className="mt-1" style={{ fontSize: 14, lineHeight: 1.45, color: 'var(--text-2)' }}>
            Enviamos um link para <strong style={{ color: 'var(--text)' }}>{email}</strong>. Abra o link neste mesmo aparelho.
          </p>
        </div>
        <form onSubmit={confirmarCodigo} className="mt-5">
          <label htmlFor="codigo" style={{ fontSize: 14, color: 'var(--text-2)' }}>
            O e-mail trouxe um código de 6 dígitos? Digite aqui:
          </label>
          <input
            id="codigo"
            className="campo mt-2 text-center tracking-[0.3em]"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={8}
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
          />
          {erro && (
            <p className="mt-2" role="alert" style={{ fontSize: 14, color: 'var(--erro)' }}>
              {erro}
            </p>
          )}
          <button className="botao-principal mt-4" disabled={codigo.length < 6 || carregando}>
            {carregando ? 'Entrando…' : 'Entrar com o código'}
          </button>
        </form>
        <button type="button" className="botao-secundario mt-4 w-full" onClick={() => setEtapa('email')}>
          Usar outro e-mail
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={enviar} className="mt-6">
      <label htmlFor="email" className="sobrancelha">
        Seu e-mail
      </label>
      <input
        id="email"
        type="email"
        required
        autoComplete="email"
        className="campo mt-2"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="voce@email.com"
      />
      {erro && (
        <p className="mt-2" role="alert" style={{ fontSize: 14, color: 'var(--erro)' }}>
          {erro}
        </p>
      )}
      <button className="botao-principal mt-4" disabled={carregando}>
        {carregando ? 'Enviando…' : 'Receber link de acesso'}
      </button>
      <p className="mt-4 text-center" style={{ fontSize: 13, color: 'var(--text-3)' }}>
        No iPhone, entre pelo Safari antes de instalar o app na tela inicial.
      </p>
    </form>
  )
}
