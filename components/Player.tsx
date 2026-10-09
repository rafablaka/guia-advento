'use client'
import { useEffect, useRef, useState } from 'react'
import NextLink from 'next/link'
import { Cadeado, Pausa, Play } from './Icones'

const ALTURAS = [10, 16, 22, 14, 28, 20, 12, 24, 30, 18, 26, 14, 20, 30, 22, 12, 18, 26, 16, 10, 22, 28, 14, 20, 24, 12, 18, 28, 16, 22]
const PREVIA_SEG = 10

function tempo(s: number) {
  const t = Math.max(0, Math.round(s))
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`
}

/** Player de áudio. No plano Simples toca só uma prévia e mostra o cadeado. */
export function Player({
  src,
  duracao,
  rotulo,
  bloqueado,
  onOuvido,
  onFim,
}: {
  src: string | null
  duracao: number | null
  rotulo: string
  bloqueado: boolean
  onOuvido?: (segundos: number) => void
  onFim?: () => void
}) {
  const audio = useRef<HTMLAudioElement | null>(null)
  const [tocando, setTocando] = useState(false)
  const [atual, setAtual] = useState(0)
  const [total, setTotal] = useState(duracao || 0)
  const [fimDaPrevia, setFimDaPrevia] = useState(false)
  const ouvido = useRef(0)
  const ultimo = useRef(0)

  useEffect(() => () => audio.current?.pause(), [])

  if (!src)
    return (
      <div className="cartao flex items-center gap-3.5 p-3.5" style={{ color: 'var(--text-3)' }}>
        <span className="flex shrink-0 items-center justify-center rounded-full" style={{ width: 52, height: 52, border: '1px dashed var(--tracejado)' }}>
          <Play />
        </span>
        <span style={{ fontSize: 13 }}>{rotulo} · áudio em produção</span>
      </div>
    )

  function alternar() {
    const a = audio.current
    if (!a) return
    if (fimDaPrevia) return
    if (a.paused) a.play().then(() => setTocando(true)).catch(() => {})
    else {
      a.pause()
      setTocando(false)
    }
  }

  const progresso = total ? Math.min(1, atual / total) : 0
  const limite = bloqueado ? PREVIA_SEG : Infinity

  return (
    <div className="cartao relative flex items-center gap-3.5 p-3.5">
      <audio
        ref={audio}
        src={src}
        preload="metadata"
        onLoadedMetadata={(e) => setTotal(e.currentTarget.duration || duracao || 0)}
        onTimeUpdate={(e) => {
          const t = e.currentTarget.currentTime
          const delta = t - ultimo.current
          if (delta > 0 && delta < 2) {
            ouvido.current += delta
            onOuvido?.(ouvido.current)
          }
          ultimo.current = t
          setAtual(t)
          if (t >= limite) {
            e.currentTarget.pause()
            setTocando(false)
            setFimDaPrevia(true)
          }
        }}
        onEnded={() => {
          setTocando(false)
          onFim?.()
        }}
      />
      <button
        type="button"
        onClick={alternar}
        aria-label={tocando ? `Pausar ${rotulo.toLowerCase()}` : `Ouvir ${rotulo.toLowerCase()}${bloqueado ? ' (prévia)' : ''}`}
        className="flex shrink-0 items-center justify-center rounded-full border-0"
        style={{ width: 52, height: 52, background: 'var(--primary)', opacity: fimDaPrevia ? 0.5 : 1 }}
      >
        {tocando ? <Pausa /> : <Play />}
      </button>
      <div className="min-w-0 flex-1">
        <div aria-hidden="true" className="flex items-center justify-between" style={{ height: 30 }}>
          {ALTURAS.map((h, i) => (
            <span
              key={i}
              style={{ width: 3, height: h, borderRadius: 2, background: i / ALTURAS.length < progresso ? 'var(--accent)' : 'var(--track-2)' }}
            />
          ))}
        </div>
        <div className="mt-1.5 flex justify-between" style={{ fontSize: 12, color: 'var(--text-3)' }}>
          <span>{tempo(atual)}</span>
          <span>
            {rotulo} · {bloqueado ? `prévia de ${PREVIA_SEG}s` : tempo(total)}
          </span>
        </div>
      </div>
      {bloqueado && fimDaPrevia && (
        <div className="absolute inset-0 flex items-center justify-center gap-3 rounded-[20px] px-4" style={{ background: 'var(--surface)' }}>
          <span style={{ color: 'var(--text-3)' }}>
            <Cadeado />
          </span>
          <span className="flex-1" style={{ fontSize: 13, color: 'var(--text-2)' }}>
            O áudio completo faz parte do plano Completo
          </span>
          <NextLink href="/upgrade" className="botao-secundario" style={{ fontSize: 13, padding: '0 14px' }}>
            Ouvir no Completo
          </NextLink>
        </div>
      )}
    </div>
  )
}
