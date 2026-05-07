'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend
} from 'recharts';

const PRESETS = [
  { label: 'Today',      getValue: () => ({ from: today(), to: null }) },
  { label: 'This Week',  getValue: () => ({ from: startOfWeek(), to: null }) },
  { label: 'This Month', getValue: () => ({ from: startOfMonth(), to: null }) },
  { label: 'Last Month', getValue: () => lastMonth() },
  { label: 'YTD',        getValue: () => ({ from: startOfYear(), to: null }) },
  { label: '30 Days',    getValue: () => ({ from: daysAgo(30), to: null }) },
  { label: '90 Days',    getValue: () => ({ from: daysAgo(90), to: null }) },
  { label: 'Lifetime',   getValue: () => ({ from: '2023-07-01', to: null }) },
];

function estNow() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset() - 300);
  return d;
}
function estDate(d) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`;
}
function today()        { return estDate(estNow()); }
function daysAgo(n)     { const d = estNow(); d.setUTCDate(d.getUTCDate() - n); return estDate(d); }
function startOfWeek()  { const d = estNow(); d.setUTCDate(d.getUTCDate() - d.getUTCDay()); return estDate(d); }
function startOfMonth() { const d = estNow(); return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-01`; }
function startOfYear()  { return `${estNow().getUTCFullYear()}-01-01`; }
function lastMonth() {
  const d = estNow();
  const y = d.getUTCMonth() === 0 ? d.getUTCFullYear()-1 : d.getUTCFullYear();
  const m = d.getUTCMonth() === 0 ? 12 : d.getUTCMonth();
  return {
    from: `${y}-${String(m).padStart(2,'0')}-01`,
    to: estDate(new Date(Date.UTC(y, m, 0))),
  };
}

