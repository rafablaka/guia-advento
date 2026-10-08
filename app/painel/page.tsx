import NextLink from 'next/link'
import { exigirSessao } from '@/lib/sessao'
import { SetaVoltar } from '@/components/Icones'

export const metadata = { title: 'Painel · Guia do Advento' }

type Metricas = {
  usuarios: number
  simples: number
  completo: number
  jornada_completa: number
  semana1_completa: number
  ativos: number
  notificacoes_ativas: number
  instalaram: number
  upgrades: number
  compartilharam: number
  cliques_indicacao: number
  grupos: number
  completo_em_grupo: number
  por_dia: { dia: number; pessoas: number }[]
}

function pct(a: number, b: number) {
  return b ? `${Math.round((a / b) * 100)}%` : '–'
}

export default async function Painel() {
  const { supabase } = await exigirSessao()
  const { data, error } = await supabase.rpc('painel_metricas')
  const m = data as Metricas | null

  return (
    <main className="tela-cheia">
      <NextLink href="/voce" aria-label="Voltar" className="botao-redondo">
        <SetaVoltar />
      </NextLink>
      <h1 className="font-titulo mt-5" style={{ fontSize: 32, fontWeight: 500 }}>
        Painel
      </h1>
      {error || !m ? (
        <p className="mt-3" style={{ color: 'var(--text-2)' }}>
          Sem permissão para ver os números.
        </p>
      ) : (
        <>
          <p className="mt-1" style={{ fontSize: 14, color: 'var(--text-2)' }}>
            {m.usuarios} contas · {m.simples} Simples · {m.completo} Completo
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2.5">
            <Num valor={pct(m.jornada_completa, m.usuarios)} rotulo="Conclusão da jornada" detalhe={`${m.jornada_completa} de ${m.usuarios} fizeram os 26 dias`} destaque />
            <Num valor={pct(m.semana1_completa, m.usuarios)} rotulo="Conclusão da semana 1" detalhe={`${m.semana1_completa} completaram os 7 primeiros dias`} />
            <Num valor={pct(m.instalaram, m.usuarios)} rotulo="Instalaram o app" detalhe={`${m.instalaram} contas`} />
            <Num valor={pct(m.notificacoes_ativas, m.usuarios)} rotulo="Ativaram notificações" detalhe={`${m.notificacoes_ativas} contas`} />
            <Num valor={pct(m.upgrades, m.simples + m.upgrades)} rotulo="Upgrade" detalhe={`${m.upgrades} passaram do Simples ao Completo`} />
            <Num valor={pct(m.compartilharam, m.usuarios)} rotulo="Compartilharam" detalhe={`${m.compartilharam} contas`} />
            <Num valor={String(m.cliques_indicacao)} rotulo="Cliques em convites" detalhe="Vendas por indicação dependem da Guru" />
            <Num valor={pct(m.completo_em_grupo, m.completo)} rotulo="Completo em grupo" detalhe={`${m.grupos} grupos ativos`} />
          </div>
          <p className="cartao mt-2.5 p-4" style={{ fontSize: 13, color: 'var(--text-3)' }}>
            Order bumps: aparecem aqui quando a integração com a Guru estiver pronta.
          </p>

          <h2 className="sobrancelha mt-6">Pessoas que completaram cada dia</h2>
          <table className="mt-2.5 w-full" style={{ fontSize: 14, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ color: 'var(--text-3)', textAlign: 'left' }}>
                <th className="py-1.5 font-semibold">Dia</th>
                <th className="py-1.5 text-right font-semibold">Pessoas</th>
                <th className="py-1.5 text-right font-semibold">% das contas</th>
              </tr>
            </thead>
            <tbody>
              {m.por_dia.map((d) => (
                <tr key={d.dia} style={{ borderTop: '1px solid var(--border)' }}>
                  <td className="py-1.5">{d.dia}</td>
                  <td className="py-1.5 text-right" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {d.pessoas}
                  </td>
                  <td className="py-1.5 text-right" style={{ color: 'var(--text-2)', fontVariantNumeric: 'tabular-nums' }}>
                    {pct(d.pessoas, m.usuarios)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </main>
  )
}

function Num({ valor, rotulo, detalhe, destaque }: { valor: string; rotulo: string; detalhe: string; destaque?: boolean }) {
  return (
    <div className="cartao px-4 py-3.5">
      <div className="font-titulo" style={{ fontSize: 28, fontWeight: 600, lineHeight: 1.1, color: destaque ? 'var(--gold)' : 'var(--text)' }}>
        {valor}
      </div>
      <div className="mt-1" style={{ fontSize: 13, fontWeight: 600 }}>
        {rotulo}
      </div>
      <div className="mt-0.5" style={{ fontSize: 12, color: 'var(--text-3)' }}>
        {detalhe}
      </div>
    </div>
  )
}
