import NextLink from 'next/link'
import { exigirSessao, meuGrupo, meuProgresso, primeiroNome } from '@/lib/sessao'
import {
  FRASE_DA_VELA,
  TOTAL_DIAS,
  dataDoDia,
  diasDaSemana,
  diasParaComecar,
  horaEmSP,
  nomeCurto,
  retrospectivasLiberadas,
  saudacao,
  semanaDoDia,
  subtituloDoDia,
  velasAcesas,
} from '@/lib/calendario'
import { diaCompleto, diasParaRecuperar, estadoDaPorta, sequenciaAtual } from '@/lib/progresso'
import { carregarDia, minutosDoDia } from '@/lib/conteudo'
import { LINK_COMPRA } from '@/lib/config'
import { Cabecalho } from '@/components/Cabecalho'
import { Coroa } from '@/components/Coroa'
import { NavInferior } from '@/components/NavInferior'
import { Porta } from '@/components/Portas'
import { Avatar } from '@/components/Avatares'
import { BotaoCompartilhar } from '@/components/BotaoCompartilhar'
import { Cadeado, Check, Chevron, Seta } from '@/components/Icones'
import { AvisoDataTeste } from '@/components/AvisoDataTeste'

export default async function Inicio() {
  const { perfil, user, hoje, dia, fase } = await exigirSessao()
  const progresso = await meuProgresso()
  const grupo = perfil.plano === 'completo' ? await meuGrupo() : null
  const nome = primeiroNome(perfil)
  const inicial = nome[0]?.toUpperCase() || ''
  const velas = velasAcesas(hoje.data)
  const sequencia = fase === 'espera' ? null : sequenciaAtual(progresso, dia)

  return (
    <>
      <main className="tela">
        <AvisoDataTeste data={hoje.data} simulada={hoje.simulada} />
        <Cabecalho sequencia={sequencia} inicial={inicial} />
        {fase === 'espera' && <Espera data={hoje.data} nome={nome} plano={perfil.plano} temGrupo={!!grupo} hora={perfil.lembrete_hora} userId={user.id} />}
        {fase === 'jornada' && (
          <Jornada data={hoje.data} dia={dia} nome={nome} velas={velas} progresso={progresso} grupo={grupo} plano={perfil.plano} />
        )}
        {fase === 'natal' && <Natal nome={nome} recuperar={diasParaRecuperar(progresso, dia).length} />}
      </main>
      <NavInferior />
    </>
  )
}

function Titulo({ children, sub, cor }: { children: React.ReactNode; sub: string; cor?: string }) {
  return (
    <div className="mt-[18px]">
      <h1 className="font-titulo" style={{ margin: 0, fontWeight: 500, fontSize: 34, lineHeight: 1.1, letterSpacing: '-0.015em', color: cor }}>
        {children}
      </h1>
      <p className="mt-1.5" style={{ fontSize: 14, color: 'var(--text-2)' }}>
        {sub}
      </p>
    </div>
  )
}

