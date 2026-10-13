// Gera os PNGs (1080 × 1080) dos posts orgânicos a partir de posts/dados/*.json.
// Uso:
//   npm run posts                 → todos os templates
//   npm run posts -- tweet notas  → só os templates indicados
// Saída: posts/saida/<template>-<id>[-<modo>].png
import { readFileSync, readdirSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { chromium } from 'playwright-core'

const RAIZ = dirname(fileURLToPath(import.meta.url))
const SAIDA = join(RAIZ, 'saida')
const filtro = process.argv.slice(2)

const templates = readdirSync(join(RAIZ, 'dados'))
  .filter((f) => f.endsWith('.json'))
  .map((f) => f.replace(/\.json$/, ''))
  .filter((t) => filtro.length === 0 || filtro.includes(t))

if (templates.length === 0) {
  console.error(`Nenhum template encontrado para: ${filtro.join(', ')}`)
  process.exit(1)
}

mkdirSync(SAIDA, { recursive: true })

let navegador
try {
  navegador = await chromium.launch()
} catch (erro) {
  if (!process.env.CHROMIUM_PATH) {
    console.error('Não achei o Chromium. Rode uma vez: npx playwright-core install chromium')
    throw erro
  }
  navegador = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH })
}

let total = 0
for (const template of templates) {
  const dados = JSON.parse(readFileSync(join(RAIZ, 'dados', `${template}.json`), 'utf8'))
  const url = pathToFileURL(join(RAIZ, 'templates', `${template}.html`)).href
  for (const [i, item] of dados.itens.entries()) {
    const id = item.id || String(i + 1)
    const modos = item.modos || dados.modos || [null]
    for (const modo of modos) {
      const pagina = await navegador.newPage({ viewport: { width: 1080, height: 1080 }, deviceScaleFactor: 1 })
      pagina.on('pageerror', (e) => console.error(`  erro na página: ${e.message}`))
      await pagina.addInitScript(({ post, modo }) => {
        window.POST = post
        window.MODO = modo
      }, { post: item, modo })
      await pagina.goto(url)
      await pagina.waitForFunction(() => window.PRONTO === true, null, { timeout: 30000 })
      const arquivo = `${template}-${id}${modo ? `-${modo}` : ''}.png`
      await pagina.screenshot({ path: join(SAIDA, arquivo) })
      await pagina.close()
      console.log(`✓ ${arquivo}`)
      total++
    }
  }
}

await navegador.close()
console.log(`\n${total} imagem(ns) em posts/saida/`)
