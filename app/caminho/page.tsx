import { exigirSessao, meuProgresso } from '@/lib/sessao'
import { TOTAL_DIAS, dataCurta, dataDoDia, diasDaSemana, velasAcesas } from '@/lib/calendario'
import { diasParaRecuperar, estadoDaPorta, maiorSequencia, resumoDosDias, sequenciaAtual } from '@/lib/progresso'
import { NavInferior } from '@/components/NavInferior'
import { Porta } from '@/components/Portas'
import { Chama } from '@/components/Icones'
import { AvisoDataTeste } from '@/components/AvisoDataTeste'

export const metadata = { title: 'Caminho · Guia do Advento' }

const NOMES_SEMANA = ['1ª semana', '2ª semana', '3ª semana · Domingo da Alegria', '4ª semana']

export default async function Caminho() {
  const { hoje, dia, fase } = await exigirSessao()
  const progresso = await meuProgresso()
  const hojeN = fase === 'espera' ? 0 : dia
  const resumo = resumoDosDias(progresso, Array.from({ length: TOTAL_DIAS }, (_, i) => i + 1))
  const recuperar = diasParaRecuperar(progresso, hojeN)

  return (
    <>
      <main className="tela">
        <AvisoDataTeste data={hoje.data} simulada={hoje.simulada} />
        <h1 className="font-titulo" style={{ fontSize: 34, fontWeight: 500, lineHeight: 1.1, letterSpacing: '-0.015em' }}>
          Seu caminho
        </h1>
        <p className="mt-1.5" style={{ fontSize: 14, color: 'var(--text-2)' }}>
          26 portas, de 29 de novembro a 24 de dezembro.
        </p>

        <div className="mt-5 grid grid-cols-3 gap-2.5">
          <Numero valor={`${resumo.diasRezados}/26`} rotulo="dias rezados" />
          <Numero
            valor={
              <span className="flex items-center gap-1">
                <Chama tamanho={20} />
                {sequenciaAtual(progresso, hojeN)}
              </span>
            }
            rotulo={`seguidos · máx. ${maiorSequencia(progresso, hojeN)}`}
          />
          <Numero valor={`${resumo.minutos}`} rotulo="min em oração" />
        </div>

        {recuperar.length > 0 && (
          <p className="cartao mt-4 px-4 py-3" style={{ fontSize: 14, lineHeight: 1.45, color: 'var(--text-2)' }}>
            {recuperar.length === 1 ? 'Há 1 porta' : `Há ${recuperar.length} portas`} com borda tracejada para recuperar. Ontem ainda conta na sequência
            se for feito até o fim de hoje.
          </p>
        )}
        {fase === 'espera' && (
          <p className="cartao mt-4 px-4 py-3" style={{ fontSize: 14, color: 'var(--text-2)' }}>
            As portas abrem uma por dia, a partir de 29 de novembro, à meia-noite.
          </p>
        )}

        {[1, 2, 3, 4].map((s) => (
          <section key={s} className="mt-6" aria-labelledby={`semana-${s}`}>
            <div className="flex items-baseline justify-between">
              <h2 id={`semana-${s}`} className="sobrancelha" style={s === 3 ? { color: 'var(--gaudete-texto)' } : undefined}>
                {NOMES_SEMANA[s - 1]}
              </h2>
              <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
                {dataCurta(dataDoDia(diasDaSemana(s)[0]))} a {dataCurta(dataDoDia(diasDaSemana(s).at(-1)!))}
              </span>
            </div>
            <div className="mt-2.5 grid grid-cols-7 gap-2">
              {diasDaSemana(s).map((d) => (
                <div key={d} className="flex flex-col items-center gap-1">
                  <Porta dia={d} estado={estadoDaPorta(progresso, d, hojeN)} />
                  <span style={{ fontSize: 10.5, color: d === hojeN ? 'var(--accent)' : 'var(--text-3)' }}>{dataCurta(dataDoDia(d))}</span>
                </div>
              ))}
            </div>
          </section>
        ))}

        <ul className="mt-6 grid grid-cols-2 gap-2" style={{ fontSize: 12.5, color: 'var(--text-2)' }} aria-label="Legenda">
          <Legenda estilo={{ border: '1px solid var(--gold-borda)' }} texto="Concluída" />
          <Legenda estilo={{ background: 'var(--hoje-fill)' }} texto="Hoje" />
          <Legenda estilo={{ border: '1.5px dashed var(--gold-borda)' }} texto="Para recuperar" />
          <Legenda estilo={{ border: '1px solid var(--border-forte)' }} texto="Ainda fechada" />
        </ul>
        <p className="mt-4" style={{ fontSize: 12, color: 'var(--text-3)' }}>
          Velas acesas hoje: {velasAcesas(hoje.data)} de 4.
        </p>
      </main>
      <NavInferior />
    </>
  )
}

function Numero({ valor, rotulo }: { valor: React.ReactNode; rotulo: string }) {
  return (
    <div className="cartao px-3 py-3">
      <div className="font-titulo" style={{ fontSize: 24, fontWeight: 600, lineHeight: 1.15 }}>
        {valor}
      </div>
      <div className="mt-0.5" style={{ fontSize: 12, color: 'var(--text-2)' }}>
        {rotulo}
      </div>
    </div>
  )
}

function Legenda({ estilo, texto }: { estilo: React.CSSProperties; texto: string }) {
  return (
    <li className="flex items-center gap-2">
      <span className="porta inline-block" style={{ width: 16, height: 20, ...estilo }} aria-hidden="true" />
      {texto}
    </li>
  )
}
