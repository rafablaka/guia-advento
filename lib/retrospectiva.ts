import 'server-only'
import { NATAL, NOME_DA_VELA, RETRO_SEMANAL, TOTAL_DIAS, dataPorExtenso, diasDaSemana } from '@/lib/calendario'
import { maiorSequencia, resumoDosDias, type LinhaProgresso } from '@/lib/progresso'
import { carregarDia } from '@/lib/conteudo'
import type { PainelGrupo } from '@/lib/sessao'

export type Retrospectiva = {
  id: string
  disponivel: boolean
  liberaEm: string
  grupo: boolean
  sobrancelha: string
  titulo: string
  numero: string
  legenda: string
  velas: number
  segmentos: number[] // 0 a 1 por segmento
  cartoes: { valor: string; rotulo: string }[]
  frase: { texto: string; autor: string | null } | null
  frases: { texto: string; autor: string | null }[]
  extraCompleto: string | null
  convite: string | null
}

const TODOS = Array.from({ length: TOTAL_DIAS }, (_, i) => i + 1)

export function idValido(id: string) {
  return /^(grupo-)?([123]|final)$/.test(id)
}

async function minutosDeAudio(dias: number[]) {
  let s = 0
  for (const d of dias) {
    const c = await carregarDia(d)
    s += (c?.rezar.duracao_seg || 0) + (c?.ouvir.duracao_seg || 0)
  }
  return Math.max(1, Math.round(s / 60))
}

export async function montarRetrospectiva(
  id: string,
  hoje: { data: string; dia: number },
  progresso: Map<number, LinhaProgresso>,
  plano: 'simples' | 'completo',
  grupo: PainelGrupo,
): Promise<Retrospectiva> {
  const ehGrupo = id.startsWith('grupo-')
  const chave = id.replace('grupo-', '')
  const final = chave === 'final'
  const semana = final ? 0 : Number(chave)
  const liberaEm = final ? NATAL : RETRO_SEMANAL[semana as 1 | 2 | 3]
  const dias = final ? TODOS : diasDaSemana(semana)
  const base = {
    id,
    disponivel: hoje.data >= liberaEm,
    liberaEm,
    grupo: ehGrupo,
    sobrancelha: dataPorExtenso(liberaEm, true),
    velas: final ? 4 : semana,
    frase: null,
    frases: [],
    extraCompleto: null,
    convite: null,
  }

  if (ehGrupo) {
    const membros = grupo?.membros ?? []
    const aceso = (d: number) => membros.length > 0 && membros.every((m) => m.completos.includes(d))
    const acesos = dias.filter(aceso).length
    const rezadosPorTodos = membros.reduce((s, m) => s + m.completos.filter((d) => dias.includes(d)).length, 0)
    return {
      ...base,
      titulo: final ? `A jornada do grupo ${grupo?.nome ?? ''}` : `A ${semana}ª semana do grupo ${grupo?.nome ?? ''}`,
      numero: `${acesos}/${dias.length}`,
      legenda: `dias com a coroa do grupo acesa. Nosso grupo acendeu a coroa ${acesos} de ${dias.length} dias.`,
      segmentos: final ? [1, 2, 3, 4].map((s) => diasDaSemana(s).filter(aceso).length / diasDaSemana(s).length) : dias.map((d) => (aceso(d) ? 1 : 0)),
      cartoes: [
        { valor: String(membros.length), rotulo: membros.length === 1 ? 'pessoa no grupo' : 'pessoas no grupo' },
        { valor: String(rezadosPorTodos), rotulo: 'dias rezados, somando todos' },
      ],
    }
  }

  const r = resumoDosDias(progresso, dias)
  const extra = plano === 'simples' ? `${await minutosDeAudio(dias)} min de oração guiada em áudio no Completo` : null
  if (final) {
    return {
      ...base,
      titulo: 'Sua jornada do Advento',
      numero: `${r.diasRezados}/26`,
      legenda: r.diasRezados === 26 ? 'dias rezados. Você acendeu a coroa inteira.' : 'dias rezados nesta jornada.',
      segmentos: [1, 2, 3, 4].map((s) => resumoDosDias(progresso, diasDaSemana(s)).diasRezados / diasDaSemana(s).length),
      cartoes: [
        { valor: `${maiorSequencia(progresso, Math.min(hoje.dia, 27))}`, rotulo: 'dias seguidos, a maior sequência' },
        { valor: `${r.missoes}`, rotulo: 'missões cumpridas' },
        { valor: `${r.minutos} min`, rotulo: 'em oração' },
        { valor: `${r.frases.length}`, rotulo: r.frases.length === 1 ? 'frase guardada' : 'frases guardadas' },
      ],
      frase: r.frase,
      frases: r.frases.slice(0, 3),
      extraCompleto: extra,
      convite: '[RASCUNHO] Um convite para viver o Natal: texto final a definir.',
    }
  }
  return {
    ...base,
    titulo: `Sua ${semana}ª semana do Advento`,
    numero: `${r.diasRezados}/${r.total}`,
    legenda:
      r.diasRezados === r.total
        ? `dias rezados. A vela ${NOME_DA_VELA[semana]} ficou acesa a semana inteira.`
        : 'dias rezados nesta semana. Cada porta aberta conta.',
    segmentos: dias.map((d) => (progresso.get(d)?.completo_no_dia != null ? 1 : 0)),
    cartoes: [
      { valor: `${r.missoes} de ${r.total}`, rotulo: 'missões cumpridas' },
      { valor: `${r.minutos} min`, rotulo: 'em oração' },
    ],
    frase: r.frase,
    frases: r.frases,
    extraCompleto: extra,
  }
}
