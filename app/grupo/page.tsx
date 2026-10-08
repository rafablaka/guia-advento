import NextLink from 'next/link'
import { exigirSessao, meuGrupo } from '@/lib/sessao'
import { diasDaSemana, retrospectivasLiberadas, semanaDoDia, velasAcesas } from '@/lib/calendario'
import { NavInferior } from '@/components/NavInferior'
import { Coroa } from '@/components/Coroa'
import { Avatar } from '@/components/Avatares'
import { Cadeado, Check } from '@/components/Icones'
import { AvisoDataTeste } from '@/components/AvisoDataTeste'
import { AcoesGrupo, ConviteGrupo, SairDoGrupo } from './AcoesGrupo'

export const metadata = { title: 'Grupo · Guia do Advento' }

export default async function Grupo() {
  const { perfil, hoje, dia, fase } = await exigirSessao()
  const grupo = perfil.plano === 'completo' ? await meuGrupo() : null

  return (
    <>
      <main className="tela">
        <AvisoDataTeste data={hoje.data} simulada={hoje.simulada} />
        {perfil.plano !== 'completo' ? (
          <Bloqueado />
        ) : !grupo ? (
          <SemGrupo />
        ) : (
          <ComGrupo grupo={grupo} dia={fase === 'jornada' ? dia : fase === 'natal' ? 27 : 0} data={hoje.data} />
        )}
      </main>
      <NavInferior />
    </>
  )
}

function Cabeca({ titulo, sub }: { titulo: string; sub: string }) {
  return (
    <>
      <h1 className="font-titulo" style={{ fontSize: 34, fontWeight: 500, lineHeight: 1.1, letterSpacing: '-0.015em' }}>
        {titulo}
      </h1>
      <p className="mt-1.5" style={{ fontSize: 14, lineHeight: 1.45, color: 'var(--text-2)' }}>
        {sub}
      </p>
    </>
  )
}

function Bloqueado() {
  return (
    <>
      <Cabeca titulo="Coroa em grupo" sub="Amigos, família ou paróquia vivendo o mesmo dia, cada um no seu ritmo." />
      <div className="mt-4 flex justify-center opacity-60">
        <Coroa velas={0} largura={260} />
      </div>
      <ul className="mt-4 flex flex-col gap-2">
        {[
          'Alguém cria o grupo e convida por link.',
          'Todos fazem o mesmo dia, cada um na sua hora.',
          'A coroa do grupo só acende quando todos completam o dia.',
          'Sem ranking e sem comparação: o incentivo é cuidar do outro.',
        ].map((t) => (
          <li key={t} className="cartao flex items-start gap-3 px-4 py-3" style={{ fontSize: 14, lineHeight: 1.4, color: 'var(--text-2)' }}>
            <Check />
            {t}
          </li>
        ))}
      </ul>
      <div className="cartao mt-4 flex items-center gap-3 p-4">
        <span style={{ color: 'var(--text-3)' }}>
          <Cadeado />
        </span>
        <p className="flex-1" style={{ fontSize: 14, color: 'var(--text-2)' }}>
          O grupo faz parte do plano Completo, junto com os áudios.
        </p>
      </div>
      <NextLink href="/upgrade" className="botao-principal mt-4">
        Fazer upgrade por R$ 27
      </NextLink>
    </>
  )
}

function SemGrupo() {
  return (
    <>
      <Cabeca titulo="Viva o Advento em grupo" sub="A coroa do grupo só acende quando todos completam o dia. Sem ranking, sem chat: só cuidar uns dos outros." />
      <AcoesGrupo />
    </>
  )
}

