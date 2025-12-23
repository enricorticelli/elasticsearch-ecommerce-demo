'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface AutocompleteProduct {
  id: string;
  name: string;
  brand: string;
  price: number;
  imageUrl: string;
  categories?: { name: string; level: number }[];
  suggestionHtml?: string;
}

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, '');

export default function SearchBar() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [products, setProducts] = useState<AutocompleteProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (!query.trim()) {
      setProducts([]);
      return;
    }

    const handle = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ q: query.trim(), size: '6' });
        const response = await fetch(`${API_URL}/api/products/autocomplete?${params}`);
        const data = await response.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error('Error fetching autocomplete:', error);
      } finally {
        setLoading(false);
      }
    }, 220);

    return () => clearTimeout(handle);
  }, [API_URL, query]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const queryLower = query.trim().toLowerCase();
  const hasQuery = query.trim().length > 0;
  const filteredBrands = useMemo(() => {
    const unique = new Set<string>();
    products.forEach((product) => {
      if (product.brand) {
        unique.add(product.brand);
      }
    });
    return Array.from(unique)
      .filter((brand) => brand.toLowerCase().includes(queryLower))
      .slice(0, 4);
  }, [products, queryLower]);

  const filteredCategories = useMemo(() => {
    const unique = new Set<string>();
    products.forEach((product) => {
      product.categories?.forEach((category) => {
        if (category.name) {
          unique.add(category.name);
        }
      });
    });
    return Array.from(unique)
      .filter((category) => category.toLowerCase().includes(queryLower))
      .slice(0, 4);
  }, [products, queryLower]);
  const autocomplete = useMemo(() => {
    if (!hasQuery || products.length === 0) {
      return null;
    }

    const directMatch = products.find((product) =>
      product.name.toLowerCase().startsWith(queryLower)
    );
    const candidateSource = directMatch ?? products[0];
    if (!candidateSource) {
      return null;
    }

    const candidate = candidateSource.suggestionHtml
      ? stripHtml(candidateSource.suggestionHtml)
      : candidateSource.name;
    if (!candidate) {
      return null;
    }

    if (candidate.toLowerCase().startsWith(queryLower)) {
      return candidate;
    }

    return null;
  }, [hasQuery, products, queryLower]);
  const autocompleteRemainder =
    autocomplete && autocomplete.length > query.length ? autocomplete.slice(query.length) : '';

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setIsOpen(false);
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handleSearchAll = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setIsOpen(false);
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <form onSubmit={handleSubmit} className="relative">
        {autocomplete && (
          <div className="pointer-events-none absolute inset-0 flex items-center px-4 py-2 text-sm whitespace-pre">
            <span className="text-[var(--color-ink)]">{query}</span>
            <span className="text-[var(--color-ash)]">{autocompleteRemainder}</span>
          </div>
        )}
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Cerca prodotti, brand o categorie..."
          className={`w-full rounded-full border border-[var(--color-stone)] bg-white px-4 py-2 text-sm shadow-sm focus:border-[var(--color-moss)] focus:outline-none ${autocomplete ? 'text-transparent' : 'text-[var(--color-ink)]'}`}
          style={autocomplete ? { caretColor: 'var(--color-ink)' } : undefined}
        />
        <button
          type="submit"
          className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-[var(--color-ink)] px-3 py-1 text-xs font-semibold text-[var(--color-cream)] transition hover:bg-[var(--color-moss)]"
        >
          Cerca
        </button>
      </form>

      {isOpen && (
        <div className="absolute left-0 right-0 z-40 mt-3 overflow-hidden rounded-2xl border border-[var(--color-stone)] bg-white shadow-xl">
          <div className="grid gap-4 p-4 md:grid-cols-[1.4fr_1fr]">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-ash)]">
                Prodotti
              </div>
              {!hasQuery ? (
                <div className="mt-3 text-sm text-[var(--color-ash)]">
                  Inizia a digitare per vedere i suggerimenti.
                </div>
              ) : loading ? (
                <div className="mt-3 text-sm text-[var(--color-ash)]">Caricamento...</div>
              ) : products.length === 0 ? (
                <div className="mt-3 text-sm text-[var(--color-ash)]">Nessun suggerimento</div>
              ) : (
                <div className="mt-3 space-y-3">
                  {products.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      className="flex items-center gap-3 rounded-xl border border-[var(--color-stone)]/60 px-3 py-2 transition hover:border-[var(--color-moss)]"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="h-10 w-10 overflow-hidden rounded-lg bg-[var(--color-stone)]/40">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="autocomplete-suggestion truncate text-sm font-semibold text-[var(--color-ink)]">
                          {product.suggestionHtml ? (
                            <span
                              dangerouslySetInnerHTML={{ __html: product.suggestionHtml }}
                            />
                          ) : (
                            product.name
                          )}
                        </div>
                        <div className="text-xs text-[var(--color-ash)]">
                          {product.brand} • EUR {product.price.toFixed(2)}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={handleSearchAll}
                className="mt-4 w-full rounded-full border border-[var(--color-ink)] px-4 py-2 text-sm font-semibold text-[var(--color-ink)] transition hover:border-[var(--color-moss)] hover:text-[var(--color-moss)]"
              >
                Cerca tutti i prodotti
              </button>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-ash)]">
                Scorciatoie
              </div>
              <div className="mt-3 space-y-4 text-sm">
                <div>
                  <div className="text-xs font-semibold text-[var(--color-ink)]">Categorie</div>
                  {filteredCategories.length === 0 ? (
                    <div className="mt-2 text-xs text-[var(--color-ash)]">Nessuna categoria</div>
                  ) : (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {filteredCategories.map((category) => (
                        <Link
                          key={category}
                          href={`/categories/${encodeURIComponent(category)}`}
                          className="rounded-full border border-[var(--color-stone)] px-3 py-1 text-xs text-[var(--color-ink)] transition hover:border-[var(--color-moss)] hover:text-[var(--color-moss)]"
                          onClick={() => setIsOpen(false)}
                        >
                          {category}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-xs font-semibold text-[var(--color-ink)]">Brand</div>
                  {filteredBrands.length === 0 ? (
                    <div className="mt-2 text-xs text-[var(--color-ash)]">Nessun brand</div>
                  ) : (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {filteredBrands.map((brand) => (
                        <Link
                          key={brand}
                          href={`/brands/${encodeURIComponent(brand)}`}
                          className="rounded-full border border-[var(--color-stone)] px-3 py-1 text-xs text-[var(--color-ink)] transition hover:border-[var(--color-moss)] hover:text-[var(--color-moss)]"
                          onClick={() => setIsOpen(false)}
                        >
                          {brand}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
