type P = { tamanho?: number; className?: string; cor?: string }

const base = (t = 20) => ({
  width: t,
  height: t,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
})

export const Estrela = ({ tamanho = 14, cor = 'var(--gold)' }: P) => (
  <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 1.5c.7 5 1.8 6.1 6.8 6.8-5 .7-6.1 1.8-6.8 6.8-.7-5-1.8-6.1-6.8-6.8 5-.7 6.1-1.8 6.8-6.8z" fill={cor} />
  </svg>
)
export const Chama = ({ tamanho = 18, className }: P) => (
  <svg {...base(tamanho)} className={className} stroke="var(--accent)">
    <path d="M12 3.5c1.2 2.8 4.5 5 4.5 9a4.5 4.5 0 0 1-9 0c0-2 1-3.4 2-4.3.3 1.3 1 2.1 1.8 2.3-.4-2.6.2-4.9.7-7z" />
  </svg>
)
export const Seta = ({ tamanho = 20 }: P) => (
  <svg {...base(tamanho)} strokeWidth={1.9}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)
export const SetaVoltar = ({ tamanho = 20 }: P) => (
  <svg {...base(tamanho)} strokeWidth={1.9}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
)
export const Chevron = ({ tamanho = 20 }: P) => (
  <svg {...base(tamanho)}>
    <path d="m9 6 6 6-6 6" />
  </svg>
)
export const ChevronCima = ({ tamanho = 18 }: P) => (
  <svg {...base(tamanho)} strokeWidth={1.9} stroke="var(--accent)">
    <path d="m6 15 6-6 6 6" />
  </svg>
)
export const Fechar = ({ tamanho = 18 }: P) => (
  <svg {...base(tamanho)} strokeWidth={1.9}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)
export const Check = ({ tamanho = 18, cor = 'var(--accent)' }: P) => (
  <svg {...base(tamanho)} strokeWidth={2} stroke={cor}>
    <path d="m5 12.5 4.2 4L19 7" />
  </svg>
)
export const Play = ({ tamanho = 20 }: P) => (
  <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M8 5.5v13a1 1 0 0 0 1.5.9l10.4-6.5a1 1 0 0 0 0-1.8L9.5 4.6A1 1 0 0 0 8 5.5z" fill="#FFFFFF" />
  </svg>
)
export const Pausa = ({ tamanho = 20 }: P) => (
  <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" aria-hidden="true">
    <rect x="6.5" y="5" width="4" height="14" rx="1" fill="#FFFFFF" />
    <rect x="13.5" y="5" width="4" height="14" rx="1" fill="#FFFFFF" />
  </svg>
)
export const Cadeado = ({ tamanho = 18 }: P) => (
  <svg {...base(tamanho)}>
    <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
    <path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3" />
  </svg>
)
export const Compartilhar = ({ tamanho = 20 }: P) => (
  <svg {...base(tamanho)}>
    <path d="M12 15V3.5M7.5 8 12 3.5 16.5 8" />
    <path d="M5 12.5V19a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19v-6.5" />
  </svg>
)
export const Sino = ({ tamanho = 20 }: P) => (
  <svg {...base(tamanho)}>
    <path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2H4.5z" />
    <path d="M10 20.5a2 2 0 0 0 4 0" />
  </svg>
)
export const Celular = ({ tamanho = 20 }: P) => (
  <svg {...base(tamanho)}>
    <rect x="6.5" y="2.5" width="11" height="19" rx="2.5" />
    <path d="M11 18.5h2" />
  </svg>
)
export const Link = ({ tamanho = 20 }: P) => (
  <svg {...base(tamanho)}>
    <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
    <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
  </svg>
)
export const IconeInicio = () => (
  <svg {...base(22)} strokeWidth={1.7}>
    <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1z" />
  </svg>
)
export const IconeCaminho = () => (
  <svg {...base(22)} strokeWidth={1.7}>
    <path d="M6 21V10a6 6 0 0 1 12 0v11" />
    <path d="M4 21h16" />
    <path d="M14.5 15h.01" />
  </svg>
)
export const IconeGrupo = () => (
  <svg {...base(22)} strokeWidth={1.7}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5" />
    <circle cx="17" cy="9" r="2.6" />
    <path d="M15.8 14.2c2.4.2 4.1 1.8 4.7 4.8" />
  </svg>
)
export const IconeVoce = () => (
  <svg {...base(22)} strokeWidth={1.7}>
    <circle cx="12" cy="8" r="3.6" />
    <path d="M5 20c.8-3.8 3.6-6 7-6s6.2 2.2 7 6" />
  </svg>
)
export const Compartilhar2 = Compartilhar
