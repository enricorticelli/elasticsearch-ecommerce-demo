'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductCard, { ProductCardData } from '../components/ProductCard';

interface CategoryGroup {
  level: number;
  categories: string[];
}

interface SearchResponse {
  total: number;
  page: number;
  pageSize: number;
  minPrice?: number | null;
  maxPrice?: number | null;
  products: ProductCardData[];
}

const sortOptions = [
  { value: 'relevance', label: 'Rilevanza' },
  { value: 'title', label: 'Titolo' },
  { value: 'price_asc', label: 'Prezzo crescente' },
  { value: 'price_desc', label: 'Prezzo decrescente' },
];

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [availableMinPrice, setAvailableMinPrice] = useState<number | null>(null);
  const [availableMaxPrice, setAvailableMaxPrice] = useState<number | null>(null);
  const [priceMinInput, setPriceMinInput] = useState('');
  const [priceMaxInput, setPriceMaxInput] = useState('');

  const query = searchParams.get('q') ?? '';
  const brand = searchParams.get('brand') ?? '';
  const category = searchParams.get('category') ?? '';
  const sort = searchParams.get('sort') ?? 'relevance';
  const minPriceParam = searchParams.get('minPrice');
  const maxPriceParam = searchParams.get('maxPrice');
  const pageParam = Number(searchParams.get('page') ?? '1');
  const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const pageSize = 12;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [brandsResponse, categoriesResponse] = await Promise.all([
          fetch(`${API_URL}/api/brands`),
          fetch(`${API_URL}/api/categories`),
        ]);
        const brandsData = await brandsResponse.json();
        const categoriesData: CategoryGroup[] = await categoriesResponse.json();
        const flattenedCategories = categoriesData.flatMap((group) => group.categories);
        setBrands(brandsData);
        setCategories(flattenedCategories);
      } catch (error) {
        console.error('Error fetching filters:', error);
      }
    };

    fetchMetadata();
  }, [API_URL]);

  useEffect(() => {
    const fetchProducts = async () => {
      const isInitial = products.length === 0;
      setLoading(isInitial);
      setIsFetching(true);
      try {
        const params = new URLSearchParams();
        if (query) params.append('q', query);
        if (brand) params.append('brand', brand);
        if (category) params.append('category', category);
        if (minPriceParam) params.append('minPrice', minPriceParam);
        if (maxPriceParam) params.append('maxPrice', maxPriceParam);
        if (sort) params.append('sort', sort);
        params.append('page', page.toString());
        params.append('pageSize', pageSize.toString());

        const response = await fetch(`${API_URL}/api/products/search?${params}`);
        const data: SearchResponse = await response.json();
        setProducts(data.products);
        setTotal(data.total);
        setAvailableMinPrice(data.minPrice ?? null);
        setAvailableMaxPrice(data.maxPrice ?? null);
      } catch (error) {
        console.error('Error fetching search results:', error);
      } finally {
        setLoading(false);
        setIsFetching(false);
      }
    };

    fetchProducts();
  }, [API_URL, brand, category, maxPriceParam, minPriceParam, page, pageSize, products.length, query, sort]);

  useEffect(() => {
    if (minPriceParam !== null) {
      setPriceMinInput(minPriceParam);
    } else if (availableMinPrice !== null) {
      setPriceMinInput(availableMinPrice.toFixed(2));
    } else {
      setPriceMinInput('');
    }
  }, [availableMinPrice, minPriceParam]);

  useEffect(() => {
    if (maxPriceParam !== null) {
      setPriceMaxInput(maxPriceParam);
    } else if (availableMaxPrice !== null) {
      setPriceMaxInput(availableMaxPrice.toFixed(2));
    } else {
      setPriceMaxInput('');
    }
  }, [availableMaxPrice, maxPriceParam]);

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (!value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    startTransition(() => {
      router.replace(`/search?${params.toString()}`, { scroll: false });
    });
  };

  const applyPriceRange = () => {
    updateParams({
      minPrice: priceMinInput.trim(),
      maxPrice: priceMaxInput.trim(),
      page: '1',
    });
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const appliedLabel = useMemo(() => {
    if (!query && !brand && !category) return 'Tutti i prodotti';
    const parts = [];
    if (query) parts.push(`"${query}"`);
    if (brand) parts.push(`Brand: ${brand}`);
    if (category) parts.push(`Categoria: ${category}`);
    return parts.join(' • ');
  }, [brand, category, query]);

  return (
    <div className="mx-auto max-w-6xl px-6 pb-16 pt-10">
      <section className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-6">
          <div className="rounded-2xl border border-[var(--color-stone)] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl">Filtri</h3>
              <span className="text-xs text-[var(--color-ash)]">Ricerca live</span>
            </div>
            <div className="mt-4 grid gap-4">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-ash)]">
                Brand
              </label>
              <select
                value={brand}
                onChange={(event) => updateParams({ brand: event.target.value, page: '1' })}
                className="rounded-xl border border-[var(--color-stone)] bg-white px-3 py-2 text-sm text-[var(--color-ink)]"
              >
                <option value="">Tutti i brand</option>
                {brands.map((brandName) => (
                  <option key={brandName} value={brandName}>
                    {brandName}
                  </option>
                ))}
              </select>

              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-ash)]">
                Categoria
              </label>
              <select
                value={category}
                onChange={(event) => updateParams({ category: event.target.value, page: '1' })}
                className="rounded-xl border border-[var(--color-stone)] bg-white px-3 py-2 text-sm text-[var(--color-ink)]"
              >
                <option value="">Tutte le categorie</option>
                {categories.map((categoryName) => (
                  <option key={categoryName} value={categoryName}>
                    {categoryName}
                  </option>
                ))}
              </select>

              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-ash)]">
                Prezzo
              </label>
              <div className="grid gap-3">
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={availableMinPrice ?? undefined}
                    max={availableMaxPrice ?? undefined}
                    step="0.01"
                    value={priceMinInput}
                    onChange={(event) => setPriceMinInput(event.target.value)}
                    className="w-full rounded-xl border border-[var(--color-stone)] bg-white px-3 py-2 text-sm text-[var(--color-ink)]"
                    placeholder={availableMinPrice !== null ? availableMinPrice.toFixed(2) : 'Min'}
                  />
                  <input
                    type="number"
                    min={availableMinPrice ?? undefined}
                    max={availableMaxPrice ?? undefined}
                    step="0.01"
                    value={priceMaxInput}
                    onChange={(event) => setPriceMaxInput(event.target.value)}
                    className="w-full rounded-xl border border-[var(--color-stone)] bg-white px-3 py-2 text-sm text-[var(--color-ink)]"
                    placeholder={availableMaxPrice !== null ? availableMaxPrice.toFixed(2) : 'Max'}
                  />
                </div>
                <button
                  type="button"
                  onClick={applyPriceRange}
                  className="rounded-full border border-[var(--color-ink)] px-4 py-2 text-xs font-semibold text-[var(--color-ink)] transition hover:border-[var(--color-moss)] hover:text-[var(--color-moss)]"
                >
                  Applica range
                </button>
                {availableMinPrice !== null && availableMaxPrice !== null && (
                  <span className="text-xs text-[var(--color-ash)]">
                    Da EUR {availableMinPrice.toFixed(2)} a EUR {availableMaxPrice.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </aside>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-[var(--color-ash)]">{appliedLabel}</p>
              <h2 className="font-display text-2xl">
                {total} prodotti trovati
              </h2>
            </div>
            <div className="flex items-center gap-3 rounded-full border border-[var(--color-stone)] bg-white px-4 py-2 text-sm text-[var(--color-ash)]">
              <span>Ordina per</span>
              <select
                value={sort}
                onChange={(event) => updateParams({ sort: event.target.value, page: '1' })}
                className="bg-transparent font-semibold text-[var(--color-ink)] focus:outline-none"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading && products.length === 0 ? (
            <div className="py-12">
              <div className="h-12 w-12 animate-spin rounded-full border-2 border-[var(--color-stone)] border-t-[var(--color-ink)]"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-[var(--color-stone)] bg-white p-6 text-sm text-[var(--color-ash)]">
              Nessun prodotto trovato con i filtri attuali.
            </div>
          ) : (
            <>
              <div className={`mt-6 grid gap-6 transition-opacity sm:grid-cols-2 xl:grid-cols-3 ${isFetching || isPending ? 'opacity-60' : 'opacity-100'}`}>
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => updateParams({ page: Math.max(1, page - 1).toString() })}
                  disabled={page === 1}
                  className="rounded-full border border-[var(--color-stone)] bg-white px-4 py-2 text-sm text-[var(--color-ink)] transition hover:border-[var(--color-moss)] disabled:opacity-50"
                >
                  Pagina precedente
                </button>
                <span className="rounded-full bg-[var(--color-cream)] px-4 py-2 text-sm text-[var(--color-ash)]">
                  Pagina {page} di {totalPages}
                </span>
                <button
                  onClick={() => updateParams({ page: Math.min(totalPages, page + 1).toString() })}
                  disabled={page >= totalPages}
                  className="rounded-full border border-[var(--color-stone)] bg-white px-4 py-2 text-sm text-[var(--color-ink)] transition hover:border-[var(--color-moss)] disabled:opacity-50"
                >
                  Pagina successiva
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
