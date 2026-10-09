import { TOTAL_DIAS, diasDaSemana } from '@/lib/calendario'

export type LinhaProgresso = {
  dia: number
  ouvir_em: string | null
  rezar_em: string | null
  agir_em: string | null
  fechar_em: string | null
  completo_no_dia: number | null
  missao: 'sim' | 'em_parte' | 'nao' | null
  frase: string | null
  frase_autor: string | null
  oracao_seg: number
}

export type EstadoPorta = 'concluida' | 'hoje' | 'recuperar' | 'futura'

export function mapaProgresso(linhas: LinhaProgresso[]) {
  return new Map(linhas.map((l) => [l.dia, l]))
}

export function diaCompleto(l?: LinhaProgresso | null) {
  return !!l && l.completo_no_dia != null
}

/** Conta para a sequência se foi completado até o fim do dia seguinte. */
function valeParaSequencia(l: LinhaProgresso | undefined, dia: number) {
  return !!l && l.completo_no_dia != null && l.completo_no_dia <= dia + 1
}

export function sequenciaAtual(mapa: Map<number, LinhaProgresso>, hoje: number) {
  let d = Math.min(hoje, TOTAL_DIAS)
  if (d < 1) return 0
  // Hoje ainda está em andamento e ontem ainda pode ser recuperado: nenhum dos dois quebra a sequência.
  if (!valeParaSequencia(mapa.get(d), d)) d--
  if (d >= 1 && d === hoje - 1 && !valeParaSequencia(mapa.get(d), d)) d--
  let n = 0
  while (d >= 1 && valeParaSequencia(mapa.get(d), d)) {
    n++
    d--
  }
  return n
}

export function maiorSequencia(mapa: Map<number, LinhaProgresso>, hoje: number) {
  let melhor = 0
  let atual = 0
  for (let d = 1; d <= Math.min(hoje, TOTAL_DIAS); d++) {
    if (valeParaSequencia(mapa.get(d), d)) {
      atual++
      melhor = Math.max(melhor, atual)
    } else if (d < hoje) {
      atual = 0
    }
  }
  return melhor
}

export function estadoDaPorta(mapa: Map<number, LinhaProgresso>, dia: number, hoje: number): EstadoPorta {
  if (diaCompleto(mapa.get(dia))) return 'concluida'
  if (dia > hoje) return 'futura'
  if (dia === hoje) return 'hoje'
  return 'recuperar'
}

export function diasParaRecuperar(mapa: Map<number, LinhaProgresso>, hoje: number) {
  const lista: number[] = []
  for (let d = 1; d < Math.min(hoje, TOTAL_DIAS + 1); d++) if (!diaCompleto(mapa.get(d))) lista.push(d)
  return lista
}

export type Resumo = {
  diasRezados: number
  total: number
  missoes: number
  minutos: number
  frase: { texto: string; autor: string | null } | null
  frases: { texto: string; autor: string | null }[]
}

export function resumoDosDias(mapa: Map<number, LinhaProgresso>, dias: number[]): Resumo {
  const linhas = dias.map((d) => mapa.get(d)).filter(Boolean) as LinhaProgresso[]
  const comFrase = linhas
    .filter((l) => l.frase)
    .sort((a, b) => (b.fechar_em || '').localeCompare(a.fechar_em || ''))
    .map((l) => ({ texto: l.frase as string, autor: l.frase_autor }))
  return {
    diasRezados: linhas.filter((l) => l.completo_no_dia != null).length,
    total: dias.length,
    missoes: linhas.filter((l) => l.agir_em && l.missao !== 'nao').length,
    minutos: Math.round(linhas.reduce((s, l) => s + (l.oracao_seg || 0), 0) / 60),
    frase: comFrase[0] ?? null,
    frases: comFrase,
  }
}

export function resumoDaSemana(mapa: Map<number, LinhaProgresso>, semana: number) {
  return resumoDosDias(mapa, diasDaSemana(semana))
}
