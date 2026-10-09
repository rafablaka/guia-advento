import 'server-only'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { dataDoDia } from '@/lib/calendario'

export type Antifona = { latim: string; texto: string }

export type ConteudoDia = {
  dia: number
  data: string
  tipo: 'comum' | 'domingo' | 'solenidade' | 'antifona' | 'vespera'
  semana: number
  santo: { nome: string; titulo: string; retrato: string | null }
  titulo: string
  citacao: { texto: string; autor: string }
  ouvir: { slides: string[]; audio: string | null; duracao_seg: number | null }
  rezar: { texto: string; audio: string | null; duracao_seg: number | null }
  agir: { missao: string }
  ilustracao: { arquivo: string; credito: string; alt?: string } | null
  antifona: Antifona | null
  frases?: { texto: string; autor: string }[]
}

const cache = new Map<number, ConteudoDia | null>()

/** Lê o conteúdo do dia. Devolve null se o arquivo ainda não chegou. */
export async function carregarDia(n: number): Promise<ConteudoDia | null> {
  if (cache.has(n)) return cache.get(n)!
  const arquivo = path.join(process.cwd(), 'content', 'dias', `${dataDoDia(n)}.json`)
  try {
    const dados = JSON.parse(await readFile(arquivo, 'utf8')) as ConteudoDia
    cache.set(n, dados)
    return dados
  } catch {
    cache.set(n, null)
    return null
  }
}

export function iniciais(nome: string) {
  const partes = nome
    .replace(/\[[^\]]*\]\s*/g, '')
    .split(/\s+/)
    .filter((p) => p.length > 2 && !['de', 'da', 'do', 'dos', 'das'].includes(p.toLowerCase()))
  return ((partes[0]?.[0] || '') + (partes[1]?.[0] || '')).toUpperCase() || '✦'
}

/** Frases que o usuário pode escolher no Fechar. */
export function frasesDoDia(c: ConteudoDia) {
  if (c.frases?.length) return c.frases
  const lista = [{ texto: c.citacao.texto, autor: c.citacao.autor }]
  if (c.antifona) lista.push({ texto: c.antifona.texto, autor: c.antifona.latim })
  return lista
}

/** Minutos estimados do dia, para o botão "Abrir a porta de hoje". */
export function minutosDoDia(c: ConteudoDia | null) {
  if (!c) return 7
  const seg = (c.ouvir.duracao_seg || 150) + (c.rezar.duracao_seg || 240)
  return Math.max(5, Math.round(seg / 60))
}
