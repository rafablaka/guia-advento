import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { contexto, meuGrupo, meuProgresso } from '@/lib/sessao'
import { idValido, montarRetrospectiva } from '@/lib/retrospectiva'
import { diasParaComecar } from '@/lib/calendario'

export const runtime = 'nodejs'

const COR = { bg: '#1B1224', surface: '#251A30', text: '#F7EEDC', text2: '#C9BBCF', text3: '#9D8FA8', quote: '#F3E6C9', gold: '#E1B65A', track: 'rgba(247,238,220,0.16)', borda: 'rgba(247,238,220,0.12)' }

const fonte = (nome: string) => readFile(path.join(process.cwd(), 'assets', 'fonts', nome))

async function fontes() {
  const [f500, f600, fit, d400, d600] = await Promise.all([
    fonte('fraunces-500.ttf'),
    fonte('fraunces-600.ttf'),
    fonte('fraunces-italico.ttf'),
    fonte('dmsans-400.ttf'),
    fonte('dmsans-600.ttf'),
  ])
  return [
    { name: 'Fraunces', data: f500, weight: 500 as const, style: 'normal' as const },
    { name: 'Fraunces', data: f600, weight: 600 as const, style: 'normal' as const },
    { name: 'Fraunces', data: fit, weight: 400 as const, style: 'italic' as const },
    { name: 'DM Sans', data: d400, weight: 400 as const, style: 'normal' as const },
    { name: 'DM Sans', data: d600, weight: 600 as const, style: 'normal' as const },
  ]
}

async function coroa(velas: number) {
  const svg = await readFile(path.join(process.cwd(), 'public', 'illustrations', `coroa-${Math.max(0, Math.min(4, velas))}.svg`))
  return `data:image/svg+xml;base64,${svg.toString('base64')}`
}

function Estrela({ t = 40 }: { t?: number }) {
  return (
    <svg width={t} height={t} viewBox="0 0 24 24">
      <path d="M12 1.5c.7 5 1.8 6.1 6.8 6.8-5 .7-6.1 1.8-6.8 6.8-.7-5-1.8-6.1-6.8-6.8 5-.7 6.1-1.8 6.8-6.8z" fill={COR.gold} />
    </svg>
  )
}

function Rodape({ host }: { host: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <Estrela />
        <span style={{ fontFamily: 'Fraunces', fontSize: 48, fontWeight: 500 }}>Guia do Advento</span>
      </div>
      <span style={{ fontSize: 30, color: COR.text3 }}>{host}</span>
    </div>
  )
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const tipo = url.searchParams.get('tipo') || 'convite'
  const host = url.host
  const { user, perfil, hoje, dia } = await contexto()
  if (!user || !perfil) return new Response('Faça login', { status: 401 })
  const opcoes = { width: 1080, height: 1920, fonts: await fontes() }

  if (tipo === 'convite') {
    const grupo = url.searchParams.get('grupo')?.slice(0, 60)
    const faltam = diasParaComecar(hoje.data)
    return new ImageResponse(
      (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: '140px 96px 110px', background: COR.bg, color: COR.text, fontFamily: 'DM Sans' }}>
          <span style={{ fontSize: 34, fontWeight: 600, letterSpacing: 4, color: COR.gold }}>
            {faltam > 0 ? `FALTAM ${faltam} DIAS PARA O ADVENTO` : '29 DE NOVEMBRO A 24 DE DEZEMBRO'}
          </span>
          <span style={{ fontFamily: 'Fraunces', fontStyle: 'italic', fontSize: 92, lineHeight: 1.18, marginTop: 40, color: COR.quote }}>
            {grupo ? `Vamos viver o Advento juntos no grupo “${grupo}”?` : 'Vou viver o Advento com o Guia. Vem comigo?'}
          </span>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 70 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={await coroa(0)} width={880} height={660} alt="" />
          </div>
          <span style={{ fontSize: 38, lineHeight: 1.45, color: COR.text2, marginTop: 40 }}>
            26 dias. Todo dia ouvir um santo, rezar e cumprir uma missão.
          </span>
          <Rodape host={host} />
        </div>
      ),
      opcoes,
    )
  }

  if (!idValido(tipo)) return new Response('Tipo inválido', { status: 400 })
  const grupo = tipo.startsWith('grupo-') ? await meuGrupo() : null
  const r = await montarRetrospectiva(tipo, { data: hoje.data, dia }, await meuProgresso(), perfil.plano, grupo)
  if (!r.disponivel) return new Response('Ainda não disponível', { status: 403 })

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: '120px 96px 110px', background: COR.bg, color: COR.text, fontFamily: 'DM Sans' }}>
        <div style={{ display: 'flex', gap: 12 }}>
          {r.segmentos.map((v, i) => (
            <div key={i} style={{ flex: 1, height: 8, borderRadius: 4, background: COR.track, display: 'flex' }}>
              <div style={{ width: `${v * 100}%`, height: 8, borderRadius: 4, background: COR.gold }} />
            </div>
          ))}
        </div>
        <span style={{ fontSize: 32, fontWeight: 600, letterSpacing: 4, color: COR.gold, marginTop: 90 }}>{r.sobrancelha.toUpperCase()}</span>
        <span style={{ fontFamily: 'Fraunces', fontSize: 92, fontWeight: 500, lineHeight: 1.08, marginTop: 24 }}>{r.titulo}</span>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 40 }}>
          <span style={{ fontFamily: 'Fraunces', fontSize: r.numero.length > 4 ? 190 : 260, fontWeight: 600, lineHeight: 1, color: COR.gold, letterSpacing: -8 }}>
            {r.numero}
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={await coroa(r.velas)} width={r.numero.length > 4 ? 320 : 380} height={r.numero.length > 4 ? 240 : 285} alt="" />
        </div>
        <span style={{ fontSize: 40, lineHeight: 1.45, color: COR.text2, marginTop: 20 }}>{r.legenda}</span>
        <div style={{ display: 'flex', gap: 28, marginTop: 50 }}>
          {r.cartoes.slice(0, 2).map((c) => (
            <div key={c.rotulo} style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '36px 40px', borderRadius: 52, background: COR.surface, border: `2px solid ${COR.borda}` }}>
              <span style={{ fontFamily: 'Fraunces', fontSize: 68, fontWeight: 600 }}>{c.valor}</span>
              <span style={{ fontSize: 34, color: COR.text2, marginTop: 6 }}>{c.rotulo}</span>
            </div>
          ))}
        </div>
        {r.frase && (
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 28, padding: '40px 46px', borderRadius: 52, background: COR.surface, border: `2px solid ${COR.borda}` }}>
            <span style={{ fontSize: 28, fontWeight: 600, letterSpacing: 3, color: COR.text3 }}>A FRASE QUE MAIS ME MARCOU</span>
            <span style={{ fontFamily: 'Fraunces', fontStyle: 'italic', fontSize: 52, lineHeight: 1.3, color: COR.quote, marginTop: 20 }}>“{r.frase.texto}”</span>
          </div>
        )}
        <Rodape host={host} />
      </div>
    ),
    opcoes,
  )
}
