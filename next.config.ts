import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Os arquivos de conteúdo e as fontes das artes são lidos do disco no servidor.
  outputFileTracingIncludes: {
    '/**': ['./content/**/*', './assets/**/*', './public/illustrations/**/*'],
  },
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
    ]
  },
}

export default nextConfig
