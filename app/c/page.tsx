import { contexto } from '@/lib/sessao'
import { LINK_COMPRA } from '@/lib/config'
import { Coroa } from '@/components/Coroa'
import { Marca } from '@/components/Cabecalho'

export const metadata = { title: 'Guia do Advento' }

// Destino dos convites e retrospectivas compartilhadas. Registra o clique (vendas por indicação) e leva à compra.
export default async function ConviteDeCompra({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref } = await searchParams
  const { supabase } = await contexto()
  await supabase.rpc('registrar_evento_anonimo', { p_tipo: 'indicacao_clique', p_dados: { ref: ref?.slice(0, 40) ?? null } })
  return (
    <main className="tela-cheia">
      <Marca />
      <div className="mt-6 flex justify-center">
        <Coroa velas={4} largura={280} />
      </div>
      <h1 className="font-titulo mt-4" style={{ fontSize: 32, fontWeight: 500, lineHeight: 1.1 }}>
        A melhor preparação para o Natal da sua vida
      </h1>
      <p className="mt-2" style={{ fontSize: 15, lineHeight: 1.45, color: 'var(--text-2)' }}>
        26 dias, de 29 de novembro a 24 de dezembro. Todo dia você ouve um santo, reza e cumpre uma missão. Sozinho ou em grupo.
      </p>
      <div className="mt-auto pt-8">
        {LINK_COMPRA ? (
          <a href={`${LINK_COMPRA}${LINK_COMPRA.includes('?') ? '&' : '?'}src=${encodeURIComponent(ref || '')}`} className="botao-principal">
            Quero viver o Advento
          </a>
        ) : (
          <p className="cartao p-4 text-center" style={{ fontSize: 14, color: 'var(--text-2)' }}>
            As vendas abrem em breve. (A página de compra da Guru entra aqui.)
          </p>
        )}
      </div>
    </main>
  )
}
