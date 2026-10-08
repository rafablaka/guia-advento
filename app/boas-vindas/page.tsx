import { exigirSessao, meuGrupo } from '@/lib/sessao'
import { Onboarding } from './Onboarding'

export const metadata = { title: 'Boas-vindas · Guia do Advento' }

export default async function BoasVindas({ searchParams }: { searchParams: Promise<{ convite?: string }> }) {
  const { perfil } = await exigirSessao({ onboarding: false })
  const grupo = await meuGrupo()
  const { convite } = await searchParams
  return (
    <Onboarding
      nomeInicial={perfil.nome || ''}
      horaInicial={perfil.lembrete_hora.slice(0, 5)}
      plano={perfil.plano}
      grupoAtual={grupo?.nome ?? null}
      convite={convite ?? null}
    />
  )
}
