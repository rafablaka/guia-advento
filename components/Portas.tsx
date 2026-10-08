import NextLink from 'next/link'
import type { EstadoPorta } from '@/lib/progresso'
import { Check } from './Icones'

export function Porta({ dia, estado, largura = 40, altura = 52 }: { dia: number; estado: EstadoPorta; largura?: number; altura?: number }) {
  const rotulo =
    estado === 'concluida'
      ? `Dia ${dia} concluído`
      : estado === 'hoje'
        ? `Dia ${dia}, hoje`
        : estado === 'recuperar'
          ? `Dia ${dia}, para recuperar`
          : `Dia ${dia}, ainda fechado`
  const estilo: React.CSSProperties = {
    width: largura,
    height: altura,
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-titulo)',
  }
  let conteudo: React.ReactNode = dia
  if (estado === 'concluida') {
    Object.assign(estilo, { background: 'var(--surface)', border: '1px solid var(--gold-borda)' })
    conteudo = <Check cor="var(--gold)" />
  } else if (estado === 'hoje') {
    Object.assign(estilo, { background: 'var(--hoje-fill)', border: '1px solid var(--hoje-borda)', color: '#FFFFFF', fontSize: 18, fontWeight: 600 })
  } else if (estado === 'recuperar') {
    Object.assign(estilo, { border: '1.5px dashed var(--gold-borda)', color: 'var(--text-2)', fontSize: 16 })
  } else {
    Object.assign(estilo, { border: '1px solid var(--border-forte)', color: 'var(--text-3)', fontSize: 16 })
  }

  const porta = (
    <div className="porta" style={estilo} role="img" aria-label={rotulo}>
      {conteudo}
    </div>
  )
  if (estado === 'futura') return porta
  return (
    <NextLink href={`/dia/${dia}`} className="no-underline" aria-label={rotulo} style={{ minWidth: 44 }}>
      <div className="porta" style={estilo}>
        {conteudo}
      </div>
    </NextLink>
  )
}
