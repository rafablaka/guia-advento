import webpush from 'web-push'
import { createClient } from '@supabase/supabase-js'
import { SUPABASE_CHAVE_PUBLICA, SUPABASE_URL } from '@/lib/config'

// Chamado pelo próprio banco (pg_cron + pg_net) com um segredo.
// As chaves das notificações ficam no banco; este endpoint só repassa o segredo que recebeu.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Envio = { endpoint: string; p256dh: string; auth: string; titulo: string; corpo: string; url: string; tipo: string }

export async function POST(req: Request) {
  const segredo = req.headers.get('x-segredo')
  if (!segredo) return Response.json({ ok: false }, { status: 401 })
  const supabase = createClient(SUPABASE_URL, SUPABASE_CHAVE_PUBLICA, { auth: { persistSession: false } })
  const { data, error } = await supabase.rpc('coletar_envios', { p_segredo: segredo })
  if (error || !data) return Response.json({ ok: false }, { status: 401 })

  const { vapid_publica, vapid_privada, vapid_contato, envios } = data as {
    vapid_publica: string
    vapid_privada: string
    vapid_contato: string
    envios: Envio[]
  }
  webpush.setVapidDetails(vapid_contato, vapid_publica, vapid_privada)

  const invalidas: string[] = []
  let enviadas = 0
  await Promise.all(
    envios.map(async (e) => {
      try {
        await webpush.sendNotification(
          { endpoint: e.endpoint, keys: { p256dh: e.p256dh, auth: e.auth } },
          JSON.stringify({ titulo: e.titulo, corpo: e.corpo, url: e.url, tipo: e.tipo }),
          { TTL: 60 * 60 * 6, urgency: 'normal' },
        )
        enviadas++
      } catch (erro) {
        const status = (erro as { statusCode?: number }).statusCode
        if (status === 404 || status === 410) invalidas.push(e.endpoint)
      }
    }),
  )
  if (invalidas.length) await supabase.rpc('desativar_inscricoes', { p_segredo: segredo, p_endpoints: invalidas })
  return Response.json({ ok: true, enviadas, invalidas: invalidas.length })
}
