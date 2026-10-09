import { Suspense } from 'react'
import { FormEntrar } from './FormEntrar'
import { Coroa } from '@/components/Coroa'
import { Marca } from '@/components/Cabecalho'

export const metadata = { title: 'Entrar · Guia do Advento' }

export default function Entrar() {
  return (
    <main className="tela-cheia">
      <Marca />
      <div className="mt-6 flex justify-center">
        <Coroa velas={0} largura={260} />
      </div>
      <h1 className="font-titulo mt-4" style={{ fontSize: 32, fontWeight: 500, lineHeight: 1.1, letterSpacing: '-0.015em' }}>
        A melhor preparação para o Natal da sua vida
      </h1>
      <p className="mt-2" style={{ fontSize: 15, lineHeight: 1.45, color: 'var(--text-2)' }}>
        Entre com o e-mail da sua compra. Enviamos um link de acesso, sem senha.
      </p>
      <Suspense>
        <FormEntrar />
      </Suspense>
    </main>
  )
}
