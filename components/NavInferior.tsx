'use client'
import NextLink from 'next/link'
import { usePathname } from 'next/navigation'
import { IconeCaminho, IconeGrupo, IconeInicio, IconeVoce } from './Icones'

const ITENS = [
  { href: '/', rotulo: 'Início', Icone: IconeInicio },
  { href: '/caminho', rotulo: 'Caminho', Icone: IconeCaminho },
  { href: '/grupo', rotulo: 'Grupo', Icone: IconeGrupo },
  { href: '/voce', rotulo: 'Você', Icone: IconeVoce },
]

export function NavInferior() {
  const caminho = usePathname()
  return (
    <nav
      aria-label="Navegação principal"
      className="nav-inferior fixed z-30 grid grid-cols-4 p-1.5"
      style={{
        left: 'max(20px, calc(50% - 220px))',
        right: 'max(20px, calc(50% - 220px))',
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 18px)',
        height: 66,
        borderRadius: 33,
      }}
    >
      {ITENS.map(({ href, rotulo, Icone }) => {
        const ativo = href === '/' ? caminho === '/' : caminho.startsWith(href)
        return (
          <NextLink
            key={href}
            href={href}
            aria-current={ativo ? 'page' : undefined}
            className="flex flex-col items-center justify-center gap-[3px] no-underline"
            style={{
              borderRadius: 27,
              color: ativo ? 'var(--accent)' : 'var(--text-2)',
              background: ativo ? 'var(--nav-ativo)' : 'transparent',
            }}
          >
            <Icone />
            <span style={{ fontSize: 11, fontWeight: ativo ? 600 : 500 }}>{rotulo}</span>
          </NextLink>
        )
      })}
    </nav>
  )
}