async function Jornada(p: {
  data: string
  dia: number
  nome: string
  velas: number
  progresso: Awaited<ReturnType<typeof meuProgresso>>
  grupo: Awaited<ReturnType<typeof meuGrupo>>
  plano: 'simples' | 'completo'
}) {
  const conteudo = await carregarDia(p.dia)
  const semana = semanaDoDia(p.dia)
  const dias = diasDaSemana(semana)
  const linhaHoje = p.progresso.get(p.dia)
  const completo = diaCompleto(linhaHoje)
  const fechado = !!linhaHoje?.fechar_em
  const recuperar = diasParaRecuperar(p.progresso, p.dia)
  const retro = retrospectivasLiberadas(p.data)
  const ultimaRetro = retro.semanas.at(-1)
  const gaudete = semana === 3

  return (
    <>
      <Titulo sub={subtituloDoDia(p.data)}>{`${saudacao(horaEmSP())}${p.nome ? `, ${p.nome}` : ''}`}</Titulo>
      <div className="mt-3 flex justify-center">
        <Coroa velas={p.velas} />
      </div>
      <p className="font-titulo mt-1.5 text-center" style={{ fontStyle: 'italic', fontSize: 17, color: gaudete ? 'var(--gaudete-texto)' : 'var(--accent)' }}>
        {FRASE_DA_VELA[p.velas]}
      </p>

      <CartaoGrupo grupo={p.grupo} plano={p.plano} dia={p.dia} />

      <section className="mt-[18px]" aria-labelledby="titulo-caminho">
        <div className="flex items-baseline justify-between">
          <h2 id="titulo-caminho" className="sobrancelha">
            Seu caminho
          </h2>
          {ultimaRetro && (
            <NextLink href={`/retrospectiva/${ultimaRetro}`} style={{ fontSize: 13, fontWeight: 500, color: 'var(--gold)', textDecoration: 'none' }}>
              Retrospectiva da semana
            </NextLink>
          )}
        </div>
        <div className="mt-2.5 grid grid-cols-7 gap-2">
          {dias.map((d) => {
            const estado = estadoDaPorta(p.progresso, d, p.dia)
            const ehHoje = d === p.dia
            return (
              <div key={d} className="flex flex-col items-center gap-1.5">
                <span style={{ fontSize: 11, fontWeight: ehHoje ? 600 : 400, color: ehHoje ? 'var(--accent)' : 'var(--text-3)' }}>
                  {ehHoje ? 'Hoje' : nomeCurto(dataDoDia(d))}
                </span>
                <Porta dia={d} estado={ehHoje && estado === 'concluida' ? 'concluida' : estado} />
              </div>
            )
          })}
        </div>
        {recuperar.length > 0 && (
          <NextLink
            href="/caminho"
            className="mt-3 flex min-h-11 items-center justify-between no-underline"
            style={{ fontSize: 13, color: 'var(--text-2)' }}
          >
            <span>
              {recuperar.length === 1 ? '1 dia para recuperar' : `${recuperar.length} dias para recuperar`}
              {recuperar.includes(p.dia - 1) ? ' · ontem ainda conta na sequência' : ''}
            </span>
            <Chevron tamanho={18} />
          </NextLink>
        )}
      </section>

      <NextLink
        href={`/dia/${p.dia}${completo && !fechado ? '#fechar' : ''}`}
        className="mt-5 flex items-center justify-between no-underline"
        style={{ minHeight: 62, padding: '10px 11px 10px 22px', borderRadius: 31, color: '#FFFFFF', background: 'var(--primary)' }}
      >
        <span className="flex flex-col">
          <span style={{ fontSize: 17, fontWeight: 600 }}>
            {!completo ? 'Abrir a porta de hoje' : !fechado ? 'Fechar o dia' : 'Porta de hoje concluída'}
          </span>
          <span style={{ marginTop: 1, fontSize: 12.5, color: 'var(--primary-sub)' }}>
            {!completo
              ? `${conteudo?.santo.nome ?? 'Conteúdo a caminho'} · ${minutosDoDia(conteudo)} min`
              : !fechado
                ? 'Cumpriu a missão? Que frase ficou?'
                : p.dia < TOTAL_DIAS
                  ? 'A próxima porta abre à meia-noite'
                  : 'Amanhã é Natal'}
          </span>
        </span>
        <span className="flex items-center justify-center rounded-full" style={{ width: 42, height: 42, background: 'var(--primary-deep)' }}>
          {fechado ? <Check cor="#FFFFFF" /> : <Seta />}
        </span>
      </NextLink>
    </>
  )
}

function CartaoGrupo({ grupo, plano, dia }: { grupo: Awaited<ReturnType<typeof meuGrupo>>; plano: string; dia: number }) {
  const estiloCartao = 'cartao mt-4 flex w-full items-center gap-3 px-3.5 py-3 text-left no-underline'
  if (plano !== 'completo')
    return (
      <NextLink href="/grupo" className={estiloCartao} style={{ color: 'var(--text)' }}>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center" style={{ color: 'var(--text-3)' }}>
          <Cadeado />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block" style={{ fontSize: 15, fontWeight: 600 }}>
            Coroa em grupo
          </span>
          <span className="mt-0.5 block" style={{ fontSize: 13, color: 'var(--text-2)' }}>
            No Completo, a coroa acende quando todos rezam
          </span>
        </span>
        <Chevron />
      </NextLink>
    )
  if (!grupo)
    return (
      <NextLink href="/grupo" className={estiloCartao} style={{ color: 'var(--text)' }}>
        <span className="min-w-0 flex-1">
          <span className="block" style={{ fontSize: 15, fontWeight: 600 }}>
            Viva o Advento em grupo
          </span>
          <span className="mt-0.5 block" style={{ fontSize: 13, color: 'var(--text-2)' }}>
            Amigos, família ou paróquia: convide por link
          </span>
        </span>
        <Chevron />
      </NextLink>
    )
  const rezaram = grupo.membros.filter((m) => m.completos.includes(dia)).length
  return (
    <NextLink href="/grupo" className={estiloCartao} style={{ color: 'var(--text)' }}>
      <span className="flex shrink-0">
        {grupo.membros.slice(0, 5).map((m, i) => (
          <Avatar key={m.id} nome={m.nome} indice={i} apagado={!m.completos.includes(dia)} sobreposto={i > 0} />
        ))}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block" style={{ fontSize: 15, fontWeight: 600 }}>
          Sua coroa em grupo
        </span>
        <span className="mt-0.5 block" style={{ fontSize: 13, color: 'var(--text-2)' }}>
          {rezaram === grupo.membros.length
            ? 'Todos rezaram hoje. A coroa acendeu.'
            : `${rezaram} de ${grupo.membros.length} já ${rezaram === 1 ? 'rezou' : 'rezaram'} hoje`}
        </span>
      </span>
      <Chevron />
    </NextLink>
  )
}

