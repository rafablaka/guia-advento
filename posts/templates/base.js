// Base comum dos templates de posts.
// O gerador (posts/gerar.mjs) injeta window.POST (um item do JSON) e window.MODO ('claro' | 'escuro').
// Aberto por um servidor local (npx serve posts), lê ../dados/<template>.json?item=0&modo=escuro.

const ICONE_GUIA = `<svg viewBox="0 0 44 44" aria-hidden="true"><rect width="44" height="44" rx="9.7" fill="#553070"/><g transform="translate(9.7 9.7) scale(1.025)"><path d="M12 1.5c.7 5 1.8 6.1 6.8 6.8-5 .7-6.1 1.8-6.8 6.8-.7-5-1.8-6.1-6.8-6.8 5-.7 6.1-1.8 6.8-6.8z" fill="#E1B65A"/><circle cx="12" cy="20" r="1.6" fill="#E1B65A"/></g></svg>`

// tom: 'claro' = texto creme (sobre fundo escuro) · 'escuro' = texto chumbo (sobre fundo claro)
function selo(tom) {
  return `<div class="selo ${tom}">${ICONE_GUIA}<span>Guia do Advento</span></div>`
}

function esc(texto) {
  return String(texto ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
}

// Caminhos de imagem nos JSONs são relativos à pasta posts/.
function img(caminho) {
  if (!caminho) return ''
  return new URL(caminho, new URL('../', location.href)).href
}

// Iniciais para o avatar: "Santo Afonso de Ligório" → "SA".
function iniciais(nome) {
  const p = String(nome || '').trim().split(/\s+/).filter((x) => /^\p{Lu}/u.test(x))
  return ((p[0]?.[0] || '') + (p[1]?.[0] || '')).toUpperCase() || '?'
}

// Diminui o zoom de `el` (que ocupa 1080 × 1080) até o conteúdo caber.
function caberComZoom(el, inicio, minimo = 1.6) {
  for (let z = inicio; z >= minimo; z -= 0.05) {
    el.style.zoom = z
    el.style.width = `${1080 / z}px`
    el.style.height = `${1080 / z}px`
    if (el.scrollHeight <= el.clientHeight + 1) return z
  }
  return minimo
}

// Diminui a fonte de `alvo` até `cabe()` ser verdadeiro.
function caberComFonte(alvo, inicio, minimo, cabe) {
  for (let t = inicio; t >= minimo; t -= 1) {
    alvo.style.fontSize = `${t}px`
    if (cabe()) return t
  }
  return minimo
}

window.addEventListener('DOMContentLoaded', async () => {
  let post = window.POST
  let modo = window.MODO
  if (!post) {
    const nome = document.body.dataset.template
    const p = new URLSearchParams(location.search)
    try {
      const dados = await (await fetch(`../dados/${nome}.json`)).json()
      post = dados.itens[Number(p.get('item') || 0)]
      modo = p.get('modo') || (dados.modos || ['claro'])[0]
    } catch {
      document.body.textContent = 'Gere as imagens com: npm run posts'
      return
    }
  }
  modo = modo || 'claro'
  document.documentElement.dataset.modo = modo
  window.render(post, modo)
  await document.fonts.ready
  await Promise.all(
    [...document.images].map((i) => (i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r }))),
  )
  if (window.ajustar) await window.ajustar(post, modo)
  window.PRONTO = true
})
