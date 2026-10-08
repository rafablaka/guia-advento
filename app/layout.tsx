import type { Metadata, Viewport } from 'next'
import { DM_Sans, Fraunces } from 'next/font/google'
import { contexto } from '@/lib/sessao'
import { ehGaudete } from '@/lib/calendario'
import { RegistrarServiceWorker } from '@/components/RegistrarServiceWorker'
import './globals.css'

const fraunces = Fraunces({ subsets: ['latin'], variable: '--fonte-fraunces', style: ['normal', 'italic'], weight: ['400', '500', '600'] })
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--fonte-dmsans', weight: ['400', '500', '600'] })

export const metadata: Metadata = {
  title: 'Guia do Advento',
  description: '26 dias para viver o Advento: ouvir um santo, rezar e cumprir uma missão.',
  applicationName: 'Guia do Advento',
  appleWebApp: { capable: true, title: 'Advento', statusBarStyle: 'black-translucent' },
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#1B1224' },
    { media: '(prefers-color-scheme: light)', color: '#F7EEDC' },
  ],
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { perfil, hoje } = await contexto()
  const tema = perfil?.tema && perfil.tema !== 'sistema' ? perfil.tema : undefined
  return (
    <html
      lang="pt-BR"
      data-theme={tema}
      data-gaudete={ehGaudete(hoje.data) ? '1' : undefined}
      className={`${fraunces.variable} ${dmSans.variable}`}
    >
      <body>
        {children}
        <RegistrarServiceWorker />
      </body>
    </html>
  )
}
