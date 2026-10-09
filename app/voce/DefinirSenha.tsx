'use client'
import { useState } from 'react'
import { supabaseNavegador } from '@/lib/supabase/navegador'

/** Só no modo de teste: cria uma senha para entrar sem depender do e-mail. */
export function DefinirSenha() {
  const [senha, setSenha] = useState('')
  const [aviso, setAviso] = useState('')
  const [ocupado, setOcupado] = useState(false)

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setOcupado(true)
    const { error } = await supabaseNavegador().auth.updateUser({ password: senha })
    setOcupado(false)
    setAviso(error ? 'Não deu para salvar. Use pelo menos 6 caracteres.' : 'Senha salva. Agora dá para entrar com e-mail e senha.')
    if (!error) setSenha('')
  }

  return (
    <form onSubmit={salvar}>
      <label htmlFor="nova-senha" style={{ fontSize: 15, fontWeight: 600 }}>
        Senha para entrar sem e-mail
      </label>
      <div className="mt-2 flex gap-2">
        <input
          id="nova-senha"
          type="password"
          autoComplete="new-password"
          minLength={6}
          className="campo flex-1"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="Mínimo de 6 caracteres"
        />
        <button className="botao-secundario" disabled={senha.length < 6 || ocupado}>
          Salvar
        </button>
      </div>
      {aviso && (
        <p role="status" className="mt-2" style={{ fontSize: 13, color: 'var(--text-2)' }}>
          {aviso}
        </p>
      )}
    </form>
  )
}
