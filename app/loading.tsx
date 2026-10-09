import { NavInferior } from '@/components/NavInferior'

// Aparece na hora, enquanto a próxima tela carrega
export default function Carregando() {
  return (
    <>
      <main className="tela" aria-busy="true" aria-label="Carregando">
        <div className="esqueleto" style={{ height: 44, width: '55%' }} />
        <div className="esqueleto mt-5" style={{ height: 38, width: '80%' }} />
        <div className="esqueleto mt-3" style={{ height: 16, width: '60%' }} />
        <div className="esqueleto mx-auto mt-6" style={{ height: 220, width: '85%', borderRadius: 120 }} />
        <div className="esqueleto mt-6" style={{ height: 64 }} />
        <div className="esqueleto mt-3" style={{ height: 64 }} />
      </main>
      <NavInferior />
    </>
  )
}
