'use client'
import { useEffect, useState } from 'react'
import { ehIOS, estaInstalado } from './AtivarNotificacoes'
import { Check, Compartilhar } from './Icones'

type EventoInstalar = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }

export function InstalarApp() {
  const [instalado, setInstalado] = useState<boolean | null>(null)
  const [ios, setIos] = useState(false)
  const [pedido, setPedido] = useState<EventoInstalar | null>(null)

  useEffect(() => {
    setInstalado(estaInstalado())
    setIos(ehIOS())
    const ouvir = (e: Event) => {
      e.preventDefault()
      setPedido(e as EventoInstalar)
    }
    window.addEventListener('beforeinstallprompt', ouvir)
    window.addEventListener('appinstalled', () => setInstalado(true))
    return () => window.removeEventListener('beforeinstallprompt', ouvir)
  }, [])

  if (instalado === null) return null
  if (instalado)
    return (
      <div className="flex items-center gap-3" style={{ fontSize: 14, color: 'var(--text-2)' }}>
        <Check /> O app já está na sua tela inicial.
      </div>
    )

  if (ios)
    return (
      <ol className="flex flex-col gap-3" style={{ fontSize: 14, lineHeight: 1.45, color: 'var(--text-2)' }}>
        <li className="flex gap-3">
          <Passo n={1} />
          <span>
            Abra este endereço no <strong style={{ color: 'var(--text)' }}>Safari</strong>.
          </span>
        </li>
        <li className="flex gap-3">
          <Passo n={2} />
          <span className="flex flex-wrap items-center gap-1">
            Toque em <strong style={{ color: 'var(--text)' }}>Compartilhar</strong>
            <span aria-hidden="true" style={{ color: 'var(--accent)' }}>
              <Compartilhar tamanho={18} />
            </span>
            na barra do navegador.
          </span>
        </li>
        <li className="flex gap-3">
          <Passo n={3} />
          <span>
            Escolha <strong style={{ color: 'var(--text)' }}>Adicionar à Tela de Início</strong> e confirme.
          </span>
        </li>
        <li className="flex gap-3">
          <Passo n={4} />
          <span>Abra o Guia pelo ícone novo e ative as notificações por lá.</span>
        </li>
      </ol>
    )

  return pedido ? (
    <button
      type="button"
      className="botao-principal"
      onClick={async () => {
        await pedido.prompt()
        const escolha = await pedido.userChoice
        if (escolha.outcome === 'accepted') setInstalado(true)
        setPedido(null)
      }}
    >
      Instalar na tela inicial
    </button>
  ) : (
    <p style={{ fontSize: 14, lineHeight: 1.45, color: 'var(--text-2)' }}>
      No menu do navegador (⋮), escolha <strong style={{ color: 'var(--text)' }}>Instalar app</strong> ou{' '}
      <strong style={{ color: 'var(--text)' }}>Adicionar à tela inicial</strong>.
    </p>
  )
}

function Passo({ n }: { n: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full"
      style={{ width: 24, height: 24, fontSize: 12, fontWeight: 600, color: 'var(--text)', background: 'var(--surface)', border: '1px solid var(--border-forte)' }}
    >
      {n}
    </span>
  )
}
