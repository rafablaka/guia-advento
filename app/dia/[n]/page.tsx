import NextLink from 'next/link'
import { notFound } from 'next/navigation'
import { exigirSessao, meuProgresso } from '@/lib/sessao'
import { carregarDia, frasesDoDia, iniciais } from '@/lib/conteudo'
import { TOTAL_DIAS, dataDoDia, dataPorExtenso, diferencaDias, velasAcesas } from '@/lib/calendario'
import { sequenciaAtual } from '@/lib/progresso'
import { Fechar } from '@/components/Icones'
import { Coroa } from '@/components/Coroa'
import { Ritual } from './Ritual'

export default async function Dia({ params }: { params: Promise<{ n: string }> }) {
  const n = Number((await params).n)
  if (!Number.isInteger(n) || n < 1 || n > TOTAL_DIAS) notFound()
  const { perfil, hoje, dia } = await exigirSessao()

  // Datas futuras ficam fechadas, mesmo que o conteúdo já exista.
  if (n > dia) return <PortaFechada n={n} hoje={hoje.data} />

  const conteudo = await carregarDia(n)
  if (!conteudo) return <SemConteudo n={n} />

  const progresso = await meuProgresso()
  const linha = progresso.get(n) ?? null

  return (
    <Ritual
      conteudo={conteudo}
      iniciais={iniciais(conteudo.santo.nome)}
      linha={linha}
      bloqueado={perfil.plano !== 'completo'}
      hoje={dia}
      frases={frasesDoDia(conteudo)}
      velas={velasAcesas(hoje.data)}
      sequencia={sequenciaAtual(progresso, dia)}
      recuperando={n < dia && !linha?.completo_no_dia}
    />
  )
}

function Moldura({ children }: { children: React.ReactNode }) {
  return (
    <main className="tela-cheia">
      <div className="flex justify-end">
        <NextLink href="/" aria-label="Fechar" className="botao-redondo">
          <Fechar />
        </NextLink>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center text-center">{children}</div>
    </main>
  )
}

function PortaFechada({ n, hoje }: { n: number; hoje: string }) {
  const data = dataDoDia(n)
  const faltam = diferencaDias(data, hoje)
  return (
    <Moldura>
      <Coroa velas={velasAcesas(hoje)} largura={220} />
      <h1 className="font-titulo mt-4" style={{ fontSize: 28, fontWeight: 500 }}>
        Esta porta ainda está fechada
      </h1>
      <p className="mt-2" style={{ fontSize: 15, color: 'var(--text-2)' }}>
        O dia {n} abre em {dataPorExtenso(data)}, à meia-noite.{' '}
        {faltam === 1 ? 'Falta 1 dia.' : `Faltam ${faltam} dias.`}
      </p>
      <NextLink href="/" className="botao-secundario mt-6">
        Voltar ao início
      </NextLink>
    </Moldura>
  )
}

function SemConteudo({ n }: { n: number }) {
  return (
    <Moldura>
      <h1 className="font-titulo" style={{ fontSize: 28, fontWeight: 500 }}>
        O dia {n} está a caminho
      </h1>
      <p className="mt-2" style={{ fontSize: 15, color: 'var(--text-2)' }}>
        O conteúdo deste dia ainda está em revisão. Volte daqui a pouco.
      </p>
      <NextLink href="/" className="botao-secundario mt-6">
        Voltar ao início
      </NextLink>
    </Moldura>
  )
}
