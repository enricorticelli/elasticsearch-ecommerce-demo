'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface CategoryNode {
  name: string;
  level: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  brand: string;
  categories: CategoryNode[];
  stock: number;
  imageUrl: string;
  createdAt: string;
}

const placeholderImage = `data:image/svg+xml;utf8,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='900' height='900'><rect width='100%' height='100%' fill='#f4efe6'/><rect x='6%' y='6%' width='88%' height='88%' rx='28' ry='28' fill='#fffaf4' stroke='#d8cdbf' stroke-width='2'/><text x='50%' y='50%' text-anchor='middle' dominant-baseline='middle' font-family='Helvetica, Arial, sans-serif' font-size='22' fill='#8f8377'>Immagine non disponibile</text></svg>"
)}`;

const groupCategories = (categories?: CategoryNode[]) => {
  if (!categories || categories.length === 0) {
    return [];
  }

  const grouped = categories.reduce<Record<number, Set<string>>>((acc, node) => {
    if (!acc[node.level]) {
      acc[node.level] = new Set();
    }
    acc[node.level].add(node.name);
    return acc;
  }, {});

  return Object.entries(grouped)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([level, names]) => ({
      level: Number(level),
      names: Array.from(names).sort(),
    }));
};

export default function ProductDetail() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchProduct();
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`${API_URL}/api/products/${params.id}`);
      if (!response.ok) {
        setError(true);
        return;
      }
      const data = await response.json();
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-6xl items-center justify-center px-6">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-[var(--color-stone)] border-t-[var(--color-ink)]"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="rounded-3xl border border-[var(--color-stone)] bg-white p-10 text-center shadow-sm">
          <h2 className="font-display text-2xl text-[var(--color-ink)]">Prodotto non trovato</h2>
          <p className="mt-3 text-[var(--color-ash)]">
            L'articolo che cerchi non e disponibile oppure e stato rimosso.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-full bg-[var(--color-ink)] px-5 py-2 text-sm font-semibold text-[var(--color-cream)]"
          >
            Torna alla vetrina
          </Link>
        </div>
      </div>
    );
  }

  const categoryLevels = groupCategories(product.categories);
  const categorySummary =
    categoryLevels.length > 0
      ? categoryLevels.map((group) => `L${group.level}: ${group.names.join(', ')}`).join(' • ')
      : 'Nessuna categoria';

  return (
    <div className="mx-auto max-w-6xl px-6 pb-16 pt-10">
      <div className="text-xs uppercase tracking-[0.2em] text-[var(--color-ash)]">
        <Link href="/" className="hover:text-[var(--color-ink)]">
          Home
        </Link>
        <span className="px-2">/</span>
        <span>Dettaglio prodotto</span>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden rounded-3xl border border-[var(--color-stone)] bg-white shadow-sm">
          <div className="aspect-square bg-[var(--color-stone)]/30">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
              onError={(event) => {
                const target = event.currentTarget;
                target.onerror = null;
                target.src = placeholderImage;
              }}
            />
          </div>
          <div className="border-t border-[var(--color-stone)] p-6 text-sm text-[var(--color-ash)]">
            <p className="font-semibold text-[var(--color-ink)]">Dettagli rapidi</p>
            <div className="mt-3 grid gap-2">
              <div>
                <span className="font-semibold text-[var(--color-ink)]">Brand:</span> {product.brand}
              </div>
              <div>
                <span className="font-semibold text-[var(--color-ink)]">Categorie:</span> {categorySummary}
              </div>
              <div>
                <span className="font-semibold text-[var(--color-ink)]">ID prodotto:</span> {product.id}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-[var(--color-stone)] bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-moss)]">
              {product.brand}
            </p>
            <h1 className="font-display mt-3 text-3xl text-[var(--color-ink)]">
              {product.name}
            </h1>
            <p className="mt-3 text-sm text-[var(--color-ash)]">{product.description}</p>

            <div className="mt-6 flex items-end justify-between">
              <span className="text-3xl font-semibold text-[var(--color-moss)]">
                EUR {product.price.toFixed(2)}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  product.stock > 0
                    ? 'bg-[var(--color-moss)]/10 text-[var(--color-moss)]'
                    : 'bg-red-100 text-red-600'
                }`}
              >
                {product.stock > 0 ? `${product.stock} pezzi disponibili` : 'Esaurito'}
              </span>
            </div>

            <div className="mt-6 grid gap-3">
              <div className="flex items-center justify-between rounded-2xl border border-[var(--color-stone)] px-4 py-3 text-sm">
                <span>Quantita</span>
                <div className="flex items-center gap-3">
                  <button className="h-8 w-8 rounded-full border border-[var(--color-stone)]">-</button>
                  <span className="font-semibold">1</span>
                  <button className="h-8 w-8 rounded-full border border-[var(--color-stone)]">+</button>
                </div>
              </div>
              <button
                disabled={product.stock === 0}
                className="w-full rounded-full bg-[var(--color-ink)] py-3 text-sm font-semibold text-[var(--color-cream)] transition hover:bg-[var(--color-moss)] disabled:bg-[var(--color-stone)]"
              >
                {product.stock > 0 ? 'Aggiungi al carrello' : 'Non disponibile'}
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-[var(--color-stone)] bg-[var(--color-cream)] p-6 text-sm text-[var(--color-ash)] shadow-sm">
            <p className="font-semibold text-[var(--color-ink)]">Spedizione e resi</p>
            <ul className="mt-3 space-y-2">
              <li>Spedizione standard: 4,90 EUR, gratuita oltre 80 EUR.</li>
              <li>Reso gratuito entro 30 giorni in negozio o via corriere.</li>
              <li>Supporto dedicato via chat e email (mock).</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
