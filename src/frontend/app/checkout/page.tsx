import Link from 'next/link';

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 pb-16 pt-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-ash)]">
            Checkout
          </p>
          <h1 className="font-display mt-2 text-3xl text-[var(--color-ink)]">
            Conferma e paga
          </h1>
        </div>
        <Link
          href="/cart"
          className="rounded-full border border-[var(--color-stone)] px-4 py-2 text-sm text-[var(--color-ink)]"
        >
          Torna al carrello
        </Link>
      </div>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.7fr]">
        <form className="space-y-6">
          <div className="rounded-3xl border border-[var(--color-stone)] bg-white p-6 shadow-sm">
            <h2 className="font-display text-2xl">Dati di spedizione</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <input
                placeholder="Nome"
                className="rounded-xl border border-[var(--color-stone)] px-4 py-3 text-sm"
              />
              <input
                placeholder="Cognome"
                className="rounded-xl border border-[var(--color-stone)] px-4 py-3 text-sm"
              />
              <input
                placeholder="Email"
                className="rounded-xl border border-[var(--color-stone)] px-4 py-3 text-sm"
              />
              <input
                placeholder="Telefono"
                className="rounded-xl border border-[var(--color-stone)] px-4 py-3 text-sm"
              />
              <input
                placeholder="Indirizzo"
                className="rounded-xl border border-[var(--color-stone)] px-4 py-3 text-sm sm:col-span-2"
              />
              <input
                placeholder="CAP"
                className="rounded-xl border border-[var(--color-stone)] px-4 py-3 text-sm"
              />
              <input
                placeholder="Citta"
                className="rounded-xl border border-[var(--color-stone)] px-4 py-3 text-sm"
              />
            </div>
          </div>

          <div className="rounded-3xl border border-[var(--color-stone)] bg-white p-6 shadow-sm">
            <h2 className="font-display text-2xl">Metodo di pagamento</h2>
            <div className="mt-4 space-y-3 text-sm text-[var(--color-ash)]">
              <label className="flex items-center justify-between rounded-2xl border border-[var(--color-stone)] px-4 py-3">
                <span>Carta di credito (mock)</span>
                <input type="radio" name="payment" defaultChecked />
              </label>
              <label className="flex items-center justify-between rounded-2xl border border-[var(--color-stone)] px-4 py-3">
                <span>PayPal (mock)</span>
                <input type="radio" name="payment" />
              </label>
              <label className="flex items-center justify-between rounded-2xl border border-[var(--color-stone)] px-4 py-3">
                <span>Bonifico bancario (mock)</span>
                <input type="radio" name="payment" />
              </label>
            </div>
          </div>
        </form>

        <div className="space-y-6">
          <div className="rounded-3xl border border-[var(--color-stone)] bg-[var(--color-cream)] p-6 shadow-sm">
            <h2 className="font-display text-2xl">Riepilogo ordine</h2>
            <div className="mt-4 space-y-3 text-sm text-[var(--color-ash)]">
              <div className="flex items-center justify-between">
                <span>Subtotale</span>
                <span className="font-semibold text-[var(--color-ink)]">49,00 EUR</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Spedizione</span>
                <span className="font-semibold text-[var(--color-ink)]">4,90 EUR</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Assicurazione</span>
                <span className="font-semibold text-[var(--color-ink)]">2,00 EUR</span>
              </div>
              <div className="border-t border-[var(--color-stone)]/70 pt-3 text-base font-semibold text-[var(--color-ink)]">
                <div className="flex items-center justify-between">
                  <span>Totale</span>
                  <span>55,90 EUR</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              className="mt-6 w-full rounded-full bg-[var(--color-ink)] py-3 text-sm font-semibold text-[var(--color-cream)]"
            >
              Conferma ordine
            </button>
            <p className="mt-3 text-xs text-[var(--color-ash)]">
              Checkout mock: nessun pagamento reale verra processato.
            </p>
          </div>

          <div className="rounded-3xl border border-[var(--color-stone)] bg-white p-6 text-sm text-[var(--color-ash)] shadow-sm">
            <p className="font-semibold text-[var(--color-ink)]">Spedizione premium</p>
            <p className="mt-2">Consegna in 24h, upgrade disponibile in fase reale.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
