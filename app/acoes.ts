'use server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { contexto, COOKIE_DATA_TESTE } from '@/lib/sessao'
import { MODO_TESTE } from '@/lib/config'
import { TOTAL_DIAS, validarData } from '@/lib/calendario'

type Etapa = 'ouvir' | 'rezar' | 'agir'

async function sessao() {
  const ctx = await contexto()
  if (!ctx.user) throw new Error('sem_sessao')
  return ctx as typeof ctx & { user: NonNullable<typeof ctx.user> }
}

/** Marca uma etapa do dia. Dias futuros continuam fechados. */
export async function marcarEtapa(dia: number, etapa: Etapa, segundos = 0) {
  const { supabase, user, dia: hoje } = await sessao()
  if (!Number.isInteger(dia) || dia < 1 || dia > TOTAL_DIAS || dia > hoje) return { ok: false, erro: 'porta_fechada' }
  const { data: atual } = await supabase.from('progresso').select('*').eq('user_id', user.id).eq('dia', dia).maybeSingle()
  const agora = new Date().toISOString()
  const linha = {
    user_id: user.id,
    dia,
    ouvir_em: atual?.ouvir_em ?? null,
    rezar_em: atual?.rezar_em ?? null,
    agir_em: atual?.agir_em ?? null,
    completo_no_dia: atual?.completo_no_dia ?? null,
    oracao_seg: atual?.oracao_seg ?? 0,
    atualizado_em: agora,
  }
  if (!linha[`${etapa}_em`]) linha[`${etapa}_em`] = agora
  if (etapa !== 'agir') linha.oracao_seg = Math.min(linha.oracao_seg + Math.max(0, Math.round(segundos)), 60 * 60)
  const completouAgora = !linha.completo_no_dia && linha.ouvir_em && linha.rezar_em && linha.agir_em
  if (completouAgora) linha.completo_no_dia = hoje
  const { error } = await supabase.from('progresso').upsert(linha)
  if (error) return { ok: false, erro: error.message }
  if (completouAgora) await supabase.from('eventos').insert({ user_id: user.id, tipo: 'dia_completo', dados: { dia, hoje } })
  revalidatePath('/', 'layout')
  return { ok: true, completo: !!linha.completo_no_dia, completouAgora: !!completouAgora }
}

export async function fecharDia(dia: number, missao: 'sim' | 'em_parte' | 'nao', frase: string | null, autor: string | null) {
  const { supabase, user, dia: hoje } = await sessao()
  if (dia < 1 || dia > TOTAL_DIAS || dia > hoje) return { ok: false }
  const { error } = await supabase.from('progresso').upsert({
    user_id: user.id,
    dia,
    missao,
    frase: frase?.slice(0, 400) ?? null,
    frase_autor: autor?.slice(0, 120) ?? null,
    fechar_em: new Date().toISOString(),
    atualizado_em: new Date().toISOString(),
  })
  revalidatePath('/', 'layout')
  return { ok: !error }
}

export async function salvarPerfil(campos: {
  nome?: string
  tema?: 'sistema' | 'noite' | 'pergaminho'
  lembrete_hora?: string
  lembrete_ativo?: boolean
  modo?: 'solo' | 'grupo'
  onboarding_ok?: boolean
}) {
  const { supabase, user } = await sessao()
  const limpo: Record<string, unknown> = {}
  if (campos.nome !== undefined) limpo.nome = campos.nome.trim().slice(0, 40)
  if (campos.tema && ['sistema', 'noite', 'pergaminho'].includes(campos.tema)) limpo.tema = campos.tema
  if (campos.lembrete_hora && /^\d{2}:\d{2}$/.test(campos.lembrete_hora)) limpo.lembrete_hora = campos.lembrete_hora
  if (campos.lembrete_ativo !== undefined) limpo.lembrete_ativo = campos.lembrete_ativo
  if (campos.modo) limpo.modo = campos.modo
  if (campos.onboarding_ok !== undefined) limpo.onboarding_ok = campos.onboarding_ok
  const { error } = await supabase.from('perfis').update(limpo).eq('id', user.id)
  revalidatePath('/', 'layout')
  return { ok: !error }
}

export async function registrarEvento(tipo: string, dados: Record<string, unknown> = {}) {
  const ctx = await contexto()
  if (!ctx.user) return false
  const permitidos = ['instalou', 'compartilhou', 'notificacoes_ativadas', 'upgrade_visto', 'retrospectiva_vista']
  if (!permitidos.includes(tipo)) return false
  const { error } = await ctx.supabase.from('eventos').insert({ user_id: ctx.user.id, tipo, dados })
  return !error
}

// ---------- Grupo ----------

function mensagemDeErro(msg?: string) {
  if (!msg) return 'Algo deu errado. Tente de novo.'
  if (msg.includes('plano_simples')) return 'O grupo faz parte do plano Completo.'
  if (msg.includes('ja_em_grupo')) return 'Você já está em um grupo. Saia dele antes de entrar em outro.'
  if (msg.includes('grupo_inexistente')) return 'Não encontramos esse grupo. Confira o link do convite.'
  return 'Algo deu errado. Tente de novo.'
}

