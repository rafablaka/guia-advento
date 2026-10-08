const CORES = ['#553070', '#315B4C', '#244C75', '#96476A', '#4F806C', '#74508B']

export function iniciaisDoNome(nome: string) {
  const p = nome.trim().split(/\s+/)
  return ((p[0]?.[0] || '') + (p[1]?.[0] || '')).toUpperCase() || '?'
}

export function Avatar({ nome, indice, apagado = false, tamanho = 32, sobreposto = false }: {
  nome: string
  indice: number
  apagado?: boolean
  tamanho?: number
  sobreposto?: boolean
}) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: tamanho,
        height: tamanho,
        marginLeft: sobreposto ? -10 : 0,
        fontSize: 12,
        fontWeight: 600,
        boxSizing: 'border-box',
        color: apagado ? 'var(--text-3)' : '#F7EEDC',
        background: apagado ? 'var(--bg)' : CORES[indice % CORES.length],
        border: apagado ? '1.5px dashed var(--tracejado)' : '2px solid var(--surface)',
      }}
    >
      {iniciaisDoNome(nome)}
    </span>
  )
}