function ComGrupo({ grupo, dia, data }: { grupo: NonNullable<Awaited<ReturnType<typeof meuGrupo>>>; dia: number; data: string }) {
  const total = grupo.membros.length
  const acesoNoDia = (d: number) => grupo.membros.every((m) => m.completos.includes(d))
  const rezaramHoje = dia >= 1 && dia <= 26 ? grupo.membros.filter((m) => m.completos.includes(dia)).length : 0
  const semana = dia >= 1 ? semanaDoDia(Math.min(dia, 26)) : 1
  const diasSemana = diasDaSemana(semana).filter((d) => d <= dia)
  const acesos = diasSemana.filter(acesoNoDia).length
  const retro = retrospectivasLiberadas(data)

  return (
    <>
      <p className="sobrancelha">Seu grupo</p>
      <h1 className="font-titulo mt-1" style={{ fontSize: 34, fontWeight: 500, lineHeight: 1.1, letterSpacing: '-0.015em' }}>
        {grupo.nome}
      </h1>
      <div className="mt-3 flex justify-center">
        <Coroa velas={velasAcesas(data)} largura={260} />
      </div>
      {dia >= 1 && dia <= 26 ? (
        <p className="font-titulo mt-1 text-center" style={{ fontStyle: 'italic', fontSize: 17, color: 'var(--accent)' }}>
          {rezaramHoje === total ? 'Todos rezaram hoje. A coroa do grupo acendeu.' : `${rezaramHoje} de ${total} já ${rezaramHoje === 1 ? 'rezou' : 'rezaram'} hoje`}
        </p>
      ) : (
        <p className="mt-1 text-center" style={{ fontSize: 14, color: 'var(--text-2)' }}>
          {dia < 1 ? 'O grupo já está formado. A primeira vela acende em 29/11.' : 'A jornada do grupo terminou. Feliz Natal!'}
        </p>
      )}

      {dia >= 1 && diasSemana.length > 0 && (
        <div className="cartao mt-4 px-4 py-3">
          <p style={{ fontSize: 14, color: 'var(--text-2)' }}>
            Nesta semana, a coroa do grupo acendeu <strong style={{ color: 'var(--text)' }}>{acesos}</strong> de {diasSemana.length}{' '}
            {diasSemana.length === 1 ? 'dia' : 'dias'}.
          </p>
          <div className="mt-2 flex gap-1.5" aria-hidden="true">
            {diasSemana.map((d) => (
              <span key={d} className="flex-1" style={{ height: 4, borderRadius: 2, background: acesoNoDia(d) ? 'var(--accent)' : 'var(--track)' }} />
            ))}
          </div>
        </div>
      )}

      <h2 className="sobrancelha mt-6">Quem está junto</h2>
      <ul className="mt-2.5 flex flex-col gap-2">
        {grupo.membros.map((m, i) => {
          const rezou = dia >= 1 && dia <= 26 && m.completos.includes(dia)
          return (
            <li key={m.id} className="cartao flex items-center gap-3 px-3.5 py-2.5">
              <Avatar nome={m.nome} indice={i} apagado={dia >= 1 && !rezou} />
              <span className="flex-1" style={{ fontSize: 15, fontWeight: 600 }}>
                {m.nome}
                {m.eu ? <span style={{ fontWeight: 400, color: 'var(--text-3)' }}> · você</span> : null}
              </span>
              {dia >= 1 && dia <= 26 && (
                <span className="flex items-center gap-1" style={{ fontSize: 13, color: rezou ? 'var(--accent)' : 'var(--text-3)' }}>
                  {rezou ? (
                    <>
                      <Check tamanho={16} /> rezou hoje
                    </>
                  ) : (
                    'ainda não'
                  )}
                </span>
              )}
            </li>
          )
        })}
      </ul>

      {(retro.semanas.length > 0 || retro.final) && (
        <>
          <h2 className="sobrancelha mt-6">Retrospectivas do grupo</h2>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {retro.semanas.map((s) => (
              <NextLink key={s} href={`/retrospectiva/grupo-${s}`} className="botao-secundario">
                {s}ª semana
              </NextLink>
            ))}
            {retro.final && (
              <NextLink href="/retrospectiva/grupo-final" className="botao-secundario">
                Jornada inteira
              </NextLink>
            )}
          </div>
        </>
      )}

      <div className="cartao mt-6 p-4">
        <p style={{ fontSize: 15, fontWeight: 600 }}>Convide mais gente</p>
        <p className="mt-1 mb-3" style={{ fontSize: 13, color: 'var(--text-2)' }}>
          Quem tiver o plano Completo entra pelo link. O grupo pode se formar a qualquer momento.
        </p>
        <ConviteGrupo codigo={grupo.codigo} nome={grupo.nome} />
      </div>
      <SairDoGrupo />
    </>
  )
}
