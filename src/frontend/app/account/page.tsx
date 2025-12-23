import Link from 'next/link';

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 pb-16 pt-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-ash)]">
            Area utente
          </p>
          <h1 className="font-display mt-2 text-3xl text-[var(--color-ink)]">
            Bentornata, Giulia
          </h1>
        </div>
        <Link
          href="/"
          className="rounded-full border border-[var(--color-stone)] px-4 py-2 text-sm text-[var(--color-ink)]"
        >
          Torna alla vetrina
        </Link>
      </div>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.7fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-[var(--color-stone)] bg-white p-6 shadow-sm">
            <h2 className="font-display text-2xl">Panoramica</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {[
                { label: 'Ordini attivi', value: '2' },
                { label: 'Punti fedelta', value: '120' },
                { label: 'Wishlist', value: '7' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-[var(--color-stone)] bg-[var(--color-cream)] px-4 py-3"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-ash)]">
                    {item.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--color-ink)]">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-[var(--color-stone)] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl">Ordini recenti</h2>
              <span className="text-xs text-[var(--color-ash)]">Mock data</span>
            </div>
            <div className="mt-4 space-y-4">
              {[
                {
                  id: '#LM-2043',
                  status: 'In consegna',
                  total: '98,00 EUR',
                  date: '12 Mar 2025',
                },
                {
                  id: '#LM-1981',
                  status: 'In preparazione',
                  total: '49,00 EUR',
                  date: '09 Mar 2025',
                },
              ].map((order) => (
                <div
                  key={order.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--color-stone)] px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-ink)]">{order.id}</p>
                    <p className="text-xs text-[var(--color-ash)]">{order.date}</p>
                  </div>
                  <div className="text-sm text-[var(--color-ash)]">{order.status}</div>
                  <div className="text-sm font-semibold text-[var(--color-ink)]">{order.total}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-[var(--color-stone)] bg-white p-6 shadow-sm">
            <h2 className="font-display text-2xl">Indirizzi</h2>
            <div className="mt-4 space-y-3 text-sm text-[var(--color-ash)]">
              <div className="rounded-2xl border border-[var(--color-stone)] px-4 py-3">
                <p className="font-semibold text-[var(--color-ink)]">Casa</p>
                <p>Via Cavour 21, 20121 Milano</p>
              </div>
              <div className="rounded-2xl border border-[var(--color-stone)] px-4 py-3">
                <p className="font-semibold text-[var(--color-ink)]">Studio</p>
                <p>Viale Dante 12, 50100 Firenze</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-[var(--color-stone)] bg-[var(--color-cream)] p-6 shadow-sm">
            <h2 className="font-display text-2xl">Pagamenti</h2>
            <p className="mt-3 text-sm text-[var(--color-ash)]">
              Metodi salvati e fatture disponibili nella tua area. Collegamento mock.
            </p>
            <button className="mt-4 w-full rounded-full bg-[var(--color-ink)] py-3 text-sm font-semibold text-[var(--color-cream)]">
              Gestisci metodi
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
