'use client'
import { useEffect } from 'react'
import { registrarEvento } from '@/app/acoes'

export function MarcarVista({ id }: { id: string }) {
  useEffect(() => {
    registrarEvento('retrospectiva_vista', { id })
  }, [id])
  return null
}
