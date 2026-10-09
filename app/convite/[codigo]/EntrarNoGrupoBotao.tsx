'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { entrarNoGrupo } from '@/app/acoes'

export function EntrarNoGrupoBotao({ codigo, onboarding }: { codigo: string; onboarding: boolean }) {
  const router = useRouter()
  const [erro, setErro] = useState('')
  const [ocupado, setOcupado] = useState(false)
  if (onboarding)
    return (
      <button type="button" className="botao-principal" onClick={() => router.push(`/boas-vindas?convite=${codigo}`)}>
        Começar e entrar no grupo
      </button>
    )
  return (
    <>
      <button
        type="button"
        className="botao-principal"
        disabled={ocupado}
        onClick={async () => {
          setOcupado(true)
          const r = await entrarNoGrupo(codigo)
          setOcupado(false)
          if (!r.ok) return setErro(r.erro || '')
          router.push('/grupo')
          router.refresh()
        }}
      >
        Entrar no grupo
      </button>
      {erro && (
        <p role="alert" style={{ fontSize: 14, color: 'var(--erro)' }}>
          {erro}
        </p>
      )}
    </>
  )
}
