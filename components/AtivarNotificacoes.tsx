'use client'
import { useEffect, useState } from 'react'
import { chavePublicaPush, enviarPushDeTeste, salvarInscricaoPush } from '@/app/acoes'
import { Sino } from './Icones'

type Estado = 'carregando' | 'sem-suporte' | 'ios-instalar' | 'negado' | 'desligado' | 'ativo'

function base64ParaBytes(base64: string) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const b = atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(b, (c) => c.charCodeAt(0))
}

export function ehIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

export function estaInstalado() {
  return window.matchMedia('(display-mode: standalone)').matches || !!(navigator as unknown as { standalone?: boolean }).standalone
}

export function AtivarNotificacoes({ mostrarTeste = false }: { mostrarTeste?: boolean }) {
  const [estado, setEstado] = useState<Estado>('carregando')
  const [mensagem, setMensagem] = useState('')
  const [ocupado, setOcupado] = useState(false)

  useEffect(() => {
    ;(async () => {
      if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
        setEstado(ehIOS() && !estaInstalado() ? 'ios-instalar' : 'sem-suporte')
        return
      }
      if (Notification.permission === 'denied') return setEstado('negado')
      const reg = await navigator.serviceWorker.ready
      const inscricao = await reg.pushManager.getSubscription()
      setEstado(inscricao && Notification.permission === 'granted' ? 'ativo' : 'desligado')
    })()
  }, [])

  async function ativar() {
    setOcupado(true)
    setMensagem('')
    try {
      const permissao = await Notification.requestPermission()
      if (permissao !== 'granted') {
        setEstado(permissao === 'denied' ? 'negado' : 'desligado')
        return
      }
      const chave = await chavePublicaPush()
      if (!chave) throw new Error('sem chave')
      const reg = await navigator.serviceWorker.ready
      const inscricao =
        (await reg.pushManager.getSubscription()) ||
        (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: base64ParaBytes(chave) }))
      const json = inscricao.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } }
      const r = await salvarInscricaoPush(json)
      if (!r.ok) throw new Error('falhou')
      setEstado('ativo')
    } catch {
      setMensagem('Não deu para ativar agora. Tente de novo em instantes.')
    } finally {
      setOcupado(false)
    }
  }

  async function testar() {
    setOcupado(true)
    const r = await enviarPushDeTeste()
    setOcupado(false)
    setMensagem(r.ok ? 'Enviada. Ela deve chegar em alguns segundos.' : r.erro || 'Não foi possível enviar.')
  }

  const texto: Record<Estado, string> = {
    carregando: 'Verificando…',
    'sem-suporte': 'Este navegador não recebe notificações. No celular, use o app instalado na tela inicial.',
    'ios-instalar': 'No iPhone, os lembretes só funcionam com o app instalado na tela inicial. Instale primeiro e ative por lá.',
    negado: 'As notificações estão bloqueadas. Libere nas configurações do aparelho para este app.',
    desligado: 'Ative para receber o lembrete da porta de hoje.',
    ativo: 'Notificações ativas neste aparelho.',
  }

  return (
    <div>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0" style={{ color: estado === 'ativo' ? 'var(--accent)' : 'var(--text-3)' }}>
          <Sino />
        </span>
        <p style={{ fontSize: 14, lineHeight: 1.45, color: 'var(--text-2)' }}>{texto[estado]}</p>
      </div>
      {estado === 'desligado' && (
        <button type="button" className="botao-principal mt-3" onClick={ativar} disabled={ocupado}>
          {ocupado ? 'Ativando…' : 'Ativar notificações'}
        </button>
      )}
      {estado === 'ativo' && mostrarTeste && (
        <button type="button" className="botao-secundario mt-3 w-full" onClick={testar} disabled={ocupado}>
          Enviar notificação de teste
        </button>
      )}
      {mensagem && (
        <p className="mt-2" role="status" style={{ fontSize: 13, color: 'var(--text-2)' }}>
          {mensagem}
        </p>
      )}
    </div>
  )
}
