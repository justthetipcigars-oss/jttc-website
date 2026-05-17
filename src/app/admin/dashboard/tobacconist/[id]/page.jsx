'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';

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

function fmt(n) {
  return `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function Skeleton({ className }) {
  return <div className={`animate-pulse bg-gray-800 rounded ${className}`} />;
}

function StatBox({ label, value, color = 'text-white', salesLoading }) {
  return (
    <div className="bg-gray-900/60 rounded-xl border border-gray-800/60 p-4">
      <div className="text-xs text-gray-300 uppercase tracking-wider mb-2">{label}</div>
      {salesLoading
        ? <Skeleton className="h-7 w-24" />
        : <div className={`text-xl font-bold ${color}`}>{value}</div>
      }
    </div>
  );
}

function isCigar(category) {
  return category && category.toLowerCase().includes('cigar');
}

export default function TobacconistDetailPage() {
  const { id } = useParams();
  const router  = useRouter();

  const [customer, setCustomer]       = useState(null);
  const [salesData, setSalesData]     = useState(null);
  const [salesLoading, setSalesLoading] = useState(true);
  const [activeTab, setActiveTab]     = useState('cigars');
  const [sortDir, setSortDir]         = useState('desc');
  const [expandedVisits, setExpandedVisits] = useState(new Set());

  function toggleVisit(invoiceNumber) {
    setExpandedVisits(prev => {
      const next = new Set(prev);
      next.has(invoiceNumber) ? next.delete(invoiceNumber) : next.add(invoiceNumber);
      return next;
    });
  }

  const loadData = useCallback(async () => {
    setSalesLoading(true);

    fetch('/api/admin/dashboard/customers')
      .then(r => r.json())
      .then(data => {
        const found = data.customers?.find(c => c.id === id);
        setCustomer(found || { id, name: 'Customer', email: null, phone: null, createdAt: null });
      })
      .catch(() => setCustomer({ id, name: 'Customer', email: null, phone: null, createdAt: null }));

    try {
      const salesRes = await fetch(`/api/admin/dashboard/customers/${id}/sales?date_from=2023-07-01T05:00:00Z`);
      const salesJson = await salesRes.json();
      if (salesJson?.favoriteProducts) setSalesData(salesJson);
    } catch {
      // sales failed — page still renders with whatever profile loaded
    } finally {
      setSalesLoading(false);
    }
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);

  const cigarProducts = salesData?.favoriteProducts
    ? [...salesData.favoriteProducts]
        .filter(p => isCigar(p.category))
        .sort((a, b) => sortDir === 'desc' ? b.totalQty - a.totalQty : a.totalQty - b.totalQty)
    : [];

  const maxQty = cigarProducts.length > 0 ? Math.max(...cigarProducts.map(p => p.totalQty)) : 1;

  const tabs = [
    { id: 'cigars',  label: `Cigars${cigarProducts.length ? ` (${cigarProducts.length})` : ''}` },
    { id: 'visits',  label: `Visits${salesData ? ` (${salesData.visitCount})` : ''}` },
  ];

  const recentVisits = salesData?.visits?.slice(0, 30) || [];

  return (
    <div className="text-white max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <button onClick={() => router.push('/admin/dashboard/tobacconist')}
          className="flex items-center gap-1.5 text-gray-300 hover:text-white text-sm transition-colors group">
          <span className="group-hover:-translate-x-0.5 transition-transform">←</span> All Customers
        </button>
      </div>

      <div className="bg-gradient-to-br from-gray-900 to-gray-900/40 rounded-2xl border border-gray-800/60 p-6 mb-5">
        {!customer ? (
          <div className="flex items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-full" />
            <div className="space-y-2"><Skeleton className="h-7 w-48" /><Skeleton className="h-4 w-40" /></div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center text-white font-black text-2xl shrink-0">
              {(customer?.name || '?').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold tracking-tight">{customer?.name || 'Loading…'}</h1>
              {salesData && (
                <div className="text-sm text-gray-300 mt-1">
                  First visit {salesData.firstVisit
                    ? new Date(salesData.firstVisit).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                    : '—'}
                  {' · '}Last seen {daysSince(salesData.lastVisit)}
                </div>
              )}
            </div>
            {salesData && (
              <div className="flex gap-6 text-center shrink-0">
                <div>
                  <div className="text-2xl font-black text-white">{salesData.visitCount}</div>
                  <div className="text-xs text-gray-300 uppercase tracking-wider mt-0.5">Lifetime Visits</div>
                </div>
                {salesData.avgDaysBetweenVisits && (
                  <div>
                    <div className="text-2xl font-black text-amber-400">{salesData.avgDaysBetweenVisits}d</div>
                    <div className="text-xs text-gray-300 uppercase tracking-wider mt-0.5">Avg Interval</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        <StatBox label="Avg Visit Value" value={salesData ? fmt(salesData.avgVisitValue) : '—'} color="text-emerald-400" salesLoading={salesLoading} />
        <StatBox label="Lifetime Visits" value={salesData ? salesData.visitCount.toLocaleString() : '—'} color="text-white" salesLoading={salesLoading} />
        <StatBox label="Favorite Cigar" value={cigarProducts[0]?.name || '—'} color="text-amber-400" salesLoading={salesLoading} />
      </div>

      <div className="flex gap-1 border-b border-gray-800 mb-5">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all ${
              activeTab === tab.id ? 'border-amber-500 text-amber-400' : 'border-transparent text-gray-400 hover:text-white'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'cigars' && (
        <div className="bg-gray-900/50 rounded-2xl border border-gray-800/60 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800/60">
            <span className="text-sm font-medium text-gray-200">
              {cigarProducts.length} cigar{cigarProducts.length !== 1 ? 's' : ''} purchased
            </span>
            <button onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
              className="text-xs text-gray-300 hover:text-white transition-colors">
              Qty {sortDir === 'desc' ? '↓ Most' : '↑ Least'}
            </button>
          </div>

          {salesLoading ? (
            <div className="divide-y divide-gray-800/40">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-3">
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-10" />
                </div>
              ))}
            </div>
          ) : cigarProducts.length === 0 ? (
            <div className="text-center py-16 text-gray-400">No cigar purchases found</div>
          ) : (
            <div className="divide-y divide-gray-800/40">
              {cigarProducts.map((p, i) => {
                const barPct = (p.totalQty / maxQty) * 100;
                return (
                  <div key={p.productId} className="flex items-center gap-4 px-5 py-3.5">
                    <div className="w-6 text-center text-xs text-gray-500 shrink-0">{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white truncate">{p.name}</div>
                      <div className="mt-1.5 h-1.5 bg-gray-800 rounded-full overflow-hidden w-full">
                        <div className="h-full rounded-full bg-amber-500/70" style={{ width: `${barPct}%` }} />
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-white text-lg leading-none">{p.totalQty.toLocaleString()}</div>
                      <div className="text-xs text-gray-400 mt-0.5">units</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'visits' && (
        <div className="bg-gray-900/50 rounded-2xl border border-gray-800/60 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-800/60 text-sm font-medium text-gray-200">
            Recent visits (most recent 30)
          </div>
          {salesLoading ? (
            <div className="divide-y divide-gray-800/40">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              ))}
            </div>
          ) : recentVisits.length === 0 ? (
            <div className="text-center py-16 text-gray-400">No visit history</div>
          ) : (
            <div className="divide-y divide-gray-800/40">
              {recentVisits.map(v => {
                const cigarQty = v.items?.reduce((s, i) => s + (isCigar(i.category) ? i.qty : 0), 0) || 0;
                const isOpen = expandedVisits.has(v.invoiceNumber);

                return (
                  <div key={v.invoiceNumber}>
                    <button onClick={() => toggleVisit(v.invoiceNumber)}
                      className="w-full px-5 py-3.5 text-left hover:bg-gray-800/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-white text-sm">
                          {new Date(v.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <div className="flex items-center gap-3 text-sm">
                          {cigarQty > 0 && <span className="text-amber-400 font-medium">{cigarQty} cigar{cigarQty !== 1 ? 's' : ''}</span>}
                          <span className="text-gray-300">{v.itemCount} item{v.itemCount !== 1 ? 's' : ''}</span>
                          {v.total != null && <span className="text-emerald-400 font-semibold">{fmt(v.total)}</span>}
                          <span className="text-gray-500 text-xs">{isOpen ? '▲' : '▼'}</span>
                        </div>
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-3 border-t border-gray-800/40 bg-gray-900/40">
                        <div className="pt-3 space-y-1.5">
                          {v.items?.map((item, idx) => {
                            const name = item.name || 'Unknown item';
                            const isCig = isCigar(item.category);
                            return (
                              <div key={idx} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 min-w-0">
                                  {isCig && <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-amber-500" />}
                                  <span className={`truncate ${isCig ? 'text-white' : 'text-gray-300'}`}>{name}</span>
                                  <span className="text-gray-500 shrink-0">×{item.qty}</span>
                                </div>
                                {item.total != null && <span className="text-gray-300 shrink-0 ml-4">{fmt(item.total)}</span>}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
