// Gera os 26 arquivos de conteúdo de rascunho em content/dias/.
// Não sobrescreve arquivos que já existem (o conteúdo real chega em levas e substitui estes).
// Uso: node scripts/gerar-rascunhos.mjs [--forcar]
import { existsSync, writeFileSync } from 'node:fs'

const forcar = process.argv.includes('--forcar')
const INICIO = Date.UTC(2026, 10, 29)
const AFONSO = { nome: 'Santo Afonso de Ligório', titulo: 'Doutor da Igreja', retrato: null }
const DOMINGOS = {
  1: AFONSO,
  // Ordem dos santos convidados ainda a definir.
  8: { nome: 'Santo Agostinho', titulo: 'Doutor da Igreja', retrato: null },
  15: { nome: 'São Bernardo de Claraval', titulo: 'Doutor da Igreja', retrato: null },
  22: { nome: 'São John Henry Newman', titulo: 'Doutor da Igreja', retrato: null },
}
const ANTIFONAS = { 19: ['S', 'O Sapientia'], 20: ['A', 'O Adonai'], 21: ['R', 'O Radix'], 22: ['C', 'O Clavis'], 23: ['O', 'O Oriens'], 24: ['R', 'O Rex'], 25: ['E', 'O Emmanuel'] }

for (let n = 1; n <= 26; n++) {
  const data = new Date(INICIO + (n - 1) * 86400000).toISOString().slice(0, 10)
  const arquivo = `content/dias/${data}.json`
  if (existsSync(arquivo) && !forcar) continue
  const semana = n <= 7 ? 1 : n <= 14 ? 2 : n <= 21 ? 3 : 4
  let tipo = 'comum'
  let santo = AFONSO
  if (DOMINGOS[n]) { tipo = 'domingo'; santo = DOMINGOS[n] }
  if (ANTIFONAS[n] && !DOMINGOS[n]) tipo = 'antifona'
  if (n === 10) { tipo = 'solenidade'; santo = { nome: 'Imaculada Conceição', titulo: 'Solenidade', retrato: null } }
  if (n === 26) tipo = 'vespera'
  const antifona = ANTIFONAS[n] ? { latim: ANTIFONAS[n][1], texto: `[RASCUNHO] Texto da antífona ${ANTIFONAS[n][1]}` } : null
  const conteudo = {
    dia: n,
    data,
    tipo,
    semana,
    santo,
    titulo: `[RASCUNHO] Título do dia ${n}`,
    citacao: { texto: `[RASCUNHO] Citação curta do dia ${n}`, autor: `[RASCUNHO] ${santo.nome}` },
    ouvir: {
      slides: [
        `[RASCUNHO] Trecho fiel de ${santo.nome} para o dia ${n}.`,
        '[RASCUNHO] Explicação atual do trecho, ligada ao dia a dia.',
        '[RASCUNHO] Uma pergunta para levar para a oração.',
      ],
      audio: '/audio/exemplo.wav',
      duracao_seg: 24,
    },
    rezar: { texto: `[RASCUNHO] Oração guiada do dia ${n}, a partir do texto de hoje.`, audio: '/audio/exemplo.wav', duracao_seg: 24 },
    agir: { missao: `[RASCUNHO] Missão concreta do dia ${n}.` },
    ilustracao: {
      arquivo: 'anunciacao.svg',
      credito: 'A Anunciação · releitura a partir de Fra Angelico',
      alt: 'A Anunciação em estilo vitral: a pomba do Espírito Santo desce em raios dourados sobre um lírio, sob um arco ogival',
    },
    antifona,
    frases: [
      { texto: `[RASCUNHO] Citação curta do dia ${n}`, autor: `[RASCUNHO] ${santo.nome}` },
      { texto: `[RASCUNHO] Outra frase marcante do dia ${n}`, autor: `[RASCUNHO] ${santo.nome}` },
      { texto: `[RASCUNHO] Frase da oração do dia ${n}`, autor: 'Oração do dia' },
    ],
  }
  writeFileSync(arquivo, JSON.stringify(conteudo, null, 2) + '\n')
}
console.log('Rascunhos prontos em content/dias/')
