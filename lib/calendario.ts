// Regras de calendário da jornada. Todas as datas são strings AAAA-MM-DD no fuso America/Sao_Paulo.

export const FUSO = 'America/Sao_Paulo'
export const INICIO = '2026-11-29'
export const TOTAL_DIAS = 26
export const NATAL = '2026-12-25'
export const DOMINGOS = ['2026-11-29', '2026-12-06', '2026-12-13', '2026-12-20']
export const RETRO_SEMANAL = { 1: '2026-12-06', 2: '2026-12-13', 3: '2026-12-20' } as const

const UM_DIA = 86_400_000

function utc(data: string) {
  const [a, m, d] = data.split('-').map(Number)
  return Date.UTC(a, m - 1, d)
}

export function somarDias(data: string, n: number) {
  return new Date(utc(data) + n * UM_DIA).toISOString().slice(0, 10)
}

export function diferencaDias(a: string, b: string) {
  return Math.round((utc(a) - utc(b)) / UM_DIA)
}

export function dataEmSP(agora = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: FUSO, year: 'numeric', month: '2-digit', day: '2-digit' }).format(agora)
}

export function horaEmSP(agora = new Date()) {
  return Number(new Intl.DateTimeFormat('en-GB', { timeZone: FUSO, hour: '2-digit', hour12: false }).format(agora))
}

/** Número do dia na jornada (1 = 29/11). Pode ser ≤ 0 (antes) ou > 26 (depois). */
export function diaDaJornada(data: string) {
  return diferencaDias(data, INICIO) + 1
}

export function dataDoDia(n: number) {
  return somarDias(INICIO, n - 1)
}

export function semanaDoDia(n: number) {
  if (n <= 7) return 1
  if (n <= 14) return 2
  if (n <= 21) return 3
  return 4
}

export function diasDaSemana(semana: number) {
  const inicio = (semana - 1) * 7 + 1
  const fim = Math.min(semana * 7, TOTAL_DIAS)
  return Array.from({ length: fim - inicio + 1 }, (_, i) => inicio + i)
}

export type Fase = 'espera' | 'jornada' | 'natal'

export function faseDaData(data: string): Fase {
  const n = diaDaJornada(data)
  if (n < 1) return 'espera'
  if (n <= TOTAL_DIAS) return 'jornada'
  return 'natal'
}

/** Velas acesas = domingos já alcançados (0 a 4). */
export function velasAcesas(data: string) {
  return DOMINGOS.filter((d) => d <= data).length
}

/** Semana Gaudete: 13 a 19/12, a interface ganha o acento rosa. */
export function ehGaudete(data: string) {
  return data >= '2026-12-13' && data <= '2026-12-19'
}

export function diasParaComecar(data: string) {
  return diferencaDias(INICIO, data)
}

const DIAS_SEMANA = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
const DIAS_CURTOS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']

export function diaDaSemana(data: string) {
  return new Date(utc(data)).getUTCDay()
}

export function nomeDiaSemana(data: string) {
  return DIAS_SEMANA[diaDaSemana(data)]
}

export function nomeCurto(data: string) {
  return DIAS_CURTOS[diaDaSemana(data)]
}

export function dataPorExtenso(data: string, comDiaSemana = false) {
  const [, m, d] = data.split('-').map(Number)
  const base = `${d} de ${MESES[m - 1]}`
  return comDiaSemana ? `${nomeDiaSemana(data).replace('-feira', '')}, ${base}` : base
}

export function dataCurta(data: string) {
  const [, m, d] = data.split('-').map(Number)
  return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}`
}

/** Subtítulo da tela inicial: "Domingo da Alegria · 3ª semana do Advento". */
export function subtituloDoDia(data: string) {
  const n = diaDaJornada(data)
  if (n < 1) return 'O Advento começa em 29 de novembro'
  if (n > TOTAL_DIAS) return 'Natal do Senhor'
  const semana = semanaDoDia(n)
  let nome = nomeDiaSemana(data)
  if (data === '2026-12-13') nome = 'Domingo da Alegria'
  else if (data === '2026-12-08') nome = 'Imaculada Conceição'
  else if (data === '2026-12-24') nome = 'Véspera de Natal'
  return `${nome} · ${semana}ª semana do Advento`
}

export const FRASE_DA_VELA: Record<number, string> = {
  0: 'A coroa espera a primeira vela',
  1: 'A vela da esperança foi acesa',
  2: 'A vela da paz foi acesa',
  3: 'A vela da alegria foi acesa',
  4: 'A vela do amor foi acesa',
}

export const NOME_DA_VELA: Record<number, string> = {
  1: 'da esperança',
  2: 'da paz',
  3: 'da alegria',
  4: 'do amor',
}

/** Retrospectivas liberadas na data: semanas 1–3 nos domingos seguintes e a final em 25/12. */
export function retrospectivasLiberadas(data: string) {
  const semanas = ([1, 2, 3] as const).filter((s) => data >= RETRO_SEMANAL[s])
  return { semanas: semanas as number[], final: data >= NATAL }
}

export function saudacao(hora: number) {
  if (hora < 5) return 'Boa noite'
  if (hora < 12) return 'Bom dia'
  if (hora < 18) return 'Boa tarde'
  return 'Boa noite'
}

/** Antífonas do Ó: 17 a 23/12, uma letra por dia. Lidas de trás para frente: ERO CRAS. */
export const ANTIFONAS = [
  { data: '2026-12-17', letra: 'S', latim: 'O Sapientia' },
  { data: '2026-12-18', letra: 'A', latim: 'O Adonai' },
  { data: '2026-12-19', letra: 'R', latim: 'O Radix' },
  { data: '2026-12-20', letra: 'C', latim: 'O Clavis' },
  { data: '2026-12-21', letra: 'O', latim: 'O Oriens' },
  { data: '2026-12-22', letra: 'R', latim: 'O Rex' },
  { data: '2026-12-23', letra: 'E', latim: 'O Emmanuel' },
]

export function validarData(valor: string | undefined | null) {
  return valor && /^\d{4}-\d{2}-\d{2}$/.test(valor) && !Number.isNaN(utc(valor)) ? valor : null
}
