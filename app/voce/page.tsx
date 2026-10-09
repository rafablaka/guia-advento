import NextLink from 'next/link'
import { exigirSessao } from '@/lib/sessao'
import { MODO_TESTE } from '@/lib/config'
import { NavInferior } from '@/components/NavInferior'
import { AtivarNotificacoes } from '@/components/AtivarNotificacoes'
import { InstalarApp } from '@/components/InstalarApp'
import { AvisoDataTeste } from '@/components/AvisoDataTeste'
import { Chevron } from '@/components/Icones'
import { sair } from '@/app/acoes'
import { Preferencias } from './Preferencias'
import { FerramentasTeste } from './FerramentasTeste'

export const metadata = { title: 'Você · Guia do Advento' }

export default async function Voce() {
  const { perfil, hoje, user } = await exigirSessao()
  return (
    <>
      <main className="tela">
        <AvisoDataTeste data={hoje.data} simulada={hoje.simulada} />
        <h1 className="font-titulo" style={{ fontSize: 34, fontWeight: 500, lineHeight: 1.1, letterSpacing: '-0.015em' }}>
          Você
        </h1>
        <p className="mt-1.5" style={{ fontSize: 14, color: 'var(--text-2)' }}>
          {user.email}
        </p>

        <Preferencias nome={perfil.nome || ''} tema={perfil.tema} hora={perfil.lembrete_hora.slice(0, 5)} lembreteAtivo={perfil.lembrete_ativo} />

        <Secao id="lembrete" titulo="Notificações neste aparelho">
          <AtivarNotificacoes mostrarTeste />
        </Secao>

        <Secao id="instalar" titulo="Instalar na tela inicial">
          <InstalarApp />
        </Secao>

        <Secao titulo="Seu plano">
          <div className="flex items-center justify-between">
            <span>
              <span className="block" style={{ fontSize: 15, fontWeight: 600 }}>
                {perfil.plano === 'completo' ? 'Completo' : 'Simples'}
              </span>
              <span className="block" style={{ fontSize: 13, color: 'var(--text-2)' }}>
                {perfil.plano === 'completo' ? 'Textos, áudios, missões e grupo' : 'Textos, missões, coroa e retrospectivas'}
              </span>
            </span>
            {perfil.plano !== 'completo' && (
              <NextLink href="/upgrade" className="botao-secundario">
                Upgrade
              </NextLink>
            )}
          </div>
        </Secao>

        {MODO_TESTE && (
          <Secao id="teste" titulo="Ferramentas de teste">
            <FerramentasTeste data={hoje.simulada ? hoje.data : ''} plano={perfil.plano} />
            <NextLink href="/painel" className="mt-3 flex min-h-11 items-center justify-between no-underline" style={{ fontSize: 14, color: 'var(--text)' }}>
              Painel de métricas
              <Chevron />
            </NextLink>
          </Secao>
        )}

        <form action={sair} className="mt-6">
          <button className="botao-secundario w-full">Sair da conta</button>
        </form>
      </main>
      <NavInferior />
    </>
  )
}

function Secao({ id, titulo, children }: { id?: string; titulo: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mt-6 scroll-mt-6" aria-labelledby={id ? `t-${id}` : undefined}>
      <h2 id={id ? `t-${id}` : undefined} className="sobrancelha">
        {titulo}
      </h2>
      <div className="cartao mt-2.5 p-4">{children}</div>
    </section>
  )
}
