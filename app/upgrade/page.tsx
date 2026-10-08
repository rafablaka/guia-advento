import NextLink from 'next/link'
import { exigirSessao } from '@/lib/sessao'
import { MODO_TESTE } from '@/lib/config'
import { Check, SetaVoltar } from '@/components/Icones'
import { BotaoPlanoTeste } from '@/app/voce/FerramentasTeste'

export const metadata = { title: 'Upgrade · Guia do Advento' }

export default async function Upgrade() {
  const { perfil } = await exigirSessao()
  return (
    <main className="tela-cheia">
      <NextLink href="/" aria-label="Voltar" className="botao-redondo">
        <SetaVoltar />
      </NextLink>
      <p className="sobrancelha mt-6">Plano Completo</p>
      <h1 className="font-titulo mt-1" style={{ fontSize: 32, fontWeight: 500, lineHeight: 1.1 }}>
        Ouça os santos e reze em grupo
      </h1>
      <ul className="mt-5 flex flex-col gap-2">
        {[
          ['Meditações narradas', 'O trecho do santo e a explicação do dia em áudio.'],
          ['Orações guiadas', 'Áudio com silêncio guiado, para rezar de olhos fechados.'],
          ['Coroa em grupo', 'Amigos, família ou paróquia: a coroa acende quando todos rezam.'],
          ['Tudo do Simples', 'Textos, missões, coroa, sequência e retrospectivas.'],
        ].map(([t, d]) => (
          <li key={t} className="cartao flex gap-3 px-4 py-3">
            <span className="mt-0.5">
              <Check />
            </span>
            <span>
              <span className="block" style={{ fontSize: 15, fontWeight: 600 }}>
                {t}
              </span>
              <span className="block" style={{ fontSize: 13, color: 'var(--text-2)' }}>
                {d}
              </span>
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-8">
        {perfil.plano === 'completo' ? (
          <p className="cartao p-4 text-center" style={{ fontSize: 15 }}>
            Você já tem o plano Completo.
          </p>
        ) : (
          <>
            <p className="mb-3 text-center" style={{ fontSize: 14, color: 'var(--text-2)' }}>
              Você paga só a diferença: <strong style={{ color: 'var(--text)' }}>R$ 27</strong>. Vale a qualquer momento, inclusive durante o Advento.
            </p>
            <p className="cartao p-4 text-center" style={{ fontSize: 13, color: 'var(--text-3)' }}>
              O checkout da Guru entra aqui quando a integração estiver pronta.
            </p>
            {MODO_TESTE && (
              <div className="mt-3">
                <BotaoPlanoTeste plano="completo" rotulo="Simular upgrade (modo de teste)" />
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
