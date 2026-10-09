import 'server-only'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { supabaseServidor } from '@/lib/supabase/servidor'
import { MODO_TESTE } from '@/lib/config'
import { dataEmSP, diaDaJornada, faseDaData, validarData } from '@/lib/calendario'
import { type LinhaProgresso, mapaProgresso } from '@/lib/progresso'

export type Perfil = {
  id: string
  email: string | null
  nome: string | null
  plano: 'simples' | 'completo'
  tema: 'sistema' | 'noite' | 'pergaminho'
  lembrete_hora: string
  lembrete_ativo: boolean
  modo: 'solo' | 'grupo' | null
  onboarding_ok: boolean
  inicio_data: string
  admin: boolean
}

export const COOKIE_DATA_TESTE = 'data_teste'

/** A data de "hoje": a real em São Paulo, ou a data simulada no modo de teste. */
export const hojeAtual = cache(async () => {
  if (MODO_TESTE) {
    const simulada = validarData((await cookies()).get(COOKIE_DATA_TESTE)?.value)
    if (simulada) return { data: simulada, simulada: true }
  }
  return { data: dataEmSP(), simulada: false }
})

export const contexto = cache(async () => {
  const supabase = await supabaseServidor()
  const [{ data: dadosLogin }, hoje] = await Promise.all([supabase.auth.getClaims(), hojeAtual()])
  const claims = dadosLogin?.claims
  const user = claims?.sub ? { id: claims.sub, email: (claims.email as string | undefined) ?? null } : null
  if (!user) return { supabase, user: null, perfil: null, hoje, dia: diaDaJornada(hoje.data), fase: faseDaData(hoje.data) }
  const { data: perfil } = await supabase.from('perfis').select('*').eq('id', user.id).single<Perfil>()
  return { supabase, user, perfil, hoje, dia: diaDaJornada(hoje.data), fase: faseDaData(hoje.data) }
})

/** Exige login (e, por padrão, o onboarding feito). */
export async function exigirSessao(opcoes: { onboarding?: boolean } = {}) {
  const ctx = await contexto()
  if (!ctx.user || !ctx.perfil) redirect('/entrar')
  if (opcoes.onboarding !== false && !ctx.perfil.onboarding_ok) redirect('/boas-vindas')
  return ctx as typeof ctx & { user: NonNullable<typeof ctx.user>; perfil: Perfil }
}

export const meuProgresso = cache(async () => {
  const { supabase, user } = await contexto()
  if (!user) return mapaProgresso([])
  const { data } = await supabase.from('progresso').select('*').eq('user_id', user.id)
  return mapaProgresso((data || []) as LinhaProgresso[])
})

export type MembroGrupo = { id: string; nome: string; eu: boolean; completos: number[] }
export type PainelGrupo = { id: string; nome: string; codigo: string; membros: MembroGrupo[] } | null

export const meuGrupo = cache(async (): Promise<PainelGrupo> => {
  const { supabase, user } = await contexto()
  if (!user) return null
  const { data } = await supabase.rpc('grupo_painel')
  return (data as PainelGrupo) ?? null
})

export function primeiroNome(perfil: Perfil | null) {
  return (perfil?.nome || '').trim().split(/\s+/)[0] || ''
}