export async function criarGrupo(nome: string) {
  const { supabase } = await sessao()
  const n = nome.trim()
  if (!n) return { ok: false, erro: 'Dê um nome ao grupo.' }
  const { data, error } = await supabase.rpc('criar_grupo', { p_nome: n.slice(0, 60) })
  revalidatePath('/', 'layout')
  return error ? { ok: false, erro: mensagemDeErro(error.message) } : { ok: true, codigo: data as string }
}

export async function entrarNoGrupo(codigo: string) {
  const { supabase } = await sessao()
  const { error } = await supabase.rpc('entrar_no_grupo', { p_codigo: codigo.trim() })
  revalidatePath('/', 'layout')
  return error ? { ok: false, erro: mensagemDeErro(error.message) } : { ok: true }
}

export async function sairDoGrupo() {
  const { supabase, user } = await sessao()
  await supabase.from('grupo_membros').delete().eq('user_id', user.id)
  await supabase.from('perfis').update({ modo: 'solo' }).eq('id', user.id)
  revalidatePath('/', 'layout')
  return { ok: true }
}

// ---------- Notificações ----------

export async function salvarInscricaoPush(inscricao: { endpoint: string; keys: { p256dh: string; auth: string } }) {
  const { supabase } = await sessao()
  const { error } = await supabase.rpc('salvar_inscricao', {
    p_endpoint: inscricao.endpoint,
    p_p256dh: inscricao.keys.p256dh,
    p_auth: inscricao.keys.auth,
  })
  if (!error) await registrarEvento('notificacoes_ativadas')
  return { ok: !error }
}

export async function chavePublicaPush() {
  const { supabase } = await contexto()
  const { data } = await supabase.rpc('vapid_publica')
  return (data as string) || null
}

export async function enviarPushDeTeste() {
  const { supabase } = await sessao()
  const { data, error } = await supabase.rpc('pedir_push_teste')
  if (error) return { ok: false, erro: 'Não foi possível enviar agora.' }
  if (!data) return { ok: false, erro: 'Ative as notificações neste aparelho primeiro.' }
  return { ok: true }
}

// ---------- Sair ----------

export async function sair() {
  const { supabase } = await contexto()
  await supabase.auth.signOut()
  redirect('/entrar')
}

// ---------- Ferramentas de teste ----------

function exigirModoTeste() {
  if (!MODO_TESTE) throw new Error('modo_teste_desligado')
}

export async function definirDataDeTeste(data: string | null) {
  exigirModoTeste()
  const loja = await cookies()
  const valida = validarData(data)
  if (valida) loja.set(COOKIE_DATA_TESTE, valida, { path: '/', maxAge: 60 * 60 * 24 * 90, sameSite: 'lax' })
  else loja.delete(COOKIE_DATA_TESTE)
  revalidatePath('/', 'layout')
}

export async function trocarPlanoDeTeste(plano: 'simples' | 'completo') {
  exigirModoTeste()
  const { supabase } = await sessao()
  const { error } = await supabase.rpc('teste_trocar_plano', { p_plano: plano })
  revalidatePath('/', 'layout')
  return { ok: !error }
}

/** Marca como completos os dias anteriores a hoje (para testar sequência, coroa e retrospectivas). */
export async function preencherDiasDeTeste(comFalhas: boolean) {
  exigirModoTeste()
  const { supabase, user, dia: hoje } = await sessao()
  const ate = Math.min(hoje - 1, TOTAL_DIAS)
  if (ate < 1) return { ok: false, erro: 'Escolha uma data simulada depois de 29/11.' }
  const agora = new Date().toISOString()
  const linhas = []
  for (let d = 1; d <= ate; d++) {
    if (comFalhas && d % 5 === 3) continue
    linhas.push({
      user_id: user.id,
      dia: d,
      ouvir_em: agora,
      rezar_em: agora,
      agir_em: agora,
      fechar_em: d % 2 ? agora : null,
      completo_no_dia: d,
      missao: d % 4 === 0 ? 'em_parte' : 'sim',
      frase: d % 2 ? `[RASCUNHO] Citação curta do dia ${d}` : null,
      frase_autor: d % 2 ? '[RASCUNHO] Santo do dia' : null,
      oracao_seg: 360 + (d % 3) * 60,
      atualizado_em: agora,
    })
  }
  const { error } = await supabase.from('progresso').upsert(linhas)
  revalidatePath('/', 'layout')
  return { ok: !error, erro: error?.message }
}

export async function recomecarDeTeste() {
  exigirModoTeste()
  const { supabase, user } = await sessao()
  await supabase.from('progresso').delete().eq('user_id', user.id)
  await supabase.from('perfis').update({ onboarding_ok: false }).eq('id', user.id)
  revalidatePath('/', 'layout')
  redirect('/boas-vindas')
}
