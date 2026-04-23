'use client';

import { useState, useMemo, useTransition, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { LightspeedProduct } from '@/lib/lightspeed';
import ProductModal from './CigarModal';
import { ProductGroup, groupByName } from '@/lib/productGroups';
import { nameToSlug } from '@/lib/slug';

type Tab = 'cigars' | 'pipes' | 'tobacco' | 'swag' | 'all';
type ShowQty = 'singles' | 'boxes' | 'both';

const SWAG_CATEGORY = 'JTTC Swag';
const VALID_TABS: Tab[] = ['cigars', 'pipes', 'tobacco', 'swag', 'all'];
const VALID_QTY: ShowQty[] = ['singles', 'boxes', 'both'];

export default function ShopClient({
  products,
  initialBrand = '',
  initialTab = '',
  initialShowQty = '',
  initialSearch = '',
}: {
  products: LightspeedProduct[];
  initialBrand?: string;
  initialTab?: string;
  initialShowQty?: string;
  initialSearch?: string;
}) {
  const [tab, setTab] = useState<Tab>(VALID_TABS.includes(initialTab as Tab) ? (initialTab as Tab) : 'cigars');
  const [showQty, setShowQty] = useState<ShowQty>(VALID_QTY.includes(initialShowQty as ShowQty) ? (initialShowQty as ShowQty) : 'both');
  const [search, setSearch] = useState(initialSearch);
  const [selectedBrand, setSelectedBrand] = useState(initialBrand);
  const [openProduct, setOpenProduct] = useState<ProductGroup | null>(null);

  // Mirror filter state to the URL so browser back/forward restores it
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (tab !== 'cigars') params.set('tab', tab);
      if (showQty !== 'both') params.set('showQty', showQty);
      if (selectedBrand) params.set('brand', selectedBrand);
      if (search) params.set('q', search);
      const qs = params.toString();
      const next = qs ? `/shop?${qs}` : '/shop';
      const current = window.location.pathname + window.location.search;
      if (next !== current) {
        window.history.replaceState(null, '', next);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [tab, showQty, selectedBrand, search]);

  // Restore filter state from the URL on browser back/forward (popstate)
  useEffect(() => {
    function syncFromUrl() {
      const p = new URLSearchParams(window.location.search);
      const t = p.get('tab') ?? '';
      const q = p.get('showQty') ?? '';
      setTab(VALID_TABS.includes(t as Tab) ? (t as Tab) : 'cigars');
      setShowQty(VALID_QTY.includes(q as ShowQty) ? (q as ShowQty) : 'both');
      setSelectedBrand(p.get('brand') ?? '');
      setSearch(p.get('q') ?? '');
    }
    window.addEventListener('popstate', syncFromUrl);
    return () => window.removeEventListener('popstate', syncFromUrl);
  }, []);

  function openQuickView(group: ProductGroup) {
    // Quick View shows in-stock variants only
    const inStock = group.variants.filter(v => v.stockAmount > 0);
    if (inStock.length === 0) return; // nothing in stock — do nothing
    const prices = inStock.map(v => v.price);
    setOpenProduct({
      ...group,
      variants: inStock,
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
    });
  }

  const cigars = useMemo(() => products.filter(p => p.isCigar), [products]);
  const pipes = useMemo(() => products.filter(p => p.isPipe), [products]);
  const tobacco = useMemo(() => products.filter(p => p.isPipeTobacco), [products]);
  const swagVariants = useMemo(() => products.filter(p => p.category === SWAG_CATEGORY), [products]);
  const nonSwag = useMemo(() => products.filter(p => p.category !== SWAG_CATEGORY), [products]);

  const hasStock = (g: ReturnType<typeof groupByName>[number]) =>
    g.variants.some(v => v.stockAmount > 0);

  // All tabs use the same groupByName → same table modal
  const allCigarGroups = useMemo(() => groupByName(cigars).filter(hasStock), [cigars]);
  const allPipeGroups = useMemo(() => groupByName(pipes).filter(hasStock), [pipes]);
  const allTobaccoGroups = useMemo(() => groupByName(tobacco).filter(hasStock), [tobacco]);
  const allSwagGroups = useMemo(() => groupByName(swagVariants).filter(hasStock), [swagVariants]);
  const allNonSwagGroups = useMemo(() => groupByName(nonSwag).filter(hasStock), [nonSwag]);

  const brands = useMemo(() => {
    const source =
      tab === 'pipes'   ? pipes :
      tab === 'tobacco' ? tobacco :
      tab === 'all'     ? nonSwag :
                          cigars;
    return [...new Set(source.filter(p => p.brand).map(p => p.brand))].sort();
  }, [tab, cigars, pipes, tobacco, nonSwag]);

  // Filtered cigar groups
  const filteredCigarGroups = useMemo(() => {
    let groups = allCigarGroups;
    if (showQty === 'singles') groups = groups.filter(g => g.variants.some(v => v.isSingle));
    else if (showQty === 'boxes') groups = groups.filter(g => g.variants.some(v => v.isBox));
    if (selectedBrand) groups = groups.filter(g => g.brand === selectedBrand);
    if (search) {
      const q = search.toLowerCase();
      groups = groups.filter(g =>
        g.name.toLowerCase().includes(q) ||
        g.brand.toLowerCase().includes(q) ||
        g.variants.some(v => v.size.toLowerCase().includes(q))
      );
    }
    return groups;
  }, [allCigarGroups, showQty, selectedBrand, search]);

  // Filtered swag groups
  const filteredSwagGroups = useMemo(() => {
    if (!search) return allSwagGroups;
    const q = search.toLowerCase();
    return allSwagGroups.filter(g => g.name.toLowerCase().includes(q));
  }, [allSwagGroups, search]);

  // Generic brand+search filter used by pipes and tobacco
  function filterByBrandAndSearch(groups: ProductGroup[]) {
    let out = groups;
    if (selectedBrand) out = out.filter(g => g.brand === selectedBrand);
    if (search) {
      const q = search.toLowerCase();
      out = out.filter(g =>
        g.name.toLowerCase().includes(q) ||
        g.brand.toLowerCase().includes(q) ||
        g.variants.some(v => v.size.toLowerCase().includes(q))
      );
    }
    return out;
  }

  const filteredPipeGroups = useMemo(
    () => filterByBrandAndSearch(allPipeGroups),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allPipeGroups, selectedBrand, search]
  );
  const filteredTobaccoGroups = useMemo(
    () => filterByBrandAndSearch(allTobaccoGroups),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allTobaccoGroups, selectedBrand, search]
  );

  // Filtered all-products groups (non-swag + swag combined)
  const filteredAllNonSwag = useMemo(() => {
    let groups = allNonSwagGroups;
    if (showQty === 'singles') groups = groups.filter(g => g.variants.some(v => v.isSingle));
    else if (showQty === 'boxes') groups = groups.filter(g => g.variants.some(v => v.isBox));
    if (selectedBrand) groups = groups.filter(g => g.brand === selectedBrand);
    if (search) {
      const q = search.toLowerCase();
      groups = groups.filter(g =>
        g.name.toLowerCase().includes(q) || g.brand.toLowerCase().includes(q)
      );
    }
    return groups;
  }, [allNonSwagGroups, showQty, selectedBrand, search]);

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '0.5rem 1.25rem',
    fontSize: '0.75rem',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    background: active ? 'var(--color-terracotta)' : 'transparent',
    color: active ? 'var(--color-cream)' : 'var(--color-smoke)',
    borderBottom: active ? 'none' : '1px solid var(--color-charcoal-mid)',
    transition: 'all 0.2s',
  });

  const countDisplay = () => {
    if (tab === 'swag')    return `${filteredSwagGroups.length} item${filteredSwagGroups.length !== 1 ? 's' : ''}`;
    if (tab === 'cigars')  return `${filteredCigarGroups.length} product${filteredCigarGroups.length !== 1 ? 's' : ''}`;
    if (tab === 'pipes')   return `${filteredPipeGroups.length} product${filteredPipeGroups.length !== 1 ? 's' : ''}`;
    if (tab === 'tobacco') return `${filteredTobaccoGroups.length} product${filteredTobaccoGroups.length !== 1 ? 's' : ''}`;
    const total = filteredAllNonSwag.length + filteredSwagGroups.length;
    return `${total} product${total !== 1 ? 's' : ''}`;
  };

  function tilePrice(g: ProductGroup) {
    return g.minPrice === g.maxPrice
      ? `$${g.minPrice.toFixed(2)}`
      : `From $${g.minPrice.toFixed(2)}`;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">

      {/* Tabs */}
      <div className="flex flex-wrap gap-0 mb-8" style={{ borderBottom: '1px solid var(--color-charcoal-mid)' }}>
        <button style={tabStyle(tab === 'cigars')} onClick={() => setTab('cigars')}>
          Cigars ({allCigarGroups.length})
        </button>
        {allPipeGroups.length > 0 && (
          <button style={tabStyle(tab === 'pipes')} onClick={() => setTab('pipes')}>
            Pipes ({allPipeGroups.length})
          </button>
        )}
        {allTobaccoGroups.length > 0 && (
          <button style={tabStyle(tab === 'tobacco')} onClick={() => setTab('tobacco')}>
            Pipe Tobacco ({allTobaccoGroups.length})
          </button>
        )}
        {swagVariants.length > 0 && (
          <button style={tabStyle(tab === 'swag')} onClick={() => setTab('swag')}>
            JTTC Swag ({allSwagGroups.length})
          </button>
        )}
        <button style={tabStyle(tab === 'all')} onClick={() => setTab('all')}>
          All Products ({allNonSwagGroups.length + allSwagGroups.length})
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-10">
        <input
          type="text"
          placeholder={tab === 'swag' ? 'Search swag...' : 'Search by name, brand, size...'}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 text-sm"
          style={{
            minWidth: 220,
            background: 'var(--color-charcoal)',
            border: '1px solid var(--color-charcoal-mid)',
            color: 'var(--color-cream)',
          }}
        />

        {tab !== 'swag' && (
          <select
            value={selectedBrand}
            onChange={e => setSelectedBrand(e.target.value)}
            className="px-4 py-2 text-sm"
            style={{
              background: 'var(--color-charcoal)',
              border: '1px solid var(--color-charcoal-mid)',
              color: selectedBrand ? 'var(--color-cream)' : 'var(--color-smoke)',
            }}
          >
            <option value="">All Brands</option>
            {brands.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        )}

        {(tab === 'cigars' || tab === 'all') && (
          <div className="flex" style={{ border: '1px solid var(--color-charcoal-mid)' }}>
            {(['singles', 'boxes', 'both'] as ShowQty[]).map(q => (
              <button
                key={q}
                onClick={() => setShowQty(q)}
                className="px-4 py-2 text-xs font-semibold tracking-widest uppercase"
                style={{
                  background: showQty === q ? 'var(--color-charcoal-mid)' : 'transparent',
                  color: showQty === q ? 'var(--color-cream)' : 'var(--color-smoke)',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {q}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Count */}
      <div className="mb-6" style={{ color: 'var(--color-smoke)', fontSize: '0.8rem', letterSpacing: '0.1em' }}>
        {countDisplay()}
      </div>

      {/* ── Cigars tab ── */}
      {tab === 'cigars' && (
        filteredCigarGroups.length === 0 ? <EmptyState /> : (
          <ProductGrid>
            {filteredCigarGroups.map(g => (
              <ProductTile
                key={g.name}
                imageUrl={g.imageUrl}
                label={g.brand}
                name={g.name}
                sub={`${g.variants.length} variant${g.variants.length !== 1 ? 's' : ''}`}
                price={tilePrice(g)}
                onQuickView={() => openQuickView(g)}
              />
            ))}
          </ProductGrid>
        )
      )}

      {/* ── Pipes tab ── */}
      {tab === 'pipes' && (
        filteredPipeGroups.length === 0 ? <EmptyState /> : (
          <ProductGrid>
            {filteredPipeGroups.map(g => (
              <ProductTile
                key={g.name}
                imageUrl={g.imageUrl}
                label={g.brand}
                name={g.name}
                sub={`${g.variants.length} variant${g.variants.length !== 1 ? 's' : ''}`}
                price={tilePrice(g)}
                onQuickView={() => openQuickView(g)}
                isPipe
              />
            ))}
          </ProductGrid>
        )
      )}

      {/* ── Pipe Tobacco tab ── */}
      {tab === 'tobacco' && (
        filteredTobaccoGroups.length === 0 ? <EmptyState /> : (
          <ProductGrid>
            {filteredTobaccoGroups.map(g => (
              <ProductTile
                key={g.name}
                imageUrl={g.imageUrl}
                label={g.brand}
                name={g.name}
                sub={`${g.variants.length} variant${g.variants.length !== 1 ? 's' : ''}`}
                price={tilePrice(g)}
                onQuickView={() => openQuickView(g)}
              />
            ))}
          </ProductGrid>
        )
      )}

      {/* ── Swag tab ── */}
      {tab === 'swag' && (
        filteredSwagGroups.length === 0 ? <EmptyState /> : (
          <ProductGrid>
            {filteredSwagGroups.map(g => (
              <ProductTile
                key={g.name}
                imageUrl={g.imageUrl}
                label="JTTC Swag"
                name={g.name}
                sub={`${g.variants.length} variant${g.variants.length !== 1 ? 's' : ''}`}
                price={tilePrice(g)}
                onQuickView={() => openQuickView(g)}
              />
            ))}
          </ProductGrid>
        )
      )}

      {/* ── All tab ── */}
      {tab === 'all' && (
        filteredAllNonSwag.length === 0 && filteredSwagGroups.length === 0 ? <EmptyState /> : (
          <ProductGrid>
            {filteredAllNonSwag.map(g => (
              <ProductTile
                key={g.name}
                imageUrl={g.imageUrl}
                label={g.brand}
                name={g.name}
                sub={`${g.variants.length} variant${g.variants.length !== 1 ? 's' : ''}`}
                price={tilePrice(g)}
                onQuickView={() => openQuickView(g)}
                isPipe={g.variants.some(v => v.isPipe)}
              />
            ))}
            {filteredSwagGroups.map(g => (
              <ProductTile
                key={g.name}
                imageUrl={g.imageUrl}
                label="JTTC Swag"
                name={g.name}
                sub={`${g.variants.length} variant${g.variants.length !== 1 ? 's' : ''}`}
                price={tilePrice(g)}
                onQuickView={() => openQuickView(g)}
              />
            ))}
          </ProductGrid>
        )
      )}

      {/* Single unified modal for all product types */}
      {openProduct && (
        <ProductModal group={openProduct} onClose={() => setOpenProduct(null)} />
      )}
    </div>
  );
}

function ProductGrid({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px"
      style={{ background: 'var(--color-charcoal-mid)' }}
    >
      {children}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-24 text-center" style={{ color: 'var(--color-smoke)' }}>
      No products match your filters.
    </div>
  );
}

function ProductTile({ imageUrl, label, name, sub, price, onQuickView, isPipe = false }: {
  imageUrl: string | null;
  label: string;
  name: string;
  sub: string;
  price: string;
  onQuickView: () => void;
  isPipe?: boolean;
}) {
  const slug = nameToSlug(name);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [clicked, setClicked] = useState(false);
  const loading = isPending || clicked;

  return (
    <div
      className="flex flex-col group"
      style={{ background: 'var(--color-charcoal)', position: 'relative' }}
    >
      {/* Image with hover action buttons */}
      <div
        className="aspect-[3/2] relative overflow-hidden w-full"
        style={{ background: 'var(--color-charcoal-mid)' }}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-end p-3">
            <span style={{ color: 'var(--color-charcoal-light)', fontSize: '0.65rem', letterSpacing: '0.1em' }}>
              Photo Coming Soon
            </span>
          </div>
        )}

        {/* Hover overlay buttons */}
        <div
          className="absolute inset-x-0 bottom-0 flex opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 transition-opacity duration-200"
        >
          <button
            onClick={onQuickView}
            style={{
              flex: 1,
              padding: '0.6rem 0',
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              background: 'rgba(15,15,15,0.88)',
              color: 'var(--color-cream)',
              border: 'none',
              borderRight: '1px solid var(--color-charcoal-mid)',
              cursor: 'pointer',
              backdropFilter: 'blur(4px)',
            }}
          >
            Quick View
          </button>
          <button
            onClick={() => {
              setClicked(true);
              startTransition(() => router.push(`/shop/${slug}`));
            }}
            disabled={loading}
            style={{
              flex: 1,
              padding: '0.6rem 0',
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              background: loading ? 'var(--color-charcoal-mid)' : 'var(--color-terracotta)',
              color: 'var(--color-cream)',
              border: 'none',
              cursor: loading ? 'wait' : 'pointer',
              transition: 'background 0.15s',
            }}
          >
            {loading ? 'Loading…' : 'Detailed View'}
          </button>
        </div>
      </div>

      {/* Card body */}
      <div className="flex flex-col p-5" style={{ flex: 1 }}>
        {label && (
          <div style={{ color: 'var(--color-terracotta)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            {label}
          </div>
        )}

        <h3 className="font-semibold mb-1" style={{ color: 'var(--color-cream)', fontSize: '0.9rem', lineHeight: 1.3, flex: 1 }}>
          {name}
        </h3>

        <div style={{ color: 'var(--color-smoke)', fontSize: '0.7rem', marginBottom: '0.5rem' }}>
          {sub}
        </div>

        <div className="font-semibold mt-auto pt-2" style={{ color: 'var(--color-amber)', fontSize: '1rem', borderTop: '1px solid var(--color-charcoal-mid)' }}>
          {price}
        </div>

        {isPipe && (
          <a
            href={`/account/pipes/collection/add?product_slug=${slug}`}
            style={{
              display: 'block',
              textAlign: 'center',
              marginTop: '0.6rem',
              padding: '0.45rem',
              fontSize: '0.62rem',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--color-terracotta)',
              border: '1px solid var(--color-terracotta)',
              background: 'transparent',
              textDecoration: 'none',
            }}
          >
            + My Pipe Rack
          </a>
        )}
      </div>
    </div>
  );
}
