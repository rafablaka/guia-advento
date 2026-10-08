import { imagemDoIcone } from '@/lib/arte/icone'

export async function GET(req: Request, { params }: { params: Promise<{ tamanho: string }> }) {
  const { tamanho } = await params
  const n = Math.min(1024, Math.max(32, Number(tamanho) || 192))
  const mascara = new URL(req.url).searchParams.get('mascara') === '1'
  return imagemDoIcone(n, mascara)
}
