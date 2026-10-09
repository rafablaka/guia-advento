import NextLink from 'next/link'
import { contexto } from '@/lib/sessao'
import { LINK_COMPRA } from '@/lib/config'
import { Coroa } from '@/components/Coroa'
import { Marca } from '@/components/Cabecalho'
import { EntrarNoGrupoBotao } from './EntrarNoGrupoBotao'

export const metadata = { title: 'Convite · Guia do Advento' }

export default async function Convite({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params
  const { supabase, user, perfil } = await contexto()
  const { data } = await supabase.rpc('grupo_por_codigo', { p_codigo: codigo })
  const grupo = data as { nome: string; membros: number } | null
  await supabase.rpc('registrar_evento_anonimo', { p_tipo: 'convite_aberto', p_dados: { codigo } })

  return (
    <main className="tela-cheia">
      <Marca />
      <div className="mt-6 flex justify-center">
        <Coroa velas={0} largura={260} />
      </div>
      {!grupo ? (
        <>
          <h1 className="font-titulo mt-4" style={{ fontSize: 30, fontWeight: 500 }}>
            Convite não encontrado
          </h1>
          <p className="mt-2" style={{ fontSize: 15, color: 'var(--text-2)' }}>
            Confira o link com quem te convidou.
          </p>
        </>
      ) : (
        <>
          <p className="sobrancelha mt-4">Convite para o grupo</p>
          <h1 className="font-titulo mt-1" style={{ fontSize: 32, fontWeight: 500, lineHeight: 1.1 }}>
            {grupo.nome}
          </h1>
          <p className="mt-2" style={{ fontSize: 15, lineHeight: 1.45, color: 'var(--text-2)' }}>
            {grupo.membros === 1 ? '1 pessoa já está' : `${grupo.membros} pessoas já estão`} no grupo. Todos fazem o mesmo dia, cada um no seu ritmo, e a coroa
            do grupo só acende quando todos rezam.
          </p>
          <div className="mt-auto flex flex-col gap-2 pt-8">
            {!user ? (
              <>
                <NextLink href={`/entrar?depois=${encodeURIComponent(`/convite/${codigo}`)}`} className="botao-principal">
                  Já tenho o Guia · entrar
                </NextLink>
                <a href={LINK_COMPRA || `/c?ref=grupo-${codigo}`} className="botao-secundario w-full">
                  Quero o Guia do Advento
                </a>
              </>
            ) : perfil?.plano !== 'completo' ? (
              <>
                <p className="cartao p-4" style={{ fontSize: 14, color: 'var(--text-2)' }}>
                  O grupo faz parte do plano Completo. Faça o upgrade para entrar.
                </p>
                <NextLink href="/upgrade" className="botao-principal">
                  Conhecer o Completo
                </NextLink>
              </>
            ) : (
              <EntrarNoGrupoBotao codigo={codigo} onboarding={!perfil.onboarding_ok} />
            )}
          </div>
        </>
      )}
    </main>
  )
}
