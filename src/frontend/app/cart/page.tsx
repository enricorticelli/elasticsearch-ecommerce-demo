import Link from 'next/link';

const cartItems = [
  {
    name: 'Accessori pelle',
    variant: 'Cuoio scuro',
    price: '29,00 EUR',
    quantity: 1,
  },
  {
    name: 'Fragranza botanica',
    variant: '50ml',
    price: '20,00 EUR',
    quantity: 1,
  },
];

export default function CartPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 pb-16 pt-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-ash)]">
            Carrello
          </p>
          <h1 className="font-display mt-2 text-3xl text-[var(--color-ink)]">
            Riepilogo acquisto
          </h1>
        </div>
        <Link
          href="/"
          className="rounded-full border border-[var(--color-stone)] px-4 py-2 text-sm text-[var(--color-ink)]"
        >
          Continua lo shopping
        </Link>
      </div>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.7fr]">
        <div className="rounded-3xl border border-[var(--color-stone)] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl">Articoli</h2>
            <span className="text-xs text-[var(--color-ash)]">Mock</span>
          </div>
          <div className="mt-4 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.name}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--color-stone)] px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-[var(--color-ink)]">{item.name}</p>
                  <p className="text-xs text-[var(--color-ash)]">{item.variant}</p>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <button className="h-8 w-8 rounded-full border border-[var(--color-stone)]">-</button>
                  <span className="font-semibold">{item.quantity}</span>
                  <button className="h-8 w-8 rounded-full border border-[var(--color-stone)]">+</button>
                </div>
                <div className="text-sm font-semibold text-[var(--color-ink)]">{item.price}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-[var(--color-stone)] bg-[var(--color-cream)] p-6 shadow-sm">
            <h2 className="font-display text-2xl">Riepilogo</h2>
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
                <span>Codice promo</span>
                <span className="font-semibold text-[var(--color-moss)]">-5,00 EUR</span>
              </div>
              <div className="border-t border-[var(--color-stone)]/70 pt-3 text-base font-semibold text-[var(--color-ink)]">
                <div className="flex items-center justify-between">
                  <span>Totale</span>
                  <span>48,90 EUR</span>
                </div>
              </div>
            </div>
            <Link
              href="/checkout"
              className="mt-6 block rounded-full bg-[var(--color-ink)] py-3 text-center text-sm font-semibold text-[var(--color-cream)]"
            >
              Procedi al checkout
            </Link>
          </div>

          <div className="rounded-3xl border border-[var(--color-stone)] bg-white p-6 text-sm text-[var(--color-ash)] shadow-sm">
            <p className="font-semibold text-[var(--color-ink)]">Supporto prioritario</p>
            <p className="mt-2">
              Hai dubbi sul tuo ordine? Un consulente ecommerce e disponibile in chat (mock).
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
