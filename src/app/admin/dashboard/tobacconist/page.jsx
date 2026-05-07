'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';

function daysSince(dateStr) {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30)  return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function Skeleton({ className }) {
  return <div className={`animate-pulse bg-gray-800 rounded ${className}`} />;
}

export default function TobacconistPage() {
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [search, setSearch]     = useState('');
  const [sortField, setSortField] = useState('visitCount');
  const [sortDir, setSortDir]   = useState('desc');
  const router = useRouter();

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/dashboard/tobacconist');
      if (!res.ok) throw new Error('Failed to load customers');
      setData(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (search.length > 0 && !data && !loading) {
      loadCustomers();
    }
  }, [search, data, loading, loadCustomers]);

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

  const allCustomers = data?.customers || [];

  const customers = allCustomers
    .filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const av = a[sortField] ?? '', bv = b[sortField] ?? '';
      if (typeof av === 'number') return sortDir === 'asc' ? av - bv : bv - av;
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });

  return (
    <div className="text-white max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Tobacconist&apos;s View</h1>
        <p className="text-gray-300 text-sm mt-1">
          Customer visits & favorite cigars
          {data && !loading && <span> · {allCustomers.length.toLocaleString()} customers loaded</span>}
        </p>
      </div>

      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input type="text" placeholder="Search customer name..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-800/80 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 text-sm" />
        </div>
        <button onClick={loadCustomers} disabled={loading}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-gray-950 font-semibold text-sm transition-all">
          {loading ? 'Loading…' : data ? 'Refresh' : 'Load Customers'}
        </button>
      </div>

      {error && <div className="mb-5 px-4 py-3 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-sm">{error}</div>}

      {!data && !loading && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-800/60 flex items-center justify-center mb-4 text-3xl">🚬</div>
          <h2 className="text-lg font-semibold text-gray-200 mb-2">Ready to load customers</h2>
          <p className="text-sm text-gray-300 max-w-sm leading-relaxed">
            Tap{' '}
            <button onClick={loadCustomers} className="text-amber-400 font-medium hover:text-amber-300 transition-colors">Load Customers</button>{' '}
            or start typing a name to begin.
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
                  <Th field="visitCount" right>Visits</Th>
                  <Th field="lastSeen">Last Seen</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/40">
                {loading ? (
                  Array.from({ length: 14 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3"><div className="flex items-center gap-3"><Skeleton className="w-9 h-9 rounded-full" /><Skeleton className="h-4 w-36" /></div></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-10 ml-auto" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                    </tr>
                  ))
                ) : customers.map(c => (
                  <tr key={c.id}
                    className="hover:bg-gray-800/40 transition-colors cursor-pointer group"
                    onClick={() => router.push(`/admin/dashboard/tobacconist/${c.id}`)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-white">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-white">
                      {c.visitCount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-200 text-sm">
                      {daysSince(c.lastSeen)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!loading && customers.length === 0 && data && (
            <div className="text-center py-16 text-gray-300">No customers match your search</div>
          )}

          {!loading && data && (
            <div className="px-5 py-3 border-t border-gray-800/50 text-xs text-gray-300">
              Showing {customers.length.toLocaleString()} of {allCustomers.length.toLocaleString()} customers
              {data.fetchedAt && (
                <span className="text-gray-500 ml-3">· loaded {new Date(data.fetchedAt).toLocaleTimeString()}</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
