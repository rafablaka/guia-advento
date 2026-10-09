// Valores públicos (a chave "publishable" do Supabase foi feita para ficar no navegador).
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fffgzyhklnhqqwxorbvt.supabase.co'
export const SUPABASE_CHAVE_PUBLICA =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_cGGV3kUczPtU9HG6hPMknQ_r6xN1ld7'

// Modo de teste: libera a data simulada, a troca de plano e o painel para qualquer conta.
// Desligar (MODO_TESTE=0) quando a integração com a Guru estiver pronta.
export const MODO_TESTE = process.env.NEXT_PUBLIC_MODO_TESTE !== '0'

// Link de compra (Guru). Enquanto não existe, os convites apontam para a página de convite do app.
export const LINK_COMPRA = process.env.NEXT_PUBLIC_LINK_COMPRA || ''
