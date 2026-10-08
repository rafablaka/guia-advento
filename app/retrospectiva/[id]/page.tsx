import NextLink from 'next/link'
import { notFound } from 'next/navigation'
import { exigirSessao, meuGrupo, meuProgresso } from '@/lib/sessao'
import { dataPorExtenso } from '@/lib/calendario'
import { idValido, montarRetrospectiva } from '@/lib/retrospectiva'
import { LINK_COMPRA } from '@/lib/config'
import { Marca } from '@/components/Cabecalho'
import { Coroa } from '@/components/Coroa'
import { Fechar } from '@/components/Icones'
import { BotaoCompartilhar } from '@/components/BotaoCompartilhar'
import { AvisoDataTeste } from '@/components/AvisoDataTeste'
import { MarcarVista } from './MarcarVista'

export const metadata = { title: 'Retrospectiva · Guia do Advento' }

export default async function Retrospectiva({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!idValido(id)) notFound()
  const { perfil, hoje, dia, user } = await exigirSessao()
  const grupo = id.startsWith('grupo-') ? await meuGrupo() : null
  if (id.startsWith('grupo-') && !grupo) notFound()
  const r = await montarRetrospectiva(id, { data: hoje.data, dia }, await meuProgresso(), perfil.plano, grupo)
  const link = LINK_COMPRA || `/c?ref=${user.id.slice(0, 8)}`

  if (!r.disponivel)
    return (
      <main className="tela-cheia items-center justify-center text-center">
        <Coroa velas={r.velas} largura={220} />
        <h1 className="font-titulo mt-4" style={{ fontSize: 28, fontWeight: 500 }}>
          Ainda não chegou a hora
        </h1>
        <p className="mt-2" style={{ fontSize: 15, color: 'var(--text-2)' }}>
          Esta retrospectiva fica pronta em {dataPorExtenso(r.liberaEm)}.
        </p>
        <NextLink href="/" className="botao-secundario mt-6">
          Voltar ao início
        </NextLink>
      </main>
    )

  return (
    <main className="tela-cheia">
      <MarcarVista id={id} />
      <AvisoDataTeste data={hoje.data} simulada={hoje.simulada} />
      <div className="grid gap-[5px]" style={{ gridTemplateColumns: `repeat(${r.segmentos.length}, minmax(0, 1fr))` }} aria-hidden="true">
        {r.segmentos.map((v, i) => (
          <div
            key={i}
            style={{
              height: 3,
              borderRadius: 2,
              background: `linear-gradient(90deg, var(--accent) 0%, var(--accent) ${v * 100}%, var(--track) ${v * 100}%)`,
            }}
          />
        ))}
      </div>
      <div className="mt-3.5 flex h-10 items-center justify-between">
        <Marca tamanho={16} />
        <NextLink href="/" aria-label="Fechar" className="botao-redondo">
          <Fechar />
        </NextLink>
      </div>

      <p className="sobrancelha mt-[22px]" style={{ color: 'var(--gold)' }}>
        {r.sobrancelha}
      </p>
      <h1 className="font-titulo mt-2" style={{ fontWeight: 500, fontSize: 36, lineHeight: 1.08, letterSpacing: '-0.02em' }}>
        {r.titulo}
      </h1>

      <div className="mt-3.5 flex items-center justify-between gap-2">
        <div className="font-titulo" style={{ fontWeight: 600, fontSize: r.numero.length > 4 ? 84 : 104, lineHeight: 1, letterSpacing: '-0.04em', color: 'var(--gold)' }}>
          {r.numero}
        </div>
        <Coroa velas={r.velas} largura={156} />
      </div>
      <p className="mt-1.5" style={{ fontSize: 15, lineHeight: 1.45, color: 'var(--text-2)' }}>
        {r.legenda}
      </p>

      <div className="mt-[18px] grid grid-cols-2 gap-2.5">
        {r.cartoes.map((c) => (
          <div key={c.rotulo} className="cartao px-4 py-3.5">
            <div className="font-titulo" style={{ fontSize: 26, fontWeight: 600, lineHeight: 1.15 }}>
              {c.valor}
            </div>
            <div className="mt-0.5" style={{ fontSize: 13, color: 'var(--text-2)' }}>
              {c.rotulo}
            </div>
          </div>
        ))}
      </div>
      {r.extraCompleto && (
        <NextLink href="/upgrade" className="mt-2 block text-center no-underline" style={{ fontSize: 13, color: 'var(--text-3)' }}>
          + {r.extraCompleto}
        </NextLink>
      )}

      {!r.grupo && (
        <div className="cartao mt-2.5 px-[18px] py-4">
          <div className="sobrancelha" style={{ fontSize: 11 }}>
            {r.frases.length > 1 && r.id === 'final' ? 'As frases que mais te marcaram' : 'A frase que mais te marcou'}
          </div>
          {r.frase ? (
            (r.id === 'final' ? r.frases : [r.frase]).map((f, i) => (
              <div key={i} className={i ? 'mt-3' : ''}>
                <p className="font-titulo mt-2" style={{ fontStyle: 'italic', fontSize: 20, lineHeight: 1.35, color: 'var(--quote)' }}>
                  “{f.texto}”
                </p>
                {f.autor && (
                  <p className="mt-1.5" style={{ fontSize: 12.5, color: 'var(--text-3)' }}>
                    {f.autor}
                  </p>
                )}
              </div>
            ))
          ) : (
            <p className="mt-2" style={{ fontSize: 14, color: 'var(--text-2)' }}>
              Ao fechar o dia à noite, escolha uma frase. Ela aparece aqui.
            </p>
          )}
        </div>
      )}

      {r.convite && (
        <p className="font-titulo mt-4 text-center" style={{ fontSize: 18, fontStyle: 'italic', color: 'var(--quote)' }}>
          {r.convite}
        </p>
      )}

      <div className="mt-4">
        <BotaoCompartilhar arte={`/api/arte?tipo=${r.id}`} texto={r.titulo} link={link} tipo={`retro_${r.id}`} />
      </div>
      <NextLink href="/" className="mt-3 self-center py-3 no-underline" style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-2)' }}>
        Continuar
      </NextLink>
    </main>
  )
}
