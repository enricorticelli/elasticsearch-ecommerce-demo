import type { Metadata } from "next";
import Link from "next/link";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import SearchBar from "./components/SearchBar";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

const body = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Lume Market - E-commerce Demo",
  description: "Demo application with Elasticsearch, .NET 10 Minimal APIs, and Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className={`${display.variable} ${body.variable} antialiased`}>
        <div className="min-h-screen bg-[var(--color-sand)] text-[var(--color-ink)]">
          <header className="sticky top-0 z-30 border-b border-[var(--color-stone)]/70 bg-[var(--color-cream)]/80 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
              <div className="flex items-center gap-6">
                <Link
                  href="/"
                  className="flex items-baseline gap-2 font-display text-xl tracking-tight"
                >
                  <span className="text-[var(--color-ink)]">Lume Market</span>
                  <span className="text-sm text-[var(--color-ash)]">demo</span>
                </Link>
                <nav className="hidden items-center gap-4 text-sm font-medium text-[var(--color-ash)] md:flex">
                  <Link href="/" className="transition hover:text-[var(--color-ink)]">
                    Home
                  </Link>
                  <Link href="/" className="transition hover:text-[var(--color-ink)]">
                    Novita
                  </Link>
                  <Link href="/" className="transition hover:text-[var(--color-ink)]">
                    Collezioni
                  </Link>
                </nav>
              </div>
              <div className="hidden flex-1 justify-end md:flex">
                <SearchBar />
              </div>
            </div>
            <div className="mx-auto flex max-w-6xl px-6 pb-4 md:hidden">
              <SearchBar />
            </div>
          </header>
          {children}
          <footer className="mt-16 border-t border-[var(--color-stone)]/70 bg-[var(--color-cream)]">
            <div className="mx-auto grid max-w-6xl gap-6 px-6 py-10 text-sm text-[var(--color-ash)] md:grid-cols-3">
              <div>
                <div className="font-display text-lg text-[var(--color-ink)]">Lume Market</div>
                <p className="mt-2">
                  Un ecommerce demo con atmosfera reale: ricerca veloce, schede curate e checkout
                  pronto.
                </p>
              </div>
              <div>
                <div className="font-semibold text-[var(--color-ink)]">Assistenza</div>
                <ul className="mt-2 space-y-1">
                  <li>Spedizioni e resi</li>
                  <li>Pagamenti e fatture</li>
                  <li>Traccia ordine</li>
                </ul>
              </div>
              <div>
                <div className="font-semibold text-[var(--color-ink)]">Newsletter</div>
                <p className="mt-2">
                  Anteprime esclusive e promozioni curate.
                </p>
                <div className="mt-3 flex gap-2">
                  <input
                    type="email"
                    placeholder="email@esempio.it"
                    className="w-full rounded-full border border-[var(--color-stone)] bg-white px-4 py-2 text-[var(--color-ink)]"
                  />
                  <button className="rounded-full bg-[var(--color-amber)] px-4 py-2 font-semibold text-white">
                    Iscriviti
                  </button>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
