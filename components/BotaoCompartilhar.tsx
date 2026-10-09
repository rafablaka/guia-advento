'use client'
import { useState } from 'react'
import { registrarEvento } from '@/app/acoes'
import { Compartilhar } from './Icones'

/** Gera a arte 9:16 no servidor e abre o compartilhamento do celular (Stories, WhatsApp…). */
export function BotaoCompartilhar({
  arte,
  texto,
  link,
  rotulo = 'Compartilhar nos Stories',
  tipo,
  secundario = false,
}: {
  arte: string
  texto: string
  link?: string
  rotulo?: string
  tipo: string
  secundario?: boolean
}) {
  const [estado, setEstado] = useState<'' | 'gerando' | 'copiado' | 'baixado'>('')

  async function compartilhar() {
    setEstado('gerando')
    const url = link ? new URL(link, window.location.origin).href : undefined
    try {
      const resp = await fetch(arte)
      const blob = await resp.blob()
      const arquivo = new File([blob], 'guia-do-advento.png', { type: 'image/png' })
      if (navigator.canShare?.({ files: [arquivo] })) {
        await navigator.share({ files: [arquivo], text: url ? `${texto} ${url}` : texto })
        registrarEvento('compartilhou', { tipo })
        setEstado('')
        return
      }
      if (navigator.share && url) {
        await navigator.share({ text: texto, url })
        registrarEvento('compartilhou', { tipo })
        setEstado('')
        return
      }
      // Computador: baixa a imagem e copia o link
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = 'guia-do-advento.png'
      a.click()
      if (url) await navigator.clipboard?.writeText(`${texto} ${url}`).catch(() => {})
      registrarEvento('compartilhou', { tipo })
      setEstado('baixado')
    } catch {
      setEstado('')
    }
  }

  return (
    <div>
      <button type="button" className={secundario ? 'botao-secundario w-full' : 'botao-principal'} onClick={compartilhar} disabled={estado === 'gerando'}>
        <Compartilhar />
        {estado === 'gerando' ? 'Preparando a arte…' : rotulo}
      </button>
      {estado === 'baixado' && (
        <p role="status" className="mt-2 text-center" style={{ fontSize: 13, color: 'var(--text-2)' }}>
          Imagem baixada{link ? ' e link copiado' : ''}.
        </p>
      )}
    </div>
  )
}
