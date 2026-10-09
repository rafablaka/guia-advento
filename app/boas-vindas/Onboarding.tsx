'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import NextLink from 'next/link'
import { criarGrupo, entrarNoGrupo, salvarPerfil } from '@/app/acoes'
import { AtivarNotificacoes } from '@/components/AtivarNotificacoes'
import { InstalarApp } from '@/components/InstalarApp'
import { Coroa } from '@/components/Coroa'
import { Marca } from '@/components/Cabecalho'
import { Cadeado, IconeGrupo, IconeVoce } from '@/components/Icones'

const ETAPAS_DO_DIA = [
  { nome: 'Ouvir', texto: 'Um trecho de um santo e uma explicação para hoje. 2 a 3 minutos.' },
  { nome: 'Rezar', texto: 'Uma oração guiada a partir do texto do dia. 3 a 5 minutos.' },
  { nome: 'Agir', texto: 'Uma missão concreta para viver ao longo do dia.' },
  { nome: 'Fechar', texto: 'À noite, dois toques: cumpriu a missão? Que frase ficou?' },
]

export function Onboarding(props: {
  nomeInicial: string
  horaInicial: string
  plano: 'simples' | 'completo'
  grupoAtual: string | null
  convite: string | null
}) {
  const router = useRouter()
  const [passo, setPasso] = useState(0)
  const [nome, setNome] = useState(props.nomeInicial)
  const [hora, setHora] = useState(props.horaInicial || '07:00')
  const [modo, setModo] = useState<'solo' | 'grupo'>(props.convite || props.grupoAtual ? 'grupo' : 'solo')
  const [nomeGrupo, setNomeGrupo] = useState('')
  const [codigo, setCodigo] = useState(props.convite || '')
  const [erro, setErro] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const total = 4

  async function avancar() {
    setErro('')
    if (passo === 0) await salvarPerfil({ nome })
    if (passo === 2) await salvarPerfil({ lembrete_hora: hora, lembrete_ativo: true })
    if (passo < total - 1) return setPasso(passo + 1)
    await concluir()
  }

  async function concluir() {
    setOcupado(true)
    if (modo === 'grupo' && props.plano === 'completo' && !props.grupoAtual) {
      const r = codigo.trim()
        ? await entrarNoGrupo(extrairCodigo(codigo))
        : nomeGrupo.trim()
          ? await criarGrupo(nomeGrupo)
          : { ok: false, erro: 'Dê um nome ao grupo ou cole o link do convite.' }
      if (!r.ok) {
        setOcupado(false)
        return setErro(r.erro || 'Algo deu errado.')
      }
    }
    await salvarPerfil({ modo: props.plano === 'completo' ? modo : 'solo', onboarding_ok: true })
    router.replace(modo === 'grupo' && props.plano === 'completo' ? '/grupo' : '/')
    router.refresh()
  }

  return (
    <main className="tela-cheia">
      <div className="flex items-center justify-between">
        <Marca tamanho={16} />
        <span style={{ fontSize: 13, color: 'var(--text-3)' }}>
          {passo + 1} de {total}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-1.5" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <div key={i} style={{ height: 3, borderRadius: 2, background: i <= passo ? 'var(--accent)' : 'var(--track)' }} />
        ))}
      </div>

      <div className="aparecer flex-1" key={passo}>
        {passo === 0 && (
          <>
            <div className="mt-5 flex justify-center">
              <Coroa velas={0} largura={220} />
            </div>
            <h1 className="font-titulo mt-3" style={{ fontSize: 30, fontWeight: 500, lineHeight: 1.12, letterSpacing: '-0.015em' }}>
              26 dias para viver o Advento
            </h1>
            <p className="mt-2" style={{ fontSize: 15, lineHeight: 1.45, color: 'var(--text-2)' }}>
              De 29 de novembro a 24 de dezembro, uma porta por dia. Cada dia leva de 7 a 10 minutos.
            </p>
            <ul className="mt-4 flex flex-col gap-2">
              {ETAPAS_DO_DIA.map((e) => (
                <li key={e.nome} className="cartao flex gap-3 px-4 py-3">
                  <span className="font-titulo shrink-0" style={{ width: 64, fontSize: 17, fontWeight: 500, color: 'var(--accent)' }}>
                    {e.nome}
                  </span>
                  <span style={{ fontSize: 14, lineHeight: 1.4, color: 'var(--text-2)' }}>{e.texto}</span>
                </li>
              ))}
            </ul>
            <label htmlFor="nome" className="sobrancelha mt-5 block">
              Como podemos te chamar?
            </label>
            <input id="nome" className="campo mt-2" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" autoComplete="given-name" />
          </>
        )}

        {passo === 1 && (
          <>
            <h1 className="font-titulo mt-6" style={{ fontSize: 30, fontWeight: 500, lineHeight: 1.12 }}>
              Coloque o Guia na tela inicial
            </h1>
            <p className="mt-2 mb-5" style={{ fontSize: 15, lineHeight: 1.45, color: 'var(--text-2)' }}>
              Assim ele abre como um app e o lembrete diário consegue chegar até você. No iPhone, sem isso as notificações não funcionam.
            </p>
            <div className="cartao p-4">
              <InstalarApp />
            </div>
          </>
        )}

        {passo === 2 && (
          <>
            <h1 className="font-titulo mt-6" style={{ fontSize: 30, fontWeight: 500, lineHeight: 1.12 }}>
              A que horas a porta deve te chamar?
            </h1>
            <p className="mt-2 mb-5" style={{ fontSize: 15, lineHeight: 1.45, color: 'var(--text-2)' }}>
              Um lembrete por dia, no horário que você escolher. À noite, outro para fechar o dia. Nunca mais de dois.
            </p>
            <label htmlFor="hora" className="sobrancelha">
              Horário do lembrete
            </label>
            <input id="hora" type="time" className="campo mt-2" value={hora} onChange={(e) => setHora(e.target.value)} />
            <div className="cartao mt-4 p-4">
              <AtivarNotificacoes />
            </div>
          </>
        )}

        {passo === 3 && (
          <>
            <h1 className="font-titulo mt-6" style={{ fontSize: 30, fontWeight: 500, lineHeight: 1.12 }}>
              Sozinho ou em grupo?
            </h1>
            <p className="mt-2 mb-5" style={{ fontSize: 15, lineHeight: 1.45, color: 'var(--text-2)' }}>
              A jornada é completa sozinho. Em grupo, a coroa do grupo só acende quando todos rezam o dia. Dá para entrar num grupo depois.
            </p>
            <div className="grid grid-cols-2 gap-2.5" role="radiogroup" aria-label="Como você vai viver a jornada">
              <OpcaoModo ativo={modo === 'solo'} onClick={() => setModo('solo')} titulo="Sozinho" icone={<IconeVoce />} />
              <OpcaoModo
                ativo={modo === 'grupo'}
                onClick={() => setModo('grupo')}
                titulo="Em grupo"
                icone={<IconeGrupo />}
                bloqueado={props.plano !== 'completo'}
              />
            </div>
            {modo === 'grupo' && props.plano !== 'completo' && (
              <div className="cartao mt-4 p-4">
                <p style={{ fontSize: 15, fontWeight: 600 }}>O grupo faz parte do Completo</p>
                <p className="mt-1" style={{ fontSize: 14, lineHeight: 1.45, color: 'var(--text-2)' }}>
                  Você pode começar sozinho agora e fazer o upgrade quando quiser, inclusive durante o Advento.
                </p>
                <NextLink href="/upgrade" className="botao-secundario mt-3 w-full">
                  Conhecer o Completo
                </NextLink>
              </div>
            )}
            {modo === 'grupo' && props.plano === 'completo' && props.grupoAtual && (
              <p className="cartao mt-4 p-4" style={{ fontSize: 14, color: 'var(--text-2)' }}>
                Você já está no grupo <strong style={{ color: 'var(--text)' }}>{props.grupoAtual}</strong>.
              </p>
            )}
            {modo === 'grupo' && props.plano === 'completo' && !props.grupoAtual && (
              <div className="mt-4 flex flex-col gap-3">
                {!props.convite && (
                  <div>
                    <label htmlFor="nomeGrupo" className="sobrancelha">
                      Criar um grupo
                    </label>
                    <input
                      id="nomeGrupo"
                      className="campo mt-2"
                      value={nomeGrupo}
                      onChange={(e) => {
                        setNomeGrupo(e.target.value)
                        if (e.target.value) setCodigo('')
                      }}
                      placeholder="Ex.: Família Silva"
                    />
                  </div>
                )}
                <div>
                  <label htmlFor="codigo" className="sobrancelha">
                    {props.convite ? 'Você recebeu um convite' : 'Ou entrar com um convite'}
                  </label>
                  <input
                    id="codigo"
                    className="campo mt-2"
                    value={codigo}
                    onChange={(e) => {
                      setCodigo(e.target.value)
                      if (e.target.value) setNomeGrupo('')
                    }}
                    placeholder="Cole o link ou o código"
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {erro && (
        <p className="mt-3" role="alert" style={{ fontSize: 14, color: 'var(--erro)' }}>
          {erro}
        </p>
      )}
      <div className="mt-6 flex flex-col gap-2">
        <button type="button" className="botao-principal" onClick={avancar} disabled={ocupado}>
          {passo === total - 1 ? (ocupado ? 'Preparando…' : 'Começar') : 'Continuar'}
        </button>
        <div className="flex justify-between">
          {passo > 0 ? (
            <button type="button" className="botao-secundario border-0 bg-transparent" onClick={() => setPasso(passo - 1)}>
              Voltar
            </button>
          ) : (
            <span />
          )}
          {(passo === 1 || passo === 2) && (
            <button type="button" className="botao-secundario border-0 bg-transparent" onClick={() => setPasso(passo + 1)}>
              Fazer depois
            </button>
          )}
        </div>
      </div>
    </main>
  )
}

function extrairCodigo(valor: string) {
  const v = valor.trim()
  const m = v.match(/convite\/([A-Za-z0-9]+)/)
  return m ? m[1] : v
}

function OpcaoModo(p: { ativo: boolean; onClick: () => void; titulo: string; icone: React.ReactNode; bloqueado?: boolean }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={p.ativo}
      onClick={p.onClick}
      className="cartao flex flex-col items-start gap-2 p-4 text-left"
      style={{ minHeight: 96, borderColor: p.ativo ? 'var(--accent)' : 'var(--border)', color: 'var(--text)' }}
    >
      <span className="flex w-full items-center justify-between" style={{ color: p.ativo ? 'var(--accent)' : 'var(--text-2)' }}>
        {p.icone}
        {p.bloqueado && (
          <span aria-label="Plano Completo" style={{ color: 'var(--text-3)' }}>
            <Cadeado tamanho={16} />
          </span>
        )}
      </span>
      <span style={{ fontSize: 15, fontWeight: 600 }}>{p.titulo}</span>
    </button>
  )
}
