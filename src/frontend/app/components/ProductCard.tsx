import Link from 'next/link';

export interface CategoryNode {
  name: string;
  level: number;
}

export interface ProductCardData {
  id: string;
  name: string;
  description: string;
  price: number;
  brand: string;
  categories: CategoryNode[];
  stock: number;
  imageUrl: string;
}

const placeholderImage = `data:image/svg+xml;utf8,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600'><rect width='100%' height='100%' fill='#f4efe6'/><rect x='8%' y='8%' width='84%' height='84%' rx='24' ry='24' fill='#fffaf4' stroke='#d8cdbf' stroke-width='2'/><text x='50%' y='50%' text-anchor='middle' dominant-baseline='middle' font-family='Helvetica, Arial, sans-serif' font-size='20' fill='#8f8377'>Immagine non disponibile</text></svg>"
)}`;

const formatCategoryDisplay = (categories?: CategoryNode[]) => {
  if (!categories || categories.length === 0) {
    return 'Nessuna categoria';
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
    .map(([level, names]) => `L${level}: ${Array.from(names).sort().join(', ')}`)
    .join(' • ');
};

export default function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <Link
      key={product.id}
      href={`/products/${product.id}`}
      className="group overflow-hidden rounded-2xl border border-[var(--color-stone)] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden bg-[var(--color-stone)]/30">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          onError={(event) => {
            const target = event.currentTarget;
            target.onerror = null;
            target.src = placeholderImage;
          }}
        />
        <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[var(--color-ink)]">
          {product.stock > 0 ? 'Disponibile' : 'Esaurito'}
        </div>
      </div>
      <div className="p-5">
        <div className="text-xs text-[var(--color-ash)]">
          {product.brand} • {formatCategoryDisplay(product.categories)}
        </div>
        <h3 className="mt-2 font-display text-lg text-[var(--color-ink)] line-clamp-2">
          {product.name}
        </h3>
        <p className="mt-2 text-sm text-[var(--color-ash)] line-clamp-2">
          {product.description}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-semibold text-[var(--color-moss)]">
            EUR {product.price.toFixed(2)}
          </span>
          <span className="text-xs text-[var(--color-ash)]">
            {product.stock > 0 ? `${product.stock} pezzi` : 'Riassortimento'}
          </span>
        </div>
      </div>
    </Link>
  );
}
