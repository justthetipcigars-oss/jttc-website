'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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

const fmt = n => `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function Skeleton({ className }) {
  return <div className={`animate-pulse bg-gray-800 rounded ${className}`} />;
}

function daysSince(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30)  return `${days}d ago`;
  if (days < 365) return `${Math.floor(days/30)}mo ago`;
  return `${Math.floor(days/365)}y ago`;
}

function ActivityDot({ updatedAt }) {
  const days = Math.floor((Date.now() - new Date(updatedAt)) / (1000*60*60*24));
  if (days <= 30) return <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" title="Active this month" />;
  if (days <= 90) return <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" title="Active this quarter" />;
  return <span className="w-2 h-2 rounded-full bg-gray-600 inline-block" title="Inactive 90+ days" />;
}

export default function CustomersPage() {
  const [data, setData]             = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [search, setSearch]         = useState('');
  const [sortField, setSortField]   = useState('yearToDate');
  const [sortDir, setSortDir]       = useState('desc');
  const [filter, setFilter]         = useState('all');
  const [activePreset, setActivePreset] = useState(null);
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo]     = useState('');
  const router = useRouter();

  const fetchCustomers = useCallback(async (from, to) => {
    setLoading(true);
    setError(null);
    try {
      let url = '/api/admin/dashboard/customers';
      if (from) {
        const dateFrom = `${from}T05:00:00Z`;
        const dateTo   = to ? `${to}T04:59:59Z` : null;
        url += `?date_from=${dateFrom}`;
        if (dateTo) url += `&date_to=${dateTo}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch customers');
      setData(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (search.length > 0 && !data && !loading) {
      setActivePreset(null);
      fetchCustomers(null, null);
    }
  }, [search, data, loading, fetchCustomers]);

  function handlePreset(preset) {
    setActivePreset(preset.label);
    const { from, to } = preset.getValue();
    fetchCustomers(from, to);
  }

  function handleCustom() {
    if (!customFrom) return;
    setActivePreset('Custom');
    fetchCustomers(customFrom, customTo || null);
  }

  function handleAllCustomers() {
    setActivePreset('All');
    fetchCustomers('2023-07-01', null);
  }

  function toggleSort(field) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  }

  function Th({ field, children, right }) {
    const active = sortField === field;
    return (
      <th
        className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none transition-colors ${active ? 'text-amber-400' : 'text-gray-200 hover:text-gray-300'} ${right ? 'text-right' : 'text-left'}`}
        onClick={() => toggleSort(field)}
      >
        {children} {active ? (sortDir === 'asc' ? '↑' : '↓') : <span className="opacity-30">↕</span>}
      </th>
    );
  }

  const isRangeMode     = data?.mode === 'range';
  const isLifetimeMode  = isRangeMode && (activePreset === 'All' || activePreset === 'Lifetime');
  const spendColLabel   = isLifetimeMode ? 'Lifetime Spend' : isRangeMode ? 'Period Spend' : 'Spend';

  const allCustomers  = data?.customers || [];
  const maxSpend      = Math.max(...allCustomers.map(c => c.yearToDate), 1);
  const activeCount   = allCustomers.filter(c => (Date.now() - new Date(c.updatedAt)) < 90*24*60*60*1000).length;
  const withEmail     = allCustomers.filter(c => c.email).length;
  const totalSpend    = allCustomers.reduce((sum, c) => sum + (c.yearToDate || 0), 0);
  const avgLTV        = allCustomers.length > 0 ? totalSpend / allCustomers.length : 0;

  const customers = allCustomers
    .filter(c => {
      if (filter === 'active') return (Date.now() - new Date(c.updatedAt)) < 90*24*60*60*1000;
      if (filter === 'email')  return !!c.email;
      return true;
    })
    .filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.phone || '').includes(search)
    )
    .sort((a, b) => {
      const av = a[sortField] ?? '', bv = b[sortField] ?? '';
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });

  return (
    <div className="text-white max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
        {data && !loading && (
          <p className="text-gray-200 text-sm mt-1">
            {allCustomers.length.toLocaleString()} {isLifetimeMode ? 'total' : isRangeMode ? 'in period' : 'total'} ·{' '}
            <span className="text-emerald-400">{activeCount.toLocaleString()} active</span> ·{' '}
            {withEmail.toLocaleString()} with email
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: isLifetimeMode ? 'Avg Lifetime Value' : 'Avg Customer Spend', value: fmt(avgLTV),                        color: 'text-amber-400' },
          { label: (isLifetimeMode ? 'Lifetime' : 'Period') + ' Spend',          value: fmt(totalSpend),                    color: 'text-emerald-400' },
          { label: 'Customers',                                                   value: allCustomers.length.toLocaleString(), color: 'text-white' },
          { label: 'Active (90d)',                                                 value: activeCount.toLocaleString(),        color: 'text-emerald-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-gray-900/50 rounded-xl border border-gray-700 px-4 py-3">
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">{label}</div>
            {loading
              ? <div className="animate-pulse bg-gray-800 rounded h-6 w-24" />
              : <div className={`text-lg font-bold ${data ? color : 'text-gray-500'}`}>{data ? value : '—'}</div>
            }
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-5">
        {PRESETS.map(preset => (
          <button
            key={preset.label}
            onClick={() => handlePreset(preset)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
              activePreset === preset.label
                ? 'bg-amber-500 text-gray-950 shadow-lg shadow-amber-500/20'
                : 'bg-gray-800/80 text-gray-200 hover:text-white hover:bg-gray-700'
            }`}
          >
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

        <div className="pl-2 border-l border-gray-800">
          <button onClick={handleAllCustomers}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
              activePreset === 'All'
                ? 'bg-amber-500 text-gray-950 shadow-lg shadow-amber-500/20'
                : 'bg-gray-800/80 text-gray-200 hover:text-white hover:bg-gray-700'
            }`}>
            All Customers
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-200 text-sm">🔍</span>
          <input type="text" placeholder="Search name, email, or phone..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-800/80 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 text-sm" />
        </div>
        <div className="flex gap-2">
          {[['all', 'All'], ['active', 'Active (90d)'], ['email', 'Has Email']].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${filter === val ? 'bg-amber-500 text-gray-950' : 'bg-gray-800 text-gray-200 hover:text-white hover:bg-gray-700'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="mb-6 px-4 py-3 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-sm">{error}</div>}

      {!data && !loading && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-800/60 flex items-center justify-center mb-4 text-3xl">👥</div>
          <h2 className="text-lg font-semibold text-gray-300 mb-2">Select a date range or load all customers</h2>
          <p className="text-sm text-gray-300 max-w-sm leading-relaxed">
            Choose a preset to see customers active in that period, or click{' '}
            <button onClick={handleAllCustomers} className="text-amber-400 font-medium hover:text-amber-300 transition-colors">All Customers</button>{' '}
            to load the full directory.
          </p>
        </div>
      )}

      {(data || loading) && (
        <div className="bg-gray-900/50 rounded-2xl border border-gray-800/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-800/60 border-b border-gray-800">
                <tr>
                  <Th field="name">Customer</Th>
                  <Th field="yearToDate" right>{spendColLabel}</Th>
                  {isRangeMode
                    ? <Th field="visitCount" right>Visits</Th>
                    : <Th field="loyaltyBalance" right>Loyalty</Th>}
                  <th className="px-4 py-3 text-xs text-gray-200 uppercase tracking-wider text-left">Contact</th>
                  <Th field="updatedAt">Last Seen</Th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/40">
                {loading ? (
                  Array.from({ length: 12 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3"><div className="flex items-center gap-3"><Skeleton className="w-9 h-9 rounded-full" /><Skeleton className="h-4 w-32" /></div></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-20 ml-auto" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-16 ml-auto" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-28" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                      <td className="px-4 py-3" />
                    </tr>
                  ))
                ) : customers.map((c, i) => {
                  const spendPct = (c.yearToDate / maxSpend) * 100;
                  return (
                    <tr key={c.id}
                      className="hover:bg-gray-800/40 transition-colors cursor-pointer group"
                      onClick={() => router.push(`/admin/dashboard/customers/${c.id}`)}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-white flex items-center gap-2">
                              {c.name}
                              <ActivityDot updatedAt={c.updatedAt} />
                            </div>
                            {i < 5 && <div className="text-xs text-amber-500 font-medium">Top Spender</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="font-semibold text-emerald-400">{fmt(c.yearToDate)}</div>
                        <div className="mt-1 h-1 bg-gray-800 rounded-full w-24 ml-auto overflow-hidden">
                          <div className="h-full bg-emerald-500/60 rounded-full" style={{ width: `${spendPct}%` }} />
                        </div>
                      </td>
                      {isRangeMode ? (
                        <td className="px-4 py-3 text-right text-gray-300 font-medium">
                          {c.visitCount ?? <span className="text-gray-500">—</span>}
                        </td>
                      ) : (
                        <td className="px-4 py-3 text-right text-amber-300 font-medium">
                          {c.loyaltyBalance > 0
                            ? c.loyaltyBalance.toLocaleString('en-US', { maximumFractionDigits: 0 })
                            : <span className="text-gray-500">—</span>}
                        </td>
                      )}
                      <td className="px-4 py-3 text-gray-200 text-xs">
                        {c.email && <div className="truncate max-w-[160px]">{c.email}</div>}
                        {c.phone && <div>{c.phone}</div>}
                        {!c.email && !c.phone && <span className="text-gray-500">—</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-200 text-sm">{daysSince(c.updatedAt)}</td>
                      <td className="px-4 py-3 text-gray-500 group-hover:text-gray-200 transition-colors text-right pr-5">→</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {!loading && customers.length === 0 && <div className="text-center py-16 text-gray-200">No customers match your search</div>}
          {!loading && (
            <div className="px-5 py-3 border-t border-gray-800/50 text-xs text-gray-200 flex items-center gap-2">
              Showing {customers.length.toLocaleString()} of {allCustomers.length.toLocaleString()} customers
              {isRangeMode && !isLifetimeMode && <span className="text-amber-400/70">· filtered to selected date range</span>}
              {isLifetimeMode && <span className="text-amber-400/70">· lifetime spend (Jul 2023 – present)</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
