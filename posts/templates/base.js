// Base comum dos templates de posts.
// O gerador (posts/gerar.mjs) injeta window.POST (um item do JSON) e window.MODO ('claro' | 'escuro').
// Aberto por um servidor local (npx serve posts), lê ../dados/<template>.json?item=0&modo=escuro.

const ICONE_GUIA = '<img class="icone-guia" src="../imagens/icone-guia.jpg" alt="">'

// Filtro duotone roxo para fotos e papéis de parede: sombras ameixa, luzes lilás.
// Uso no CSS: filter: url(#duotone)
const DUOTONE = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="duotone" color-interpolation-filters="sRGB">
  <feColorMatrix type="matrix" values="0.299 0.587 0.114 0 0  0.299 0.587 0.114 0 0  0.299 0.587 0.114 0 0  0 0 0 1 0"/>
  <feComponentTransfer>
    <feFuncR type="table" tableValues="0.106 0.333 0.890"/>
    <feFuncG type="table" tableValues="0.071 0.188 0.800"/>
    <feFuncB type="table" tableValues="0.141 0.439 0.949"/>
  </feComponentTransfer>
</filter></svg>`

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
  document.body.insertAdjacentHTML('afterbegin', DUOTONE)
  document.documentElement.dataset.modo = modo
  window.render(post, modo)
  await document.fonts.ready
  await Promise.all(
    [...document.images].map((i) => (i.complete ? 0 : new Promise((r) => { i.addEventListener('load', r); i.addEventListener('error', r) }))),
  )
  if (window.ajustar) await window.ajustar(post, modo)
  window.PRONTO = true
})