const fmt    = n => `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtInt = n => Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 });

function Skeleton({ className }) {
  return <div className={`animate-pulse bg-gray-800 rounded ${className}`} />;
}

function StatBox({ label, value, sub, color = 'text-white', loading }) {
  return (
    <div className="bg-gray-900/60 rounded-xl border border-gray-800/60 p-4">
      <div className="text-xs text-gray-300 uppercase tracking-wider mb-2">{label}</div>
      {loading ? <Skeleton className="h-7 w-28" /> : <div className={`text-xl font-bold ${color}`}>{value}</div>}
      {sub && !loading && <div className="text-xs text-gray-300 mt-1">{sub}</div>}
    </div>
  );
}

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 shadow-xl text-sm">
      <p className="text-gray-200 text-xs mb-1">{label}</p>
      <p className="text-white font-semibold">{fmt(payload[0].value)}</p>
    </div>
  );
};

export default function CustomerDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [customer, setCustomer]   = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedVisit, setExpandedVisit] = useState(null);

  const [activePreset, setActivePreset] = useState('Lifetime');
  const [customFrom, setCustomFrom]     = useState('');
  const [customTo, setCustomTo]         = useState('');

  const [overviewProductSort, setOverviewProductSort] = useState('spend');
  const [productSort, setProductSort]       = useState('totalSpend');
  const [productSortDir, setProductSortDir] = useState('desc');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const fetchSales = useCallback(async (from, to) => {
    setLoading(true);
    setSalesData(null);
    try {
      const dateFrom = `${from}T05:00:00Z`;
      const dateTo   = to ? `${to}T04:59:59Z` : null;
      let url = `/api/admin/dashboard/customers/${id}/sales?date_from=${dateFrom}`;
      if (dateTo) url += `&date_to=${dateTo}`;
      const res = await fetch(url);
      setSalesData(await res.json());
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res  = await fetch('/api/admin/dashboard/customers');
        const data = await res.json();
        const found = data.customers?.find(c => c.id === id);
        setCustomer(found || { id, name: 'Customer', email: null, phone: null, createdAt: null });
      } catch {
        setCustomer({ id, name: 'Customer', email: null, phone: null, createdAt: null });
      }
    }
    loadProfile();
    const { from, to } = PRESETS.find(p => p.label === 'Lifetime').getValue();
    fetchSales(from, to);
  }, [id, fetchSales]);

  function handlePreset(preset) {
    setActivePreset(preset.label);
    const { from, to } = preset.getValue();
    fetchSales(from, to);
  }

  function handleCustom() {
    if (!customFrom) return;
    setActivePreset('Custom');
    fetchSales(customFrom, customTo || null);
  }

  const isLifetime      = activePreset === 'Lifetime';
  const spendLabel      = isLifetime ? 'Lifetime Spend' : 'Period Spend';
  const visitLabel      = isLifetime ? 'Total Visits'   : 'Visits in Period';

  function toggleProductSort(field) {
    if (productSort === field) setProductSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setProductSort(field); setProductSortDir('desc'); }
  }

  const categories = salesData
    ? ['All', ...Array.from(new Set(salesData.favoriteProducts.map(p => p.category))).sort()]
    : ['All'];

  const filteredProducts = salesData
    ? salesData.favoriteProducts.filter(p => categoryFilter === 'All' || p.category === categoryFilter)
    : [];

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const av = a[productSort] ?? 0, bv = b[productSort] ?? 0;
    return productSortDir === 'asc' ? av - bv : bv - av;
  });

  const maxFilteredSpend = Math.max(...filteredProducts.map(p => p.totalSpend), 1);
  const maxFilteredQty   = Math.max(...filteredProducts.map(p => p.totalQty), 1);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'visits',   label: `Visits${salesData ? ` (${salesData.visitCount})` : ''}` },
    { id: 'products', label: 'Products' },
    { id: 'trends',   label: 'Trends' },
  ];

  return (
    <div className="text-white max-w-7xl mx-auto">
      <button
        onClick={() => router.push('/admin/dashboard/customers')}
        className="flex items-center gap-1.5 text-gray-300 hover:text-white text-sm mb-5 transition-colors group"
      >
        <span className="group-hover:-translate-x-0.5 transition-transform">←</span> All Customers
      </button>

      <div className="bg-gradient-to-br from-gray-900 to-gray-900/40 rounded-2xl border border-gray-800/60 p-6 mb-5">
        {!customer ? (
          <div className="flex items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-full" />
            <div className="space-y-2"><Skeleton className="h-7 w-48" /><Skeleton className="h-4 w-64" /></div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center text-white font-black text-2xl shrink-0">
              {customer?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold tracking-tight">{customer?.name}</h1>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-200 mt-1">
                {customer?.email && <span>✉ {customer.email}</span>}
                {customer?.phone && <span>📞 {customer.phone}</span>}
                {customer?.createdAt && <span>Member since {new Date(customer.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>}
              </div>
            </div>
            {salesData && (
              <div className="flex gap-6 text-center shrink-0">
                <div>
                  <div className="text-2xl font-black text-emerald-400">{fmt(salesData.totalSpend)}</div>
                  <div className="text-xs text-gray-300 mt-0.5">{spendLabel}</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-white">{salesData.visitCount}</div>
                  <div className="text-xs text-gray-300 mt-0.5">{visitLabel}</div>
                </div>
              </div>
            )}
            {loading && !salesData && (
              <div className="flex gap-6 text-center shrink-0">
                <div><Skeleton className="h-8 w-24 mb-1" /><Skeleton className="h-3 w-20" /></div>
                <div><Skeleton className="h-8 w-12 mb-1" /><Skeleton className="h-3 w-16" /></div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-5">
        {PRESETS.map(preset => (
          <button key={preset.label} onClick={() => handlePreset(preset)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
              activePreset === preset.label ? 'bg-amber-500 text-gray-950 shadow-lg shadow-amber-500/20' : 'bg-gray-800/80 text-gray-200 hover:text-white hover:bg-gray-700'}`}>
            {preset.label}
          </button>
        ))}
        <div className="flex items-center gap-2 pl-2 border-l border-gray-800">
          <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700/50 text-white text-sm focus:outline-none focus:border-amber-500 w-36" />
          <span className="text-gray-200">–</span>
          <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700/50 text-white text-sm focus:outline-none focus:border-amber-500 w-36" />
          <button onClick={handleCustom} disabled={!customFrom}
            className="px-3.5 py-1.5 rounded-full bg-gray-700 text-white text-sm hover:bg-gray-600 disabled:opacity-30 transition-all font-medium">
            Apply
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <StatBox label="Avg Visit Value" value={salesData ? fmt(salesData.avgVisitValue) : '—'} color="text-amber-400" loading={loading} />
        <StatBox label="Visit Frequency" value={salesData?.avgDaysBetweenVisits ? `Every ${salesData.avgDaysBetweenVisits}d` : '—'}
          sub={salesData?.visitCount === 1 ? 'Only 1 visit' : null} color="text-blue-400" loading={loading} />
        <StatBox label="Last Visit"
          value={salesData?.lastVisit ? new Date(salesData.lastVisit).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
          color="text-white" loading={loading} />
        <StatBox label="First Visit"
          value={salesData?.firstVisit ? new Date(salesData.firstVisit).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
          color="text-gray-300" loading={loading} />
      </div>

      <div className="flex gap-0.5 border-b border-gray-800 mb-5">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
              activeTab === tab.id ? 'border-amber-500 text-amber-400' : 'border-transparent text-gray-400 hover:text-white'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-gray-900/50 rounded-2xl border border-gray-800/60 p-5">
            <h2 className="text-sm font-semibold text-gray-200 uppercase tracking-wider mb-4">Monthly Spend</h2>
            {loading ? <Skeleton className="h-56 w-full" /> : salesData?.monthlyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={salesData.monthlyTrend} barCategoryGap="30%">
                  <CartesianGrid vertical={false} stroke="#1f2937" strokeDasharray="3 3" />
                  <XAxis dataKey="month" stroke="transparent" tick={{ fill: '#d1d5db', fontSize: 10 }} tickLine={false} />
                  <YAxis stroke="transparent" tick={{ fill: '#d1d5db', fontSize: 10 }} tickFormatter={v => `$${v}`} tickLine={false} axisLine={false} width={40} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', fontSize: '12px' }}
                    labelStyle={{ color: '#9ca3af', marginBottom: '4px' }}
                    formatter={(value, name) => [fmt(value), name === 'revenue' ? 'Revenue' : 'Gross Profit']} />
                  <Legend formatter={name => name === 'revenue' ? 'Revenue' : 'Gross Profit'}
                    wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="revenue"     fill="#3b82f6" radius={[3, 3, 0, 0]} opacity={0.85} />
                  <Bar dataKey="grossProfit" fill="#10b981" radius={[3, 3, 0, 0]} opacity={0.85} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-gray-400 py-16 text-center">No purchase history in this period</p>}
          </div>

          <div className="bg-gray-900/50 rounded-2xl border border-gray-800/60 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">Top Products</h2>
              <div className="flex gap-1">
                {[['spend', 'Spend'], ['qty', 'Qty']].map(([val, label]) => (
                  <button key={val} onClick={() => setOverviewProductSort(val)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${overviewProductSort === val ? 'bg-amber-500 text-gray-950' : 'bg-gray-800 text-gray-200 hover:text-white'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {!loading && categories.length > 2 && (
              <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
                className="w-full mb-3 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700/50 text-white text-xs focus:outline-none focus:border-amber-500">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            )}
            {loading
              ? <div className="space-y-3">{Array.from({length:5}).map((_,i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
              : filteredProducts.length === 0
                ? <p className="text-gray-400 py-8 text-center text-sm">No products in this category</p>
                : [...filteredProducts]
                    .sort((a, b) => overviewProductSort === 'qty' ? b.totalQty - a.totalQty : b.totalSpend - a.totalSpend)
                    .slice(0, 7)
                    .map(p => {
                      const isQty  = overviewProductSort === 'qty';
                      const barPct = isQty ? (p.totalQty / maxFilteredQty) * 100 : (p.totalSpend / maxFilteredSpend) * 100;
                      return (
                        <div key={p.productId} className="mb-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-300 truncate flex-1 pr-2">{p.name.split(' / ')[0]}</span>
                            <span className={`shrink-0 font-medium ${isQty ? 'text-blue-400' : 'text-emerald-400'}`}>
                              {isQty ? `${fmtInt(p.totalQty)} units` : fmt(p.totalSpend)}
                            </span>
                          </div>
                          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full bg-gradient-to-r ${isQty ? 'from-blue-600 to-blue-400' : 'from-emerald-600 to-emerald-400'}`}
                              style={{ width: `${barPct}%` }} />
                          </div>
                        </div>
                      );
                    })
            }
          </div>
        </div>
      )}

      {activeTab === 'visits' && (
        <div className="bg-gray-900/50 rounded-2xl border border-gray-800/60 overflow-hidden">
          {loading ? (
            <div className="divide-y divide-gray-800">
              {Array.from({length:8}).map((_,i) => (
                <div key={i} className="px-5 py-4 flex justify-between items-center">
                  <Skeleton className="h-4 w-32" /><Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-gray-800/50">
              {salesData?.visits.map(v => (
                <div key={v.invoiceNumber}>
                  <div className="px-5 py-4 flex items-center gap-4 hover:bg-gray-800/30 transition-colors cursor-pointer"
                    onClick={() => setExpandedVisit(expandedVisit === v.invoiceNumber ? null : v.invoiceNumber)}>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-white font-medium">
                          {new Date(v.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="text-gray-400 text-xs">#{v.invoiceNumber}</span>
                      </div>
                      <div className="text-gray-300 text-xs mt-0.5">{v.itemCount} item{v.itemCount !== 1 ? 's' : ''}</div>
                    </div>
                    <span className="text-emerald-400 font-semibold">{fmt(v.total)}</span>
                    <span className={`text-gray-400 text-xs transition-transform ${expandedVisit === v.invoiceNumber ? 'rotate-90' : ''}`}>▶</span>
                  </div>
                  {expandedVisit === v.invoiceNumber && (
                    <div className="bg-gray-900/80 border-t border-gray-800/50 px-5 py-3">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-gray-400 uppercase">
                            <th className="text-left pb-2">Product</th>
                            <th className="text-center pb-2">Qty</th>
                            <th className="text-right pb-2">Unit</th>
                            <th className="text-right pb-2">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/30">
                          {v.items.map((item, i) => (
                            <tr key={i} className="text-gray-300">
                              <td className="py-1.5 pr-4">{item.name || 'Unknown product'}</td>
                              <td className="py-1.5 text-center text-gray-300">{item.qty}</td>
                              <td className="py-1.5 text-right text-gray-300">{fmt(item.unitPrice)}</td>
                              <td className="py-1.5 text-right text-emerald-400 font-medium">{fmt(item.total)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {!loading && salesData?.visits.length === 0 && (
            <div className="text-center py-16 text-gray-400">No visits in this period</div>
          )}
        </div>
      )}

      {activeTab === 'products' && (
        <div className="bg-gray-900/50 rounded-2xl border border-gray-800/60 overflow-hidden">
          {!loading && categories.length > 2 && (
            <div className="px-5 py-3 border-b border-gray-800 flex items-center gap-3">
              <span className="text-xs text-gray-300 uppercase tracking-wider shrink-0">Category</span>
              <div className="flex flex-wrap gap-2">
                {categories.map(c => (
                  <button key={c} onClick={() => setCategoryFilter(c)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${categoryFilter === c ? 'bg-amber-500 text-gray-950' : 'bg-gray-800 text-gray-200 hover:text-white hover:bg-gray-700'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}
          <table className="w-full text-sm">
            <thead className="bg-gray-800/50 border-b border-gray-800">
              <tr>
                <th className="px-5 py-3 text-left text-xs text-gray-300 uppercase tracking-wider">Product</th>
                {[
                  { field: 'visitCount', label: 'Purchases', align: 'text-center' },
                  { field: 'totalQty',   label: 'Units',     align: 'text-center' },
                  { field: 'totalSpend', label: 'Total Spend', align: 'text-right' },
                ].map(({ field, label, align }) => {
                  const active = productSort === field;
                  return (
                    <th key={field} onClick={() => toggleProductSort(field)}
                      className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none transition-colors ${align} ${active ? 'text-amber-400' : 'text-gray-300 hover:text-gray-300'}`}>
                      {label} {active ? (productSortDir === 'asc' ? '↑' : '↓') : <span className="opacity-30">↕</span>}
                    </th>
                  );
                })}
                <th className="px-5 py-3 w-32" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/40">
              {loading
                ? Array.from({length:8}).map((_,i) => (
                  <tr key={i}><td colSpan={5} className="px-5 py-4"><Skeleton className="h-4 w-full" /></td></tr>
                ))
                : sortedProducts.map((p, i) => {
                  const barMax = productSort === 'totalQty' ? maxFilteredQty : maxFilteredSpend;
                  const barVal = productSort === 'totalQty' ? p.totalQty : p.totalSpend;
                  const barColor = productSort === 'totalQty' ? 'bg-blue-500/70' : 'bg-emerald-500/70';
                  return (
                    <tr key={p.productId} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="text-gray-500 text-xs w-5 shrink-0 font-mono">#{i+1}</span>
                          <div>
                            <div className="text-white font-medium">{p.name.split(' / ')[0]}</div>
                            {p.name.includes(' / ') && <div className="text-gray-300 text-xs">{p.name.split(' / ').slice(1).join(' / ')}</div>}
                            {p.category && p.category !== 'Uncategorized' && (
                              <div className="text-xs text-gray-400 mt-0.5">{p.category}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-center text-gray-300">{p.visitCount}</td>
                      <td className={`px-5 py-3.5 text-center font-medium ${productSort === 'totalQty' ? 'text-blue-400' : 'text-gray-300'}`}>
                        {fmtInt(p.totalQty)}
                      </td>
                      <td className={`px-5 py-3.5 text-right font-semibold ${productSort === 'totalSpend' ? 'text-emerald-400' : 'text-gray-300'}`}>
                        {fmt(p.totalSpend)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${barColor}`} style={{ width: `${(barVal / barMax) * 100}%` }} />
                        </div>
                      </td>
                    </tr>
                  );
                })
              }
            </tbody>
          </table>
          {!loading && sortedProducts.length === 0 && (
            <div className="text-center py-16 text-gray-400">No products in this period</div>
          )}
        </div>
      )}

      {activeTab === 'trends' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-gray-900/50 rounded-2xl border border-gray-800/60 p-5">
            <h2 className="text-sm font-semibold text-gray-200 uppercase tracking-wider mb-4">Spend by Month</h2>
            {loading ? <Skeleton className="h-52 w-full" /> : (
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={salesData?.monthlyTrend} barCategoryGap="30%">
                  <CartesianGrid vertical={false} stroke="#1f2937" strokeDasharray="3 3" />
                  <XAxis dataKey="month" stroke="transparent" tick={{ fill: '#d1d5db', fontSize: 10 }} tickLine={false} />
                  <YAxis stroke="transparent" tick={{ fill: '#d1d5db', fontSize: 10 }} tickFormatter={v => `$${v}`} tickLine={false} axisLine={false} width={40} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', fontSize: '12px' }}
                    labelStyle={{ color: '#9ca3af', marginBottom: '4px' }}
                    formatter={(value, name) => [fmt(value), name === 'revenue' ? 'Revenue' : 'Gross Profit']} />
                  <Legend formatter={name => name === 'revenue' ? 'Revenue' : 'Gross Profit'}
                    wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="revenue"     fill="#3b82f6" radius={[3, 3, 0, 0]} opacity={0.85} />
                  <Bar dataKey="grossProfit" fill="#10b981" radius={[3, 3, 0, 0]} opacity={0.85} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-gray-900/50 rounded-2xl border border-gray-800/60 p-5">
            <h2 className="text-sm font-semibold text-gray-200 uppercase tracking-wider mb-4">Top Products by Spend</h2>
            {loading ? <Skeleton className="h-52 w-full" /> : (
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={salesData?.favoriteProducts.slice(0, 8)} layout="vertical" margin={{ left: 0 }}>
                  <CartesianGrid horizontal={false} stroke="#1f2937" strokeDasharray="3 3" />
                  <XAxis type="number" stroke="transparent" tick={{ fill: '#d1d5db', fontSize: 10 }} tickFormatter={v => `$${v}`} tickLine={false} />
                  <YAxis type="category" dataKey="name" stroke="transparent"
                    tick={{ fill: '#9ca3af', fontSize: 9 }}
                    tickLine={false} axisLine={false} width={130}
                    tickFormatter={v => v.split(' / ')[0].substring(0, 18)} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: '#1f2937' }} />
                  <Bar dataKey="totalSpend" fill="#10b981" radius={[0, 4, 4, 0]} opacity={0.85} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
