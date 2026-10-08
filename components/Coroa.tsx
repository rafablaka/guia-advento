const DESCRICAO: Record<number, string> = {
  0: 'Coroa do Advento em estilo vitral com as quatro velas ainda apagadas',
  1: 'Coroa do Advento em estilo vitral com a primeira vela roxa acesa',
  2: 'Coroa do Advento em estilo vitral com duas velas roxas acesas',
  3: 'Coroa do Advento em estilo vitral com três velas acesas: duas roxas e a rosa',
  4: 'Coroa do Advento em estilo vitral com as quatro velas acesas',
}

export function Coroa({ velas, largura = 320, className }: { velas: number; largura?: number; className?: string }) {
  const v = Math.max(0, Math.min(4, velas))
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/illustrations/coroa-${v}.svg`}
      alt={DESCRICAO[v]}
      width={largura}
      height={Math.round((largura * 3) / 4)}
      className={className}
      style={{ display: 'block', width: largura, maxWidth: '100%', height: 'auto' }}
    />
  )
}
