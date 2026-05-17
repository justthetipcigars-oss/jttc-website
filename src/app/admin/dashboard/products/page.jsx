'use client';

import { useState, useEffect, useCallback } from 'react';

function estNow() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset() - 300);
  return d;
}
function estDate(d) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}
function today()        { return estDate(estNow()); }
function daysAgo(n)     { const d = estNow(); d.setUTCDate(d.getUTCDate() - n); return estDate(d); }
function startOfWeek()  { const d = estNow(); d.setUTCDate(d.getUTCDate() - d.getUTCDay()); return estDate(d); }
function startOfMonth() { const d = estNow(); return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-01`; }
function startOfQuarter() {
  const d = estNow();
  const qMonth = Math.floor(d.getUTCMonth() / 3) * 3;
  return `${d.getUTCFullYear()}-${String(qMonth + 1).padStart(2, '0')}-01`;
}
function startOfYear()  { return `${estNow().getUTCFullYear()}-01-01`; }
function lastMonth() {
  const d = estNow();
  const y = d.getUTCMonth() === 0 ? d.getUTCFullYear() - 1 : d.getUTCFullYear();
  const m = d.getUTCMonth() === 0 ? 12 : d.getUTCMonth();
  return {
    from: `${y}-${String(m).padStart(2, '0')}-01`,
    to: estDate(new Date(Date.UTC(y, m, 0))),
  };
}

const PRESETS = [
  { label: 'Today',     getValue: () => ({ from: today(),          to: null }) },
  { label: 'This Week', getValue: () => ({ from: startOfWeek(),    to: null }) },
  { label: 'This Month',getValue: () => ({ from: startOfMonth(),   to: null }) },
  { label: 'Last Month',getValue: () => lastMonth() },
  { label: 'Quarter',   getValue: () => ({ from: startOfQuarter(), to: null }) },
  { label: 'YTD',       getValue: () => ({ from: startOfYear(),    to: null }) },
  { label: '30 Days',   getValue: () => ({ from: daysAgo(30),      to: null }) },
  { label: '90 Days',   getValue: () => ({ from: daysAgo(90),      to: null }) },
];

const fmt   = n => `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtV  = v => v >= 1 ? `${v.toFixed(1)}/day` : v >= 0.14 ? `${(v * 7).toFixed(1)}/wk` : `${(v * 30).toFixed(1)}/mo`;

function Skeleton({ className }) {
  return <div className={`animate-pulse bg-gray-800 rounded ${className}`} />;
}

const SPEED_CONFIG = {
  top:       { label: 'Top Mover',      bg: 'bg-emerald-500/20', text: 'text-emerald-300', dot: 'bg-emerald-400' },
  fast:      { label: 'Fast Mover',     bg: 'bg-sky-500/20',     text: 'text-sky-300',     dot: 'bg-sky-400'     },
  average:   { label: 'Average Mover',  bg: 'bg-gray-500/20',    text: 'text-gray-300',    dot: 'bg-gray-400'    },
  slow:      { label: 'Slow Mover',     bg: 'bg-amber-500/20',   text: 'text-amber-300',   dot: 'bg-amber-400'   },
  attention: { label: 'Needs Attention',bg: 'bg-red-500/20',     text: 'text-red-300',     dot: 'bg-red-500'     },
};

function SpeedBadge({ speed }) {
  const cfg = SPEED_CONFIG[speed] || SPEED_CONFIG.average;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function DaysRemaining({ days }) {
  if (days === null) return <span className="text-gray-400">—</span>;
  const color = days <= 7 ? 'text-red-400' : days <= 30 ? 'text-amber-400' : 'text-emerald-400';
  return <span className={`font-semibold ${color}`}>{days}d</span>;
}

export default function ProductsPage() {
  const [activePreset, setActivePreset] = useState('30 Days');
  const [customFrom, setCustomFrom]     = useState('');
  const [customTo, setCustomTo]         = useState('');
  const [data, setData]                 = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  const [search, setSearch]             = useState('');
  const [brandFilter, setBrandFilter]   = useState('all');
  const [macroFilter, setMacroFilter]   = useState('all');
  const [subFilter, setSubFilter]       = useState('all');
  const [tierFilter, setTierFilter]     = useState('all');

  const [sortField, setSortField]       = useState('unitsSold');
  const [sortDir, setSortDir]           = useState('desc');

  const fetchData = useCallback(async (from, to) => {
    setLoading(true);
    setError(null);
    try {
      const dateFrom = `${from}T05:00:00Z`;
      const dateTo   = to ? `${to}T04:59:59Z` : null;
      let url = `/api/admin/dashboard/products?date_from=${dateFrom}`;
      if (dateTo) url += `&date_to=${dateTo}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch product data');
      setData(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const { from, to } = PRESETS.find(p => p.label === '30 Days').getValue();
    fetchData(from, to);
  }, [fetchData]);

  function handlePreset(preset) {
    setActivePreset(preset.label);
    const { from, to } = preset.getValue();
    fetchData(from, to);
  }

  function handleCustom() {
    if (!customFrom) return;
    setActivePreset('Custom');
    fetchData(customFrom, customTo || null);
  }

  function toggleSort(field) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  }

  const allProducts = data?.products || [];
  const filtered = allProducts
    .filter(p => {
      if (tierFilter !== 'all' && p.speed !== tierFilter) return false;
      if (brandFilter !== 'all' && p.brand !== brandFilter) return false;
      if (macroFilter !== 'all' && p.categoryMacro !== macroFilter) return false;
      if (subFilter !== 'all' && p.categorySub !== subFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          (p.brand || '').toLowerCase().includes(q) ||
          (p.categoryMacro || '').toLowerCase().includes(q) ||
          (p.categorySub || '').toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      const av = a[sortField] ?? 0;
      const bv = b[sortField] ?? 0;
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });

  function Th({ field, children, right }) {
    const active = sortField === field;
    return (
      <th
        className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none transition-colors whitespace-nowrap ${active ? 'text-amber-400' : 'text-gray-200 hover:text-gray-200'} ${right ? 'text-right' : 'text-left'}`}
        onClick={() => toggleSort(field)}
      >
        {children} {active ? (sortDir === 'asc' ? '↑' : '↓') : <span className="opacity-40">↕</span>}
      </th>
    );
  }

  const tierCounts = { top: 0, fast: 0, average: 0, slow: 0, attention: 0 };
  allProducts.forEach(p => { if (tierCounts[p.speed] !== undefined) tierCounts[p.speed]++; });
  const topProduct  = allProducts[0];
  const totalUnits  = allProducts.reduce((s, p) => s + p.unitsSold, 0);
  const totalRev    = allProducts.reduce((s, p) => s + p.revenue, 0);

  const TIERS = [
    { key: 'top',       label: 'Top Movers',      color: 'text-emerald-400', activeBg: 'bg-emerald-500',  activeText: 'text-gray-950' },
    { key: 'fast',      label: 'Fast Movers',      color: 'text-sky-400',     activeBg: 'bg-sky-500',      activeText: 'text-gray-950' },
    { key: 'average',   label: 'Average Movers',   color: 'text-gray-300',    activeBg: 'bg-gray-500',     activeText: 'text-white'    },
    { key: 'slow',      label: 'Slow Movers',      color: 'text-amber-400',   activeBg: 'bg-amber-500',    activeText: 'text-gray-950' },
    { key: 'attention', label: 'Needs Attention',  color: 'text-red-400',     activeBg: 'bg-red-600',      activeText: 'text-white'    },
  ];

  return (
    <div className="text-white max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center gap-2 mb-8">
        {PRESETS.map(preset => (
          <button key={preset.label} onClick={() => handlePreset(preset)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
              activePreset === preset.label
                ? 'bg-amber-500 text-gray-950 shadow-lg shadow-amber-500/20'
                : 'bg-gray-800/80 text-gray-300 hover:text-white hover:bg-gray-700'}`}>
            {preset.label}
          </button>
        ))}
        <div className="flex items-center gap-2 pl-2 border-l border-gray-800">
          <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700/50 text-white text-sm focus:outline-none focus:border-amber-500 w-36" />
          <span className="text-gray-300">–</span>
          <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700/50 text-white text-sm focus:outline-none focus:border-amber-500 w-36" />
          <button onClick={handleCustom} disabled={!customFrom}
            className="px-3.5 py-1.5 rounded-full bg-gray-700 text-white text-sm hover:bg-gray-600 disabled:opacity-30 transition-all font-medium">
            Apply
          </button>
        </div>
      </div>

      {error && <div className="mb-6 px-4 py-3 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-sm">{error}</div>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-gray-900/60 rounded-2xl border border-gray-800/60 p-5">
          <div className="text-xs text-gray-200 uppercase tracking-wider mb-2">Products Moving</div>
          {loading ? <Skeleton className="h-8 w-20" /> : <div className="text-3xl font-black text-white">{allProducts.length}</div>}
          {!loading && <div className="text-sm text-gray-200 mt-1">{data?.daysInPeriod}d period</div>}
        </div>
        <div className="bg-gray-900/60 rounded-2xl border border-gray-800/60 p-5">
          <div className="text-xs text-gray-200 uppercase tracking-wider mb-2">Total Units Sold</div>
          {loading ? <Skeleton className="h-8 w-24" /> : <div className="text-3xl font-black text-white">{Math.round(totalUnits).toLocaleString()}</div>}
          {!loading && <div className="text-sm text-gray-200 mt-1">{fmt(totalRev)} revenue</div>}
        </div>
        <div className="bg-emerald-900/20 rounded-2xl border border-emerald-800/30 p-5">
          <div className="text-xs text-emerald-400 uppercase tracking-wider mb-2">Top Movers</div>
          {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-3xl font-black text-emerald-300">{tierCounts.top}</div>}
          {!loading && topProduct && (
            <div className="text-sm text-gray-200 mt-1 truncate" title={topProduct.name}>#{1}: {topProduct.name}</div>
          )}
        </div>
        <div className="bg-red-900/20 rounded-2xl border border-red-800/30 p-5">
          <div className="text-xs text-red-400 uppercase tracking-wider mb-2">Needs Attention</div>
          {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-3xl font-black text-red-300">{tierCounts.attention}</div>}
          {!loading && <div className="text-sm text-gray-200 mt-1">Bottom 10% by velocity</div>}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => { setTierFilter('all'); setSortField('unitsSold'); setSortDir('desc'); }}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
            tierFilter === 'all'
              ? 'bg-gray-700 border-gray-500 text-white'
              : 'bg-gray-900/50 border-gray-800 text-gray-200 hover:text-white hover:border-gray-600'}`}>
          All {!loading && <span className="ml-2 text-xs opacity-60">{allProducts.length}</span>}
        </button>
        {TIERS.map(t => (
          <button key={t.key}
            onClick={() => { setTierFilter(t.key); setSortField('velocity'); setSortDir('desc'); }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
              tierFilter === t.key
                ? `${t.activeBg} border-transparent ${t.activeText}`
                : 'bg-gray-900/50 border-gray-800 text-gray-200 hover:text-white hover:border-gray-600'}`}>
            {t.label} {!loading && <span className="ml-2 text-xs opacity-70">{tierCounts[t.key]}</span>}
          </button>
        ))}
      </div>

      <div className="mb-4 space-y-2">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => { setMacroFilter('all'); setSubFilter('all'); }}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
              macroFilter === 'all' ? 'bg-amber-500 text-gray-950' : 'bg-gray-800/80 text-gray-300 hover:text-white hover:bg-gray-700'}`}>
            All Categories
          </button>
          {Object.keys(data?.categoryTree || {}).map(macro => (
            <button key={macro} onClick={() => { setMacroFilter(macro); setSubFilter('all'); }}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                macroFilter === macro ? 'bg-amber-500 text-gray-950' : 'bg-gray-800/80 text-gray-300 hover:text-white hover:bg-gray-700'}`}>
              {macro}
            </button>
          ))}
        </div>
        {macroFilter !== 'all' && (data?.categoryTree?.[macroFilter]?.length > 0) && (
          <div className="flex flex-wrap gap-2 pl-2 border-l-2 border-amber-500/40">
            <button onClick={() => setSubFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                subFilter === 'all' ? 'bg-gray-600 text-white' : 'bg-gray-800/60 text-gray-200 hover:text-white hover:bg-gray-700'}`}>
              All {macroFilter}
            </button>
            {data.categoryTree[macroFilter].map(sub => (
              <button key={sub} onClick={() => setSubFilter(sub)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  subFilter === sub ? 'bg-gray-600 text-white' : 'bg-gray-800/60 text-gray-200 hover:text-white hover:bg-gray-700'}`}>
                {sub}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-200 text-sm">🔍</span>
          <input type="text" placeholder="Search products, brands..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-800/80 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 text-sm" />
        </div>
        <select value={brandFilter} onChange={e => setBrandFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-gray-800 border border-gray-700/50 text-white text-sm focus:outline-none focus:border-amber-500">
          <option value="all">All Brands</option>
          {(data?.brands || []).map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      <div className="bg-gray-900/50 rounded-2xl border border-gray-800/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-800/60 border-b border-gray-800">
              <tr>
                <Th field="name">Product</Th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-200 uppercase tracking-wider text-left">Brand</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-200 uppercase tracking-wider text-left">Category</th>
                <Th field="unitsSold" right>Units Sold</Th>
                <Th field="revenue" right>Revenue</Th>
                <Th field="velocity" right>Velocity</Th>
                <Th field="sellThrough" right>Sell-Through</Th>
                <Th field="currentStock" right>In Stock</Th>
                <Th field="daysRemaining" right>Days Left</Th>
                <Th field="speed">Speed</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/40">
              {loading ? (
                Array.from({ length: 15 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-40" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-12 ml-auto" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-16 ml-auto" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-16 ml-auto" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-14 ml-auto" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-12 ml-auto" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-12 ml-auto" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-6 w-16" /></td>
                  </tr>
                ))
              ) : filtered.map(p => (
                <tr key={p.id} className="hover:bg-gray-800/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-white max-w-[220px] truncate" title={p.name}>{p.name}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-300 whitespace-nowrap">{p.brand || <span className="text-gray-400">—</span>}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {p.categoryMacro ? (
                      <div>
                        <span className="text-gray-300">{p.categoryMacro}</span>
                        {p.categorySub && <span className="text-gray-300 text-xs ml-1">/ {p.categorySub}</span>}
                      </div>
                    ) : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-semibold text-white">{p.unitsSold.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-semibold text-emerald-400">{fmt(p.revenue)}</span>
                    {p.margin > 0 && <div className="text-xs text-gray-300 mt-0.5">{p.margin}% margin</div>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-mono text-amber-300 font-medium">{fmtV(p.velocity)}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {p.sellThrough !== null ? (
                      <div className="flex flex-col items-end gap-1">
                        <span className={`font-semibold text-sm ${p.sellThrough >= 80 ? 'text-emerald-400' : p.sellThrough >= 50 ? 'text-amber-400' : 'text-gray-300'}`}>
                          {p.sellThrough}%
                        </span>
                        <div className="w-16 h-1 bg-gray-800 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${p.sellThrough >= 80 ? 'bg-emerald-500' : p.sellThrough >= 50 ? 'bg-amber-500' : 'bg-gray-500'}`}
                            style={{ width: `${Math.min(p.sellThrough, 100)}%` }} />
                        </div>
                      </div>
                    ) : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={p.currentStock <= 0 ? 'text-red-400 font-semibold' : 'text-gray-200 font-medium'}>
                      {p.currentStock > 0 ? p.currentStock.toLocaleString() : 'Out'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DaysRemaining days={p.daysRemaining} />
                  </td>
                  <td className="px-4 py-3"><SpeedBadge speed={p.speed} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length === 0 && <div className="text-center py-16 text-gray-300">No products match your filters</div>}
        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-800/50 text-xs text-gray-300">
            Showing {filtered.length.toLocaleString()} of {allProducts.length.toLocaleString()} products · {data?.daysInPeriod} day period
          </div>
        )}
      </div>
    </div>
  );
}
