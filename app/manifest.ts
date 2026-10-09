import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Guia do Advento',
    short_name: 'Advento',
    description: '26 dias para viver o Advento: ouvir um santo, rezar e cumprir uma missão.',
    lang: 'pt-BR',
    start_url: '/?origem=app',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#1B1224',
    theme_color: '#1B1224',
    icons: [
      { src: '/icones/192', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icones/512', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icones/512?mascara=1', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