function Espera(p: { data: string; nome: string; plano: 'simples' | 'completo'; temGrupo: boolean; hora: string; userId: string }) {
  const faltam = diasParaComecar(p.data)
  const link = LINK_COMPRA || `/c?ref=${p.userId.slice(0, 8)}`
  return (
    <>
      <Titulo sub="O Advento começa no domingo, 29 de novembro">
        {faltam === 1 ? 'Falta 1 dia para acender a primeira vela' : `Faltam ${faltam} dias para acender a primeira vela`}
      </Titulo>
      <div className="mt-3 flex justify-center">
        <Coroa velas={0} />
      </div>

      <h2 className="sobrancelha mt-5">Deixe tudo pronto</h2>
      <div className="mt-2.5 flex flex-col gap-2">
        <ItemSetup href="/voce#instalar" titulo="Instalar na tela inicial" texto="Para abrir como app e receber o lembrete" />
        <ItemSetup href="/voce#lembrete" titulo={`Lembrete às ${p.hora.slice(0, 5)}`} texto="Ativar notificações e ajustar o horário" />
        {p.plano === 'completo' ? (
          <ItemSetup
            href="/grupo"
            titulo={p.temGrupo ? 'Seu grupo está formado' : 'Criar ou entrar num grupo'}
            texto={p.temGrupo ? 'Convide mais gente antes de começar' : 'O grupo já se forma antes do Advento'}
          />
        ) : (
          <ItemSetup href="/upgrade" titulo="Áudios e grupo no Completo" texto="Upgrade pela diferença, a qualquer momento" bloqueado />
        )}
      </div>

      <div className="cartao mt-4 p-4">
        <p className="font-titulo" style={{ fontSize: 19, fontStyle: 'italic', lineHeight: 1.35, color: 'var(--quote)' }}>
          “Vou viver o Advento com o Guia. Vem comigo?”
        </p>
        <p className="mt-1.5 mb-3" style={{ fontSize: 13, color: 'var(--text-2)' }}>
          Convide quem você quer levar junto. A arte sai pronta para Stories e WhatsApp.
        </p>
        <BotaoCompartilhar arte="/api/arte?tipo=convite" texto="Vou viver o Advento com o Guia. Vem comigo?" link={link} tipo="convite" rotulo="Enviar convite" />
      </div>
    </>
  )
}

function ItemSetup({ href, titulo, texto, bloqueado }: { href: string; titulo: string; texto: string; bloqueado?: boolean }) {
  return (
    <NextLink href={href} className="cartao flex items-center gap-3 px-4 py-3 no-underline" style={{ color: 'var(--text)', minHeight: 64 }}>
      <span className="min-w-0 flex-1">
        <span className="block" style={{ fontSize: 15, fontWeight: 600 }}>
          {titulo}
        </span>
        <span className="mt-0.5 block" style={{ fontSize: 13, color: 'var(--text-2)' }}>
          {texto}
        </span>
      </span>
      {bloqueado ? (
        <span style={{ color: 'var(--text-3)' }}>
          <Cadeado />
        </span>
      ) : (
        <Chevron />
      )}
    </NextLink>
  )
}

function Natal({ nome, recuperar }: { nome: string; recuperar: number }) {
  return (
    <>
      <Titulo sub="Natal do Senhor">{`Feliz Natal${nome ? `, ${nome}` : ''}`}</Titulo>
      <div className="mt-3 flex justify-center">
        <Coroa velas={4} />
      </div>
      <p className="font-titulo mt-1.5 text-center" style={{ fontStyle: 'italic', fontSize: 17, color: 'var(--accent)' }}>
        A coroa está completa
      </p>
      <NextLink href="/retrospectiva/final" className="botao-principal mt-6">
        Ver a retrospectiva da jornada
      </NextLink>
      {recuperar > 0 && (
        <NextLink href="/caminho" className="botao-secundario mt-3 w-full">
          {recuperar === 1 ? 'Ainda dá para fazer 1 dia' : `Ainda dá para fazer ${recuperar} dias`}
        </NextLink>
      )}
    </>
  )
}
