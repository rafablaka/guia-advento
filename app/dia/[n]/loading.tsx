export default function CarregandoDia() {
  return (
    <main className="tela-cheia" aria-busy="true" aria-label="Abrindo a porta">
      <div className="grid grid-cols-3 gap-1.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="esqueleto" style={{ height: 3 }} />
        ))}
      </div>
      <div className="mt-6 flex items-center gap-3">
        <div className="esqueleto" style={{ width: 42, height: 42, borderRadius: 21 }} />
        <div className="esqueleto flex-1" style={{ height: 32 }} />
      </div>
      <div className="esqueleto mx-auto mt-6" style={{ width: 300, maxWidth: '100%', height: 258 }} />
      <div className="esqueleto mt-6" style={{ height: 70 }} />
      <div className="esqueleto mt-4" style={{ height: 80 }} />
    </main>
  )
}
