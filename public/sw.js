// Service worker do Guia do Advento: guarda as artes e o app para abrir sem internet, e mostra os lembretes.
const VERSAO = 'guia-v1'
const ESTATICOS = ['/illustrations/coroa-0.svg', '/illustrations/coroa-1.svg', '/illustrations/coroa-2.svg', '/illustrations/coroa-3.svg', '/illustrations/coroa-4.svg', '/illustrations/anunciacao.svg']

self.addEventListener('install', (evento) => {
  evento.waitUntil(caches.open(VERSAO).then((c) => c.addAll(ESTATICOS)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches.keys().then((nomes) => Promise.all(nomes.filter((n) => n !== VERSAO).map((n) => caches.delete(n)))).then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (evento) => {
  const req = evento.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/auth/')) return

  // Arquivos que não mudam: cache primeiro
  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/illustrations/') || url.pathname.startsWith('/audio/')) {
    evento.respondWith(
      caches.match(req).then(
        (salvo) =>
          salvo ||
          fetch(req).then((resp) => {
            if (resp.ok && resp.status === 200) {
              const copia = resp.clone()
              caches.open(VERSAO).then((c) => c.put(req, copia))
            }
            return resp
          }),
      ),
    )
    return
  }

  // Páginas: rede primeiro, e a última versão salva se estiver sem internet
  if (req.mode === 'navigate') {
    evento.respondWith(
      fetch(req)
        .then((resp) => {
          if (resp.ok) {
            const copia = resp.clone()
            caches.open(VERSAO).then((c) => c.put(req, copia))
          }
          return resp
        })
        .catch(() => caches.match(req).then((salvo) => salvo || caches.match('/'))),
    )
  }
})

self.addEventListener('push', (evento) => {
  let dados = {}
  try {
    dados = evento.data ? evento.data.json() : {}
  } catch {
    dados = { corpo: evento.data ? evento.data.text() : '' }
  }
  const titulo = dados.titulo || 'Guia do Advento'
  evento.waitUntil(
    self.registration.showNotification(titulo, {
      body: dados.corpo || '',
      icon: '/icones/192',
      badge: '/icones/96',
      data: { url: dados.url || '/' },
      tag: dados.tipo || 'guia',
    }),
  )
})

self.addEventListener('notificationclick', (evento) => {
  evento.notification.close()
  const destino = new URL(evento.notification.data?.url || '/', self.location.origin).href
  evento.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((janelas) => {
      for (const j of janelas) {
        if ('focus' in j) {
          j.navigate(destino)
          return j.focus()
        }
      }
      return self.clients.openWindow(destino)
    }),
  )
})
