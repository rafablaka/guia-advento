'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { criarGrupo, entrarNoGrupo, sairDoGrupo } from '@/app/acoes'
import { BotaoCompartilhar } from '@/components/BotaoCompartilhar'
import { Link as IconeLink } from '@/components/Icones'

export function AcoesGrupo() {
  const router = useRouter()
  const [nome, setNome] = useState('')
  const [codigo, setCodigo] = useState('')
  const [erro, setErro] = useState('')
  const [ocupado, setOcupado] = useState(false)

  async function criar(e: React.FormEvent) {
    e.preventDefault()
    setOcupado(true)
    const r = await criarGrupo(nome)
    setOcupado(false)
    if (!r.ok) return setErro(r.erro || '')
    router.refresh()
  }

  async function entrar(e: React.FormEvent) {
    e.preventDefault()
    setOcupado(true)
    const v = codigo.trim()
    const r = await entrarNoGrupo(v.match(/convite\/([A-Za-z0-9]+)/)?.[1] || v)
    setOcupado(false)
    if (!r.ok) return setErro(r.erro || '')
    router.refresh()
  }

  return (
    <div className="mt-6 flex flex-col gap-4">
      <form onSubmit={criar} className="cartao p-4">
        <label htmlFor="nome-grupo" style={{ fontSize: 15, fontWeight: 600 }}>
          Criar um grupo
        </label>
        <input id="nome-grupo" className="campo mt-3" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Família Silva" maxLength={60} />
        <button className="botao-principal mt-3" disabled={!nome.trim() || ocupado}>
          Criar e convidar
        </button>
      </form>
      <form onSubmit={entrar} className="cartao p-4">
        <label htmlFor="codigo-grupo" style={{ fontSize: 15, fontWeight: 600 }}>
          Entrar com um convite
        </label>
        <input id="codigo-grupo" className="campo mt-3" value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Cole o link ou o código" />
        <button className="botao-secundario mt-3 w-full" disabled={!codigo.trim() || ocupado}>
          Entrar no grupo
        </button>
      </form>
      {erro && (
        <p role="alert" style={{ fontSize: 14, color: 'var(--erro)' }}>
          {erro}
        </p>
      )}
    </div>
  )
}

export function ConviteGrupo({ codigo, nome }: { codigo: string; nome: string }) {
  const [copiado, setCopiado] = useState(false)
  const link = `/convite/${codigo}`
  return (
    <div className="flex flex-col gap-2">
      <BotaoCompartilhar
        arte={`/api/arte?tipo=convite&grupo=${encodeURIComponent(nome)}`}
        texto={`Vamos viver o Advento juntos no grupo “${nome}”?`}
        link={link}
        tipo="convite_grupo"
        rotulo="Enviar convite"
      />
      <button
        type="button"
        className="botao-secundario w-full"
        onClick={async () => {
          await navigator.clipboard?.writeText(new URL(link, window.location.origin).href)
          setCopiado(true)
        }}
      >
        <IconeLink tamanho={18} />
        {copiado ? 'Link copiado' : 'Copiar link do convite'}
      </button>
    </div>
  )
}

export function SairDoGrupo() {
  const router = useRouter()
  const [confirmar, setConfirmar] = useState(false)
  return (
    <div className="mt-6 text-center">
      {!confirmar ? (
        <button type="button" className="botao-secundario border-0 bg-transparent" style={{ color: 'var(--text-3)' }} onClick={() => setConfirmar(true)}>
          Sair do grupo
        </button>
      ) : (
        <div className="cartao p-4">
          <p style={{ fontSize: 14, color: 'var(--text-2)' }}>Sair do grupo? Sua jornada pessoal continua igual.</p>
          <div className="mt-3 flex gap-2">
            <button type="button" className="botao-secundario flex-1" onClick={() => setConfirmar(false)}>
              Ficar
            </button>
            <button
              type="button"
              className="botao-secundario flex-1"
              onClick={async () => {
                await sairDoGrupo()
                router.refresh()
              }}
            >
              Sair
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
