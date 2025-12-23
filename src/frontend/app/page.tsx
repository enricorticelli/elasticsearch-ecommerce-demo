'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import ProductCard, { ProductCardData } from './components/ProductCard';

interface CategoryGroup {
  level: number;
  categories: string[];
}

const articles = [
  {
    title: 'Guida rapida alle postazioni ibride',
    tag: 'Lifestyle',
    description: 'Piccoli gesti, grandi risultati: come scegliere accessori e luci che cambiano la giornata.',
  },
  {
    title: 'Suono immersivo in pochi passi',
    tag: 'Audio',
    description: 'Dalle casse desktop alle soundbar: cosa conta davvero quando cerchi un audio pulito.',
  },
  {
    title: 'Setup gaming, senza eccessi',
    tag: 'Gaming',
    description: 'Componenti essenziali e materiali pratici per creare una postazione credibile.',
  },
];

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<ProductCardData[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchHighlights = async () => {
      setLoadingProducts(true);
      try {
        const productParams = new URLSearchParams({
          page: '1',
          pageSize: '8',
        });
        const [productsResponse, brandsResponse, categoriesResponse] = await Promise.all([
          fetch(`${API_URL}/api/products/search?${productParams}`),
          fetch(`${API_URL}/api/brands`),
          fetch(`${API_URL}/api/categories`),
        ]);
        const productsData = await productsResponse.json();
        const brandsData = await brandsResponse.json();
        const categoriesData: CategoryGroup[] = await categoriesResponse.json();
        const flattenedCategories = categoriesData.flatMap((group) => group.categories);

        setFeaturedProducts(productsData.products || []);
        setBrands(brandsData || []);
        setCategories(flattenedCategories);
      } catch (error) {
        console.error('Error fetching homepage data:', error);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchHighlights();
  }, [API_URL]);

  const highlightedCategories = useMemo(() => categories.slice(0, 6), [categories]);
  const highlightedBrands = useMemo(() => brands.slice(0, 8), [brands]);

  return (
    <div className="mx-auto max-w-6xl px-6 pb-16 pt-10">
      <section className="grid items-center gap-8 md:grid-cols-[1.1fr_0.9fr]">
        <div className="animate-rise">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-moss)]">
            Lume Market selezionato
          </p>
          <h1 className="font-display mt-4 text-4xl text-[var(--color-ink)] md:text-5xl">
            Prodotti in evidenza, categorie vive e articoli curati.
          </h1>
          <p className="mt-4 max-w-xl text-base text-[var(--color-ash)]">
            Una home semplice: scegli cosa esplorare e poi filtra con la ricerca completa.
            Scopri i brand, le categorie e una selezione pronta di prodotti.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/search"
              className="rounded-full bg-[var(--color-ink)] px-5 py-2 text-sm font-semibold text-[var(--color-cream)] transition hover:bg-[var(--color-moss)]"
            >
              Vai alla ricerca
            </Link>
            <Link
              href="/search?sort=price_desc"
              className="rounded-full border border-[var(--color-stone)] px-5 py-2 text-sm font-semibold text-[var(--color-ink)] transition hover:border-[var(--color-moss)] hover:text-[var(--color-moss)]"
            >
              Best seller demo
            </Link>
          </div>
        </div>
        <div className="animate-rise rounded-3xl border border-[var(--color-stone)] bg-[var(--color-cream)] p-6 shadow-sm" style={{ animationDelay: '0.15s' }}>
          <div className="rounded-2xl bg-white p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-ash)]">
              Brand in evidenza
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {highlightedBrands.map((brand) => (
                <Link
                  key={brand}
                  href={`/brands/${encodeURIComponent(brand)}`}
                  className="rounded-full border border-[var(--color-stone)] px-3 py-1 text-xs text-[var(--color-ink)] transition hover:border-[var(--color-moss)] hover:text-[var(--color-moss)]"
                >
                  {brand}
                </Link>
              ))}
            </div>
          </div>
          <div className="mt-5 rounded-2xl bg-[var(--color-moss)]/10 p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-moss)]">
              Collezioni appena arrivate
            </div>
            <p className="mt-3 text-sm text-[var(--color-ash)]">
              Design credibile, descrizioni curate e filtri utili. Tutto pronto per il catalogo reale.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-[var(--color-ash)]">Categorie in evidenza</p>
            <h2 className="font-display text-2xl text-[var(--color-ink)]">
              Parti da una collezione
            </h2>
          </div>
          <Link
            href="/search"
            className="text-sm font-semibold text-[var(--color-moss)] transition hover:text-[var(--color-ink)]"
          >
            Vedi tutte
          </Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {highlightedCategories.map((category) => (
            <Link
              key={category}
              href={`/categories/${encodeURIComponent(category)}`}
              className="group rounded-2xl border border-[var(--color-stone)] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-ash)]">
                Categoria
              </div>
              <h3 className="mt-3 font-display text-xl text-[var(--color-ink)]">{category}</h3>
              <p className="mt-2 text-sm text-[var(--color-ash)]">
                Scopri i prodotti selezionati per {category.toLowerCase()}.
              </p>
              <span className="mt-4 inline-flex text-sm font-semibold text-[var(--color-moss)] transition group-hover:text-[var(--color-ink)]">
                Esplora
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-[var(--color-ash)]">Prodotti in evidenza</p>
            <h2 className="font-display text-2xl text-[var(--color-ink)]">
              Selezione della settimana
            </h2>
          </div>
          <Link
            href="/search"
            className="text-sm font-semibold text-[var(--color-moss)] transition hover:text-[var(--color-ink)]"
          >
            Vai alla ricerca
          </Link>
        </div>
        {loadingProducts ? (
          <div className="py-12">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-[var(--color-stone)] border-t-[var(--color-ink)]"></div>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-14">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-[var(--color-ash)]">Articoli in evidenza</p>
            <h2 className="font-display text-2xl text-[var(--color-ink)]">
              Un mini magazine da sfogliare
            </h2>
          </div>
          <span className="text-sm text-[var(--color-ash)]">Mock editoriale</span>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {articles.map((article) => (
            <div
              key={article.title}
              className="rounded-2xl border border-[var(--color-stone)] bg-white p-5 shadow-sm"
            >
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-ash)]">
                {article.tag}
              </div>
              <h3 className="mt-3 font-display text-xl text-[var(--color-ink)]">{article.title}</h3>
              <p className="mt-2 text-sm text-[var(--color-ash)]">{article.description}</p>
              <button className="mt-4 text-sm font-semibold text-[var(--color-moss)]">
                Leggi l&apos;articolo
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
