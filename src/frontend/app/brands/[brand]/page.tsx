'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import ProductCard, { ProductCardData } from '../../components/ProductCard';

interface SearchResponse {
  total: number;
  page: number;
  pageSize: number;
  products: ProductCardData[];
}

const sortOptions = [
  { value: 'relevance', label: 'Rilevanza' },
  { value: 'title', label: 'Titolo' },
  { value: 'price_asc', label: 'Prezzo crescente' },
  { value: 'price_desc', label: 'Prezzo decrescente' },
];

export default function BrandPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [isPending, startTransition] = useTransition();

  const brandParam = Array.isArray(params.brand) ? params.brand[0] : params.brand;
  const brand = brandParam ? decodeURIComponent(brandParam) : '';
  const sort = searchParams.get('sort') ?? 'relevance';
  const pageParam = Number(searchParams.get('page') ?? '1');
  const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const pageSize = 12;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchProducts = async () => {
      if (!brand) return;
      const isInitial = products.length === 0;
      setLoading(isInitial);
      setIsFetching(true);
      try {
        const params = new URLSearchParams({
          brand,
          sort,
          page: page.toString(),
          pageSize: pageSize.toString(),
        });
        const response = await fetch(`${API_URL}/api/products/search?${params}`);
        const data: SearchResponse = await response.json();
        setProducts(data.products);
        setTotal(data.total);
      } catch (error) {
        console.error('Error fetching brand products:', error);
      } finally {
        setLoading(false);
        setIsFetching(false);
      }
    };

    fetchProducts();
  }, [API_URL, brand, page, pageSize, products.length, sort]);

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
      router.replace(`/brands/${encodeURIComponent(brand)}?${params.toString()}`, { scroll: false });
    });
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const title = useMemo(() => (brand ? `Brand: ${brand}` : 'Brand'), [brand]);

  return (
    <div className="mx-auto max-w-6xl px-6 pb-16 pt-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--color-ash)]">Brand</p>
          <h1 className="font-display text-3xl text-[var(--color-ink)]">{title}</h1>
          <p className="mt-2 text-sm text-[var(--color-ash)]">
            {total} prodotti disponibili
          </p>
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
          Nessun prodotto trovato per questo brand.
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
  );
}
