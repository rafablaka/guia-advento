'use client'
import { useEffect } from 'react'
import { registrarEvento } from '@/app/acoes'

export function RegistrarServiceWorker() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {})
    }
    // Métrica de ativação: o app foi aberto já instalado na tela inicial.
    const instalado =
      window.matchMedia('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone
    if (instalado) {
      try {
        if (!localStorage.getItem('guia:instalou')) {
          registrarEvento('instalou').then((ok) => ok && localStorage.setItem('guia:instalou', '1'))
        }
      } catch {}
    }
  }, [])
  return null
}
