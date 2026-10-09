import { ImageResponse } from 'next/og'

// Ícone provisório: estrela dourada sobre violeta litúrgico. Trocar pela arte final.
export function imagemDoIcone(tamanho: number, mascara = false) {
  const estrela = Math.round(tamanho * (mascara ? 0.42 : 0.56))
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1B1224',
        }}
      >
        <div
          style={{
            width: mascara ? '100%' : '86%',
            height: mascara ? '100%' : '86%',
            borderRadius: mascara ? 0 : '22%',
            background: '#553070',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width={estrela} height={estrela} viewBox="0 0 24 24">
            <path d="M12 1.5c.7 5 1.8 6.1 6.8 6.8-5 .7-6.1 1.8-6.8 6.8-.7-5-1.8-6.1-6.8-6.8 5-.7 6.1-1.8 6.8-6.8z" fill="#E1B65A" />
            <circle cx="12" cy="20" r="1.6" fill="#E1B65A" />
          </svg>
        </div>
      </div>
    ),
    { width: tamanho, height: tamanho },
  )
}
