import NextLink from 'next/link'
import { Chama, Estrela } from './Icones'

export function Marca({ tamanho = 19 }: { tamanho?: number }) {
  return (
    <div className="flex items-center gap-[7px]">
      <Estrela tamanho={tamanho > 17 ? 14 : 13} />
      <span className="font-titulo" style={{ fontSize: tamanho, fontWeight: 500, letterSpacing: '-0.01em' }}>
        Guia do Advento
      </span>
    </div>
  )
}

export function Cabecalho({ sequencia, inicial }: { sequencia: number | null; inicial: string }) {
  return (
    <div className="flex h-11 items-center justify-between">
      <Marca />
      <div className="flex items-center gap-2">
        {sequencia !== null && (
          <NextLink
            href="/caminho"
            aria-label={`${sequencia} ${sequencia === 1 ? 'dia seguido' : 'dias seguidos'}`}
            className="flex h-11 items-center gap-1.5 rounded-[22px] border pl-[11px] pr-[14px] no-underline"
            style={{ background: 'var(--surface)', borderColor: 'var(--border-forte)', color: 'var(--text)', fontSize: 15, fontWeight: 600 }}
          >
            <Chama />
            <span>{sequencia}</span>
          </NextLink>
        )}
        <NextLink
          href="/voce"
          aria-label="Seu perfil"
          className="botao-redondo font-titulo no-underline"
          style={{ fontSize: 16, fontWeight: 500 }}
        >
          {inicial || '✦'}
        </NextLink>
      </div>
    </div>
  )
}
