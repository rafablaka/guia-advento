import NextLink from 'next/link'

export default function NaoEncontrado() {
  return (
    <main className="tela-cheia items-center justify-center text-center">
      <h1 className="font-titulo" style={{ fontSize: 28, fontWeight: 500 }}>
        Esta página não existe
      </h1>
      <NextLink href="/" className="botao-secundario mt-6">
        Voltar ao início
      </NextLink>
    </main>
  )
}
