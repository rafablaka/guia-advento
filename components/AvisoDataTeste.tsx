import NextLink from 'next/link'
import { dataCurta } from '@/lib/calendario'

/** Faixa discreta que lembra que o app está numa data simulada (só no modo de teste). */
export function AvisoDataTeste({ data, simulada }: { data: string; simulada: boolean }) {
  if (!simulada) return null
  return (
    <NextLink
      href="/voce#teste"
      className="mb-3 flex min-h-9 items-center justify-center rounded-full no-underline"
      style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', border: '1px dashed var(--tracejado)' }}
    >
      Modo de teste · simulando {dataCurta(data)}
    </NextLink>
  )
}
