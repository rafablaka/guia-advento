'use client'
import { useEffect, useState } from 'react'
import { Fechar } from '@/components/Icones'

/** Leitura em formato stories: toque à direita avança, à esquerda volta. */
export function Stories({ slides, titulo, santo, onFechar, onFim }: { slides: string[]; titulo: string; santo: string; onFechar: () => void; onFim: () => void }) {
  const [i, setI] = useState(0)
  const ultimo = i === slides.length - 1

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFechar()
      if (e.key === 'ArrowRight') avancar()
      if (e.key === 'ArrowLeft') setI((v) => Math.max(0, v - 1))
    }
    window.addEventListener('keydown', tecla)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', tecla)
      document.body.style.overflow = ''
    }
  })

  function avancar() {
    if (ultimo) onFim()
    else setI(i + 1)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Meditação: ${titulo}`}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: 'var(--bg)' }}
    >
      <div
        className="mx-auto flex w-full max-w-[480px] flex-1 flex-col px-6"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 20px)', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 28px)' }}
      >
        <div className="flex gap-1.5" aria-hidden="true">
          {slides.map((_, k) => (
            <div key={k} className="flex-1" style={{ height: 3, borderRadius: 2, background: k <= i ? 'var(--accent)' : 'var(--track)' }} />
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span style={{ fontSize: 13, color: 'var(--text-2)' }}>
            {santo} · {i + 1} de {slides.length}
          </span>
          <button type="button" aria-label="Fechar a leitura" className="botao-redondo" onClick={onFechar}>
            <Fechar />
          </button>
        </div>
        <div className="relative flex flex-1 items-center">
          <button type="button" aria-label="Tela anterior" className="absolute inset-y-0 left-0 w-1/3 border-0 bg-transparent" onClick={() => setI(Math.max(0, i - 1))} />
          <button type="button" aria-label={ultimo ? 'Terminar a leitura' : 'Próxima tela'} className="absolute inset-y-0 right-0 w-2/3 border-0 bg-transparent" onClick={avancar} />
          <p
            key={i}
            className="aparecer font-titulo pointer-events-none"
            aria-live="polite"
            style={{ fontSize: i === 0 ? 26 : 22, lineHeight: 1.4, fontStyle: i === 0 ? 'italic' : 'normal', color: i === 0 ? 'var(--quote)' : 'var(--text)' }}
          >
            {slides[i]}
          </p>
        </div>
        <button type="button" className="botao-principal" onClick={avancar}>
          {ultimo ? 'Seguir para rezar' : 'Continuar'}
        </button>
      </div>
    </div>
  )
}
