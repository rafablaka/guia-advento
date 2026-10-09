'use client'
import { useEffect, useRef, useState } from 'react'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import type { ConteudoDia } from '@/lib/conteudo'
import type { LinhaProgresso } from '@/lib/progresso'
import { fecharDia, marcarEtapa } from '@/app/acoes'
import { Player } from '@/components/Player'
import { Coroa } from '@/components/Coroa'
import { Chama, Check, Fechar, Seta } from '@/components/Icones'
import { Stories } from './Stories'

type Etapa = 'ouvir' | 'rezar' | 'agir' | 'feito' | 'fechar'
const ROTULOS = { ouvir: 'Ouvir', rezar: 'Rezar', agir: 'Agir' } as const

export function Ritual(p: {
  conteudo: ConteudoDia
  iniciais: string
  linha: LinhaProgresso | null
  bloqueado: boolean
  hoje: number
  frases: { texto: string; autor: string }[]
  letrasReveladas: string[]
  velas: number
  sequencia: number
  recuperando: boolean
}) {
  const c = p.conteudo
  const router = useRouter()
  const [feitos, setFeitos] = useState({ ouvir: !!p.linha?.ouvir_em, rezar: !!p.linha?.rezar_em, agir: !!p.linha?.agir_em })
  const [fechado, setFechado] = useState(!!p.linha?.fechar_em)
  const [etapa, setEtapa] = useState<Etapa>(() => (!feitos.ouvir ? 'ouvir' : !feitos.rezar ? 'rezar' : !feitos.agir ? 'agir' : 'feito'))
  const [stories, setStories] = useState(false)
  const [salvando] = useState(false)
  const [erro, setErro] = useState('')
  const [acabouDeCompletar, setAcabouDeCompletar] = useState(false)
  const ouvido = useRef(0)
  const inicioRezar = useRef(0)
  const rezadoAudio = useRef(0)

  useEffect(() => {
    if (window.location.hash === '#fechar' && feitos.ouvir && feitos.rezar && feitos.agir) setEtapa('fechar')
  }, [feitos])

  useEffect(() => {
    if (etapa === 'rezar') inicioRezar.current = Date.now()
    window.scrollTo({ top: 0 })
  }, [etapa])

  // Avança na hora e salva em segundo plano; se falhar, volta e avisa
  async function concluir(e: 'ouvir' | 'rezar' | 'agir', segundos = 0) {
    const antes = feitos
    const novos = { ...feitos, [e]: true }
    setErro('')
    setFeitos(novos)
    const vaiCompletar = novos.ouvir && novos.rezar && novos.agir && !(antes.ouvir && antes.rezar && antes.agir)
    if (vaiCompletar) setAcabouDeCompletar(true)
    setEtapa(!novos.ouvir ? 'ouvir' : !novos.rezar ? 'rezar' : !novos.agir ? 'agir' : 'feito')
    const r = await marcarEtapa(c.dia, e, segundos).catch(() => ({ ok: false }) as const)
    if (!r.ok) {
      setFeitos(antes)
      setEtapa(e)
      setErro('Não conseguimos salvar. Confira a internet e tente de novo.')
      return
    }
    router.refresh()
  }

  const completo = feitos.ouvir && feitos.rezar && feitos.agir

  return (
    <main className="tela-cheia" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 110px)' }}>
      {/* Progresso do dia: Ouvir, Rezar, Agir */}
      <div>
        <div className="grid grid-cols-3 gap-1.5" aria-hidden="true">
          {(['ouvir', 'rezar', 'agir'] as const).map((k) => (
            <div
              key={k}
              style={{
                height: 3,
                borderRadius: 2,
                background: feitos[k] ? 'var(--accent)' : etapa === k ? 'color-mix(in srgb, var(--accent) 45%, var(--track))' : 'var(--track)',
              }}
            />
          ))}
        </div>
        <ol className="mt-2 grid grid-cols-3 gap-1.5" style={{ fontSize: 11 }} aria-label="Etapas do dia">
          {(['ouvir', 'rezar', 'agir'] as const).map((k) => (
            <li key={k}>
              <button
                type="button"
                onClick={() => setEtapa(k)}
                className="flex min-h-6 items-center gap-1 border-0 bg-transparent p-0"
                aria-current={etapa === k ? 'step' : undefined}
                style={{ fontWeight: etapa === k ? 600 : 400, color: etapa === k ? 'var(--text)' : 'var(--text-3)' }}
              >
                {ROTULOS[k]}
                {feitos[k] && <span className="sr-only">(feito)</span>}
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-3.5 flex items-center gap-3">
        <div
          className="font-titulo flex shrink-0 items-center justify-center rounded-full"
          style={{ width: 42, height: 42, boxSizing: 'border-box', fontSize: 15, fontWeight: 500, color: '#F3E6C9', background: '#553070', border: '2px solid #D9A742' }}
          aria-hidden="true"
        >
          {p.iniciais}
        </div>
        <div className="min-w-0 flex-1">
          <div style={{ fontSize: 15, fontWeight: 600 }}>{c.santo.nome}</div>
          <div className="mt-0.5" style={{ fontSize: 12.5, color: 'var(--text-2)' }}>
            {c.santo.titulo} · Dia {c.dia} de 26{p.recuperando ? ' · recuperando' : ''}
          </div>
        </div>
        <NextLink href="/" aria-label="Fechar" className="botao-redondo">
          <Fechar />
        </NextLink>
      </div>

      <div className="aparecer flex flex-1 flex-col" key={etapa}>
        {etapa === 'ouvir' && (
          <>
            {c.antifona ? (
              <Antifona antifona={c.antifona} letras={p.letrasReveladas} />
            ) : (
              c.ilustracao && (
                <figure className="mt-3.5 flex flex-col items-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/illustrations/${c.ilustracao.arquivo}`}
                    alt={c.ilustracao.alt || c.ilustracao.credito}
                    width={300}
                    height={258}
                    style={{ display: 'block', width: 300, maxWidth: '100%', height: 'auto' }}
                  />
                  <figcaption className="mt-2" style={{ fontSize: 12, color: 'var(--text-3)' }}>
                    {c.ilustracao.credito}
                  </figcaption>
                </figure>
              )
            )}
            <h1 className="font-titulo mt-4" style={{ fontWeight: 500, fontSize: 30, lineHeight: 1.12, letterSpacing: '-0.015em' }}>
              {c.titulo}
            </h1>
            <Citacao texto={c.citacao.texto} autor={c.citacao.autor} />
            <button
              type="button"
              onClick={() => setStories(true)}
              className="cartao mt-4 flex min-h-14 w-full items-center justify-between px-4 text-left"
              style={{ color: 'var(--text)' }}
            >
              <span>
                <span className="block" style={{ fontSize: 15, fontWeight: 600 }}>
                  Ler a meditação
                </span>
                <span className="block" style={{ fontSize: 12.5, color: 'var(--text-2)' }}>
                  {c.ouvir.slides.length} telas · trecho do santo e explicação
                </span>
              </span>
              <span style={{ color: 'var(--accent)' }} aria-hidden="true">
                ›
              </span>
            </button>
            <div className="mt-2.5">
              <Player
                src={c.ouvir.audio}
                duracao={c.ouvir.duracao_seg}
                rotulo="Meditação em áudio"
                bloqueado={p.bloqueado}
                onOuvido={(s) => (ouvido.current = s)}
              />
            </div>
            <BotaoAvancar
              rotulo="Seguir para a oração"
              ocupado={salvando || stories}
              onVoltar={null}
              onAvancar={() => (feitos.ouvir ? setEtapa('rezar') : concluir('ouvir', ouvido.current))}
            />
          </>
        )}

        {etapa === 'rezar' && (
          <>
            <p className="sobrancelha mt-6" style={{ color: 'var(--accent)' }}>
              Rezar
            </p>
            <h1 className="font-titulo mt-2" style={{ fontWeight: 500, fontSize: 30, lineHeight: 1.12 }}>
              Oração guiada
            </h1>
            <p className="mt-2" style={{ fontSize: 14, color: 'var(--text-2)' }}>
              {p.bloqueado ? 'Reze devagar, com o texto. Faça pausas de silêncio.' : 'Dê o play, feche os olhos e acompanhe. Os silêncios fazem parte da oração.'}
            </p>
            <div className="mt-4">
              <Player
                src={c.rezar.audio}
                duracao={c.rezar.duracao_seg}
                rotulo="Oração guiada"
                bloqueado={p.bloqueado}
                onOuvido={(s) => (rezadoAudio.current = s)}
              />
            </div>
            <p
              className="font-titulo mt-5 whitespace-pre-line"
              style={{ fontStyle: 'italic', fontSize: 20, lineHeight: 1.45, color: 'var(--quote)' }}
            >
              {c.rezar.texto}
            </p>
            <BotaoAvancar
              rotulo={feitos.rezar ? 'Seguir para a missão' : 'Finalizar a oração'}
              ocupado={salvando}
              onVoltar={() => setEtapa('ouvir')}
              onAvancar={() => {
                if (feitos.rezar) return setEtapa('agir')
                const tempoNaTela = (Date.now() - inicioRezar.current) / 1000
                concluir('rezar', Math.max(rezadoAudio.current, Math.min(tempoNaTela, 15 * 60)))
              }}
            />
          </>
        )}

        {etapa === 'agir' && (
          <>
            <p className="sobrancelha mt-6" style={{ color: 'var(--accent)' }}>
              Agir
            </p>
            <h1 className="font-titulo mt-2" style={{ fontWeight: 500, fontSize: 30, lineHeight: 1.12 }}>
              Sua missão de hoje
            </h1>
            <div className="cartao mt-5 p-5">
              <p className="font-titulo" style={{ fontSize: 22, lineHeight: 1.35, fontWeight: 500 }}>
                {c.agir.missao}
              </p>
            </div>
            <p className="mt-3" style={{ fontSize: 14, color: 'var(--text-2)' }}>
              Cumpra ao longo do dia. Quando fizer, volte aqui e marque.
            </p>
            <div className="mt-auto flex flex-col gap-2 pt-8">
              <button type="button" className="botao-principal" disabled={salvando || feitos.agir} onClick={() => concluir('agir')}>
                <Check cor="#FFFFFF" />
                {feitos.agir ? 'Missão cumprida' : 'Cumpri a missão'}
              </button>
              {!feitos.agir && (
                <NextLink href="/" className="botao-secundario w-full">
                  Vou cumprir ao longo do dia
                </NextLink>
              )}
            </div>
          </>
        )}

        {etapa === 'feito' && (
          <div className="flex flex-1 flex-col items-center pt-6 text-center">
            <Coroa velas={p.velas} largura={260} />
            <p className="sobrancelha mt-4" style={{ color: 'var(--accent)' }}>
              Dia {c.dia} completo
            </p>
            <h1 className="font-titulo mt-2" style={{ fontWeight: 500, fontSize: 30, lineHeight: 1.12 }}>
              {acabouDeCompletar ? 'Você abriu mais uma porta' : 'Esta porta já está aberta'}
            </h1>
            {p.sequencia > 0 && (
              <p className="mt-3 flex items-center gap-1.5" style={{ fontSize: 15, color: 'var(--text-2)' }}>
                <Chama /> {p.sequencia} {p.sequencia === 1 ? 'dia seguido' : 'dias seguidos'}
              </p>
            )}
            <div className="mt-auto flex w-full flex-col gap-2 pt-8">
              {!fechado ? (
                <button type="button" className="botao-principal" onClick={() => setEtapa('fechar')}>
                  Fechar o dia
                </button>
              ) : (
                <p className="cartao p-3" style={{ fontSize: 14, color: 'var(--text-2)' }}>
                  Dia fechado. Boa noite.
                </p>
              )}
              <NextLink href="/" className="botao-secundario w-full">
                Voltar ao início
              </NextLink>
            </div>
          </div>
        )}

        {etapa === 'fechar' && (
          <FecharDia
            dia={c.dia}
            frases={p.frases}
            missaoInicial={p.linha?.missao ?? null}
            fraseInicial={p.linha?.frase ?? null}
            onFeito={() => {
              setFechado(true)
              router.push('/')
              router.refresh()
            }}
          />
        )}
      </div>

      {erro && (
        <p role="alert" className="cartao fixed left-6 right-6 z-30 p-3 text-center" style={{ top: 'calc(env(safe-area-inset-top, 0px) + 16px)', fontSize: 14, color: 'var(--erro)' }}>
          {erro}
        </p>
      )}
      {stories && (
        <Stories
          slides={c.ouvir.slides}
          titulo={c.titulo}
          santo={c.santo.nome}
          onFechar={() => setStories(false)}
          onFim={() => {
            setStories(false)
            if (!feitos.ouvir) concluir('ouvir', ouvido.current)
            else setEtapa('rezar')
          }}
        />
      )}
      {completo && etapa !== 'feito' && etapa !== 'fechar' && (
        <span className="sr-only" role="status">
          Este dia já está completo.
        </span>
      )}
    </main>
  )
}

function Citacao({ texto, autor }: { texto: string; autor: string }) {
  return (
    <div className="mt-3 flex gap-2.5">
      <span aria-hidden="true" className="font-titulo" style={{ fontSize: 46, lineHeight: 0.85, color: 'var(--gold)' }}>
        “
      </span>
      <div>
        <p className="font-titulo" style={{ margin: 0, fontStyle: 'italic', fontSize: 19, lineHeight: 1.4, color: 'var(--quote)' }}>
          {texto}
        </p>
        <p className="mt-1.5" style={{ fontSize: 12.5, color: 'var(--text-3)' }}>
          {autor}
        </p>
      </div>
    </div>
  )
}

function Antifona({ antifona, letras }: { antifona: NonNullable<ConteudoDia['antifona']>; letras: string[] }) {
  const todas = ['S', 'A', 'R', 'C', 'O', 'R', 'E']
  const completa = letras.length === 7
  return (
    <section className="mt-4 flex flex-col items-center text-center" aria-label="Antífonas do Ó">
      <p className="sobrancelha">Antífonas do Ó</p>
      <div
        className="font-titulo mt-3 flex items-center justify-center rounded-full"
        style={{ width: 120, height: 120, fontSize: 64, fontWeight: 600, color: 'var(--gold)', border: '1.5px solid var(--gold-borda)' }}
        aria-label={`Letra de hoje: ${antifona.letra}`}
      >
        {antifona.letra}
      </div>
      <p className="font-titulo mt-3" style={{ fontSize: 22, fontStyle: 'italic', color: 'var(--quote)' }}>
        {antifona.latim}
      </p>
      <p className="mt-1" style={{ fontSize: 14, color: 'var(--text-2)' }}>
        {antifona.texto}
      </p>
      <div className="mt-4 flex gap-1.5" aria-label={`Letras reveladas: ${letras.join(' ')}`}>
        {todas.map((l, i) => (
          <span
            key={i}
            className="porta font-titulo flex items-center justify-center"
            style={{
              width: 34,
              height: 44,
              fontSize: 18,
              fontWeight: 600,
              color: i < letras.length ? 'var(--gold)' : 'transparent',
              border: i < letras.length ? '1px solid var(--gold-borda)' : '1px solid var(--border-forte)',
            }}
          >
            {i < letras.length ? l : '·'}
          </span>
        ))}
      </div>
      <p className="mt-2" style={{ fontSize: 13, color: 'var(--text-3)' }}>
        {completa ? (
          <>
            De trás para frente: <strong style={{ color: 'var(--gold)' }}>ERO CRAS</strong>, “amanhã estarei aí”.
          </>
        ) : (
          'Uma letra por dia, até 23 de dezembro.'
        )}
      </p>
    </section>
  )
}

function BotaoAvancar({
  rotulo,
  onAvancar,
  onVoltar,
  ocupado,
}: {
  rotulo: string
  onAvancar: () => void
  onVoltar: (() => void) | null
  ocupado: boolean
}) {
  // Como nos stories: arrastar para a esquerda avança, para a direita volta
  useEffect(() => {
    let x0 = 0
    let y0 = 0
    const comecar = (e: TouchEvent) => {
      x0 = e.touches[0].clientX
      y0 = e.touches[0].clientY
    }
    const terminar = (e: TouchEvent) => {
      if (ocupado) return
      const dx = e.changedTouches[0].clientX - x0
      const dy = Math.abs(e.changedTouches[0].clientY - y0)
      if (Math.abs(dx) < 70 || dy > 60) return
      if (dx < 0) onAvancar()
      else onVoltar?.()
    }
    window.addEventListener('touchstart', comecar, { passive: true })
    window.addEventListener('touchend', terminar, { passive: true })
    return () => {
      window.removeEventListener('touchstart', comecar)
      window.removeEventListener('touchend', terminar)
    }
  }, [onAvancar, onVoltar, ocupado])

  return (
    <div className="fixed left-0 right-0 z-20 flex justify-center px-6" style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)' }}>
      <button type="button" className="botao-principal" style={{ maxWidth: 432 }} onClick={onAvancar} disabled={ocupado}>
        {rotulo}
        <Seta />
      </button>
    </div>
  )
}

function FecharDia(p: {
  dia: number
  frases: { texto: string; autor: string }[]
  missaoInicial: 'sim' | 'em_parte' | 'nao' | null
  fraseInicial: string | null
  onFeito: () => void
}) {
  const [missao, setMissao] = useState(p.missaoInicial)
  const [frase, setFrase] = useState<number | null>(() => {
    const i = p.frases.findIndex((f) => f.texto === p.fraseInicial)
    return i >= 0 ? i : null
  })
  const [salvando, setSalvando] = useState(false)

  async function salvar() {
    if (!missao) return
    setSalvando(true)
    const f = frase !== null ? p.frases[frase] : null
    await fecharDia(p.dia, missao, f?.texto ?? null, f?.autor ?? null)
    p.onFeito()
  }

  const opcoes: { valor: 'sim' | 'em_parte' | 'nao'; rotulo: string }[] = [
    { valor: 'sim', rotulo: 'Sim' },
    { valor: 'em_parte', rotulo: 'Em parte' },
    { valor: 'nao', rotulo: 'Ainda não' },
  ]

  return (
    <div id="fechar">
      <p className="sobrancelha mt-6" style={{ color: 'var(--accent)' }}>
        Fechar o dia
      </p>
      <h1 className="font-titulo mt-2" style={{ fontWeight: 500, fontSize: 28, lineHeight: 1.15 }}>
        Você cumpriu a missão?
      </h1>
      <div className="mt-4 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Você cumpriu a missão?">
        {opcoes.map((o) => (
          <button
            key={o.valor}
            type="button"
            role="radio"
            aria-checked={missao === o.valor}
            onClick={() => setMissao(o.valor)}
            className="cartao min-h-12"
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: missao === o.valor ? 'var(--text)' : 'var(--text-2)',
              borderColor: missao === o.valor ? 'var(--accent)' : 'var(--border)',
            }}
          >
            {o.rotulo}
          </button>
        ))}
      </div>

      <h2 className="font-titulo mt-7" style={{ fontWeight: 500, fontSize: 22 }}>
        Que frase ficou com você?
      </h2>
      <div className="mt-3 flex flex-col gap-2" role="radiogroup" aria-label="Que frase ficou com você?">
        {p.frases.map((f, i) => (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={frase === i}
            onClick={() => setFrase(frase === i ? null : i)}
            className="cartao px-4 py-3 text-left"
            style={{ borderColor: frase === i ? 'var(--accent)' : 'var(--border)' }}
          >
            <span className="font-titulo block" style={{ fontStyle: 'italic', fontSize: 17, lineHeight: 1.35, color: 'var(--quote)' }}>
              “{f.texto}”
            </span>
            <span className="mt-1 block" style={{ fontSize: 12.5, color: 'var(--text-3)' }}>
              {f.autor}
            </span>
          </button>
        ))}
      </div>
      <button type="button" className="botao-principal mt-6" disabled={!missao || salvando} onClick={salvar}>
        {salvando ? <><span className="girando" aria-hidden="true" />Guardando…</> : 'Fechar o dia'}
      </button>
    </div>
  )
}
