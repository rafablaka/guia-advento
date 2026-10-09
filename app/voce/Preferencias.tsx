'use client'
import { useState, useTransition } from 'react'
import { salvarPerfil } from '@/app/acoes'

const TEMAS = [
  { valor: 'sistema', rotulo: 'Automático' },
  { valor: 'noite', rotulo: 'Noite' },
  { valor: 'pergaminho', rotulo: 'Pergaminho' },
] as const

export function Preferencias(p: { nome: string; tema: 'sistema' | 'noite' | 'pergaminho'; hora: string; lembreteAtivo: boolean }) {
  const [nome, setNome] = useState(p.nome)
  const [tema, setTema] = useState(p.tema)
  const [hora, setHora] = useState(p.hora)
  const [ativo, setAtivo] = useState(p.lembreteAtivo)
  const [salvo, setSalvo] = useState('')
  const [, iniciar] = useTransition()

  function salvar(campos: Parameters<typeof salvarPerfil>[0], aviso = 'Salvo') {
    iniciar(async () => {
      await salvarPerfil(campos)
      setSalvo(aviso)
      setTimeout(() => setSalvo(''), 1800)
    })
  }

  function trocarTema(t: typeof tema) {
    setTema(t)
    // Aplica na hora, sem esperar o servidor
    if (t === 'sistema') document.documentElement.removeAttribute('data-theme')
    else document.documentElement.setAttribute('data-theme', t)
    salvar({ tema: t })
  }

  return (
    <>
      <section className="mt-6">
        <h2 className="sobrancelha">Perfil</h2>
        <div className="cartao mt-2.5 p-4">
          <label htmlFor="nome" style={{ fontSize: 14, color: 'var(--text-2)' }}>
            Nome
          </label>
          <input id="nome" className="campo mt-2" value={nome} onChange={(e) => setNome(e.target.value)} onBlur={() => nome !== p.nome && salvar({ nome })} />
        </div>
      </section>

      <section className="mt-6">
        <h2 className="sobrancelha">Aparência</h2>
        <div className="cartao mt-2.5 grid grid-cols-3 gap-1.5 p-1.5" role="radiogroup" aria-label="Modo de cor">
          {TEMAS.map((t) => (
            <button
              key={t.valor}
              type="button"
              role="radio"
              aria-checked={tema === t.valor}
              onClick={() => trocarTema(t.valor)}
              className="min-h-11 rounded-[15px] border-0"
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: tema === t.valor ? 'var(--text)' : 'var(--text-2)',
                background: tema === t.valor ? 'var(--nav-ativo)' : 'transparent',
                outline: tema === t.valor ? '1px solid var(--accent)' : undefined,
              }}
            >
              {t.rotulo}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="sobrancelha">Lembrete diário</h2>
        <div className="cartao mt-2.5 p-4">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="hora" style={{ fontSize: 15, fontWeight: 600 }}>
              Horário da porta
            </label>
            <input
              id="hora"
              type="time"
              className="campo"
              style={{ width: 130 }}
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              onBlur={() => hora !== p.hora && salvar({ lembrete_hora: hora }, 'Horário salvo')}
            />
          </div>
          <label className="mt-3 flex min-h-11 items-center justify-between gap-3" style={{ fontSize: 14, color: 'var(--text-2)' }}>
            Receber lembretes (no máximo 2 por dia)
            <input
              type="checkbox"
              checked={ativo}
              onChange={(e) => {
                setAtivo(e.target.checked)
                salvar({ lembrete_ativo: e.target.checked })
              }}
              style={{ width: 22, height: 22, accentColor: 'var(--primary)' }}
            />
          </label>
        </div>
      </section>
      <p role="status" aria-live="polite" className="mt-2 h-4 text-center" style={{ fontSize: 13, color: 'var(--accent)' }}>
        {salvo}
      </p>
    </>
  )
}
