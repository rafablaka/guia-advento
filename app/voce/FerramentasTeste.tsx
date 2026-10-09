'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { definirDataDeTeste, preencherDiasDeTeste, recomecarDeTeste, trocarPlanoDeTeste } from '@/app/acoes'

const ATALHOS = [
  { data: '2026-11-20', rotulo: 'Antes (espera)' },
  { data: '2026-11-29', rotulo: 'Dia 1' },
  { data: '2026-12-06', rotulo: '6/12 · retro 1' },
  { data: '2026-12-08', rotulo: '8/12 · Imaculada' },
  { data: '2026-12-13', rotulo: '13/12 · Gaudete' },
  { data: '2026-12-20', rotulo: '20/12 · Antífona C' },
  { data: '2026-12-23', rotulo: '23/12 · ERO CRAS' },
  { data: '2026-12-24', rotulo: '24/12 · Véspera' },
  { data: '2026-12-25', rotulo: '25/12 · Natal' },
]

export function FerramentasTeste({ data, plano }: { data: string; plano: 'simples' | 'completo' }) {
  const router = useRouter()
  const [valor, setValor] = useState(data)
  const [aviso, setAviso] = useState('')
  const [pendente, iniciar] = useTransition()

  function aplicar(nova: string | null) {
    iniciar(async () => {
      await definirDataDeTeste(nova)
      setValor(nova || '')
      setAviso(nova ? 'Data simulada aplicada.' : 'Voltou para a data real.')
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <p style={{ fontSize: 13, lineHeight: 1.45, color: 'var(--text-3)' }}>
        Estas opções só existem enquanto o app está em teste. Elas não aparecem para os compradores.
      </p>

      <div>
        <label htmlFor="data-teste" style={{ fontSize: 15, fontWeight: 600 }}>
          Simular uma data
        </label>
        <div className="mt-2 flex gap-2">
          <input id="data-teste" type="date" className="campo flex-1" min="2026-10-01" max="2027-01-10" value={valor} onChange={(e) => setValor(e.target.value)} />
          <button type="button" className="botao-secundario" disabled={!valor || pendente} onClick={() => aplicar(valor)}>
            Aplicar
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {ATALHOS.map((a) => (
            <button key={a.data} type="button" className="botao-secundario" style={{ fontSize: 12.5, minHeight: 36, padding: '0 12px' }} onClick={() => aplicar(a.data)}>
              {a.rotulo}
            </button>
          ))}
        </div>
        {data && (
          <button type="button" className="botao-secundario mt-2 w-full" onClick={() => aplicar(null)}>
            Voltar para a data real
          </button>
        )}
      </div>

      <div>
        <p style={{ fontSize: 15, fontWeight: 600 }}>Plano</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <BotaoPlanoTeste plano="simples" rotulo={plano === 'simples' ? 'Simples (atual)' : 'Mudar para Simples'} />
          <BotaoPlanoTeste plano="completo" rotulo={plano === 'completo' ? 'Completo (atual)' : 'Mudar para Completo'} />
        </div>
      </div>

      <div>
        <p style={{ fontSize: 15, fontWeight: 600 }}>Progresso</p>
        <div className="mt-2 flex flex-col gap-2">
          <button
            type="button"
            className="botao-secundario w-full"
            disabled={pendente}
            onClick={() =>
              iniciar(async () => {
                const r = await preencherDiasDeTeste(false)
                setAviso(r.ok ? 'Dias anteriores marcados como completos.' : r.erro || 'Não deu certo.')
                router.refresh()
              })
            }
          >
            Completar os dias anteriores
          </button>
          <button
            type="button"
            className="botao-secundario w-full"
            disabled={pendente}
            onClick={() =>
              iniciar(async () => {
                const r = await preencherDiasDeTeste(true)
                setAviso(r.ok ? 'Dias anteriores preenchidos, com alguns dias perdidos.' : r.erro || 'Não deu certo.')
                router.refresh()
              })
            }
          >
            Completar com alguns dias perdidos
          </button>
          <button type="button" className="botao-secundario w-full" disabled={pendente} onClick={() => iniciar(() => recomecarDeTeste())}>
            Apagar meu progresso e rever a apresentação
          </button>
        </div>
      </div>
      {aviso && (
        <p role="status" style={{ fontSize: 13, color: 'var(--accent)' }}>
          {aviso}
        </p>
      )}
    </div>
  )
}

export function BotaoPlanoTeste({ plano, rotulo }: { plano: 'simples' | 'completo'; rotulo: string }) {
  const router = useRouter()
  const [pendente, iniciar] = useTransition()
  return (
    <button
      type="button"
      className="botao-secundario w-full"
      disabled={pendente}
      onClick={() =>
        iniciar(async () => {
          await trocarPlanoDeTeste(plano)
          router.refresh()
        })
      }
    >
      {pendente ? <><span className="girando" aria-hidden="true" />Trocando…</> : rotulo}
    </button>
  )
}
