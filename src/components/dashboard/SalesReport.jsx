'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';

const PRESETS = [
  { label: 'Today',      getValue: () => ({ from: today(), to: null }) },
  { label: 'This Week',  getValue: () => ({ from: startOfWeek(), to: null }) },
  { label: 'This Month', getValue: () => ({ from: startOfMonth(), to: null }) },
  { label: 'Last Month', getValue: () => lastMonth() },
  { label: 'YTD',        getValue: () => ({ from: startOfYear(), to: null }) },
  { label: '30 Days',    getValue: () => ({ from: daysAgo(30), to: null }) },
  { label: '90 Days',    getValue: () => ({ from: daysAgo(90), to: null }) },
];

function estNow() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset() - 300);
  return d;
}
function estDate(d) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`;
}
function today()       { return estDate(estNow()); }
function daysAgo(n)    { const d = estNow(); d.setUTCDate(d.getUTCDate() - n); return estDate(d); }
function startOfWeek() { const d = estNow(); d.setUTCDate(d.getUTCDate() - d.getUTCDay()); return estDate(d); }
function startOfMonth(){ const d = estNow(); return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-01`; }
function startOfYear() { return `${estNow().getUTCFullYear()}-01-01`; }
function lastMonth() {
  const d = estNow();
  const y = d.getUTCMonth() === 0 ? d.getUTCFullYear()-1 : d.getUTCFullYear();
  const m = d.getUTCMonth() === 0 ? 12 : d.getUTCMonth();
  return {
    from: `${y}-${String(m).padStart(2,'0')}-01`,
    to: estDate(new Date(Date.UTC(y, m, 0))),
  };
}

const fmt  = n => `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtK = n => n >= 1000 ? `$${(n/1000).toFixed(1)}k` : `$${Math.round(n)}`;

function Skeleton({ className }) {
  return <div className={`animate-pulse bg-gray-800 rounded ${className}`} />;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-gray-200 text-xs mb-1">{label}</p>
      <p className="text-white font-semibold">{fmt(payload[0].value)}</p>
    </div>
  );
};

export default function SalesReport() {
  const [activePreset, setActivePreset] = useState('YTD');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo]   = useState('');
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  const fetchReport = useCallback(async (from, to) => {
    setLoading(true);
    setError(null);
    try {
      const dateFrom = `${from}T05:00:00Z`;
      const dateTo   = to ? `${to}T04:59:59Z` : null;
      let url = `/api/admin/dashboard/sales-report?date_from=${dateFrom}`;
      if (dateTo) url += `&date_to=${dateTo}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch report');
      setData(await res.json());
    } catch (e) { setError(e.message); }
    finally     { setLoading(false); }
  }, []);

  useEffect(() => {
    const { from, to } = PRESETS.find(p => p.label === 'YTD').getValue();
    fetchReport(from, to);
  }, [fetchReport]);

  function handlePreset(preset) {
    setActivePreset(preset.label);
    const { from, to } = preset.getValue();
    fetchReport(from, to);
  }

  function handleCustom() {
    if (!customFrom) return;
    setActivePreset('Custom');
    fetchReport(customFrom, customTo || null);
  }

  const avgDaily = data && data.dailyTrend.length > 0
    ? data.revenue / data.dailyTrend.length
    : 0;

  const chartData = (data?.dailyTrend || []).map(d => ({
    date: new Date(d.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    revenue: d.revenue,
  }));

  const metrics = [
    { label: 'Revenue',          value: data?.revenue,        fmt: fmt,   color: 'text-emerald-400', sub: 'excl. tax' },
    { label: 'Gross Profit',     value: data?.grossProfit,    fmt: fmt,   color: 'text-blue-400',    sub: data ? `${data.margin}% margin` : null },
    { label: 'Avg Sale',         value: data?.avgSaleValue,   fmt: fmt,   color: 'text-amber-400',   sub: null },
    { label: 'Sale Count',       value: data?.saleCount,      fmt: n => Number(n).toLocaleString(), color: 'text-purple-400', sub: data ? `${data.returnCount} returns` : null },
    { label: 'Revenue (w/ tax)', value: data?.revenueInclTax, fmt: fmt,   color: 'text-emerald-300', sub: null },
    { label: 'Tax Collected',    value: data?.tax,            fmt: fmt,   color: 'text-gray-300',    sub: null },
    { label: 'Cost of Goods',    value: data?.cogs,           fmt: fmt,   color: 'text-red-400',     sub: null },
    { label: 'Items Sold',       value: data?.itemsSold,      fmt: n => Number(n).toLocaleString(), color: 'text-gray-300', sub: null },
  ];

  return (
    <div className="text-white max-w-7xl mx-auto">

      {/* Date Controls */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
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
      </div>

      {error && <div className="mb-6 px-4 py-3 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-sm">{error}</div>}

      {/* Hero + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-1 bg-gradient-to-br from-gray-900 to-gray-900/50 rounded-2xl border border-gray-800/60 p-6 flex flex-col justify-between">
          <div>
            <div className="text-xs text-gray-200 uppercase tracking-widest font-medium mb-3">Revenue</div>
            {loading ? (
              <Skeleton className="h-12 w-48 mb-2" />
            ) : (
              <div className="text-5xl font-black text-white tracking-tight">{fmtK(data?.revenue || 0)}</div>
            )}
            <div className="text-gray-200 text-sm mt-1">excl. tax · {activePreset}</div>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-800 grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-200 mb-1">Gross Profit</div>
              {loading ? <Skeleton className="h-5 w-20" /> : <div className="text-emerald-400 font-semibold">{fmt(data?.grossProfit || 0)}</div>}
            </div>
            <div>
              <div className="text-xs text-gray-200 mb-1">Margin</div>
              {loading ? <Skeleton className="h-5 w-12" /> : <div className="text-blue-400 font-semibold">{data?.margin || 0}%</div>}
            </div>
            <div>
              <div className="text-xs text-gray-200 mb-1">Transactions</div>
              {loading ? <Skeleton className="h-5 w-16" /> : <div className="text-white font-semibold">{(data?.saleCount || 0).toLocaleString()}</div>}
            </div>
            <div>
              <div className="text-xs text-gray-200 mb-1">Avg / Sale</div>
              {loading ? <Skeleton className="h-5 w-20" /> : <div className="text-amber-400 font-semibold">{fmt(data?.avgSaleValue || 0)}</div>}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-gray-900/60 rounded-2xl border border-gray-800/60 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Daily Revenue</h2>
            {!loading && avgDaily > 0 && (
              <span className="text-xs text-gray-200">avg {fmt(avgDaily)} / day</span>
            )}
          </div>
          {loading ? (
            <div className="h-64 flex flex-col gap-3 justify-end pb-4">
              {[40,65,45,80,55,90,70,85,60,95,75].map((h,i) => (
                <div key={i} className="animate-pulse bg-gray-800 rounded" style={{height:`${h}%`, width:'8%', marginLeft:`${i*9}%`, position:'absolute', bottom:'24px'}} />
              ))}
              <Skeleton className="h-full w-full opacity-20" />
            </div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#1f2937" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="transparent" tick={{ fill: '#d1d5db', fontSize: 10 }} interval="preserveStartEnd" tickLine={false} />
                <YAxis stroke="transparent" tick={{ fill: '#d1d5db', fontSize: 10 }} tickFormatter={fmtK} tickLine={false} axisLine={false} width={45} />
                {avgDaily > 0 && <ReferenceLine y={avgDaily} stroke="#6b7280" strokeDasharray="4 4" strokeOpacity={0.5} />}
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#374151', strokeWidth: 1 }} />
                <Area type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} fill="url(#revGrad)" dot={false} activeDot={{ r: 4, fill: '#f59e0b', stroke: '#111827', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-200">No data for this period</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {metrics.slice(4).map(m => (
          <div key={m.label} className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-4">
            <div className="text-xs text-gray-200 uppercase tracking-wider mb-2">{m.label}</div>
            {loading
              ? <Skeleton className="h-6 w-24" />
              : <div className={`text-lg font-bold ${m.color}`}>{m.fmt(m.value || 0)}</div>
            }
          </div>
        ))}
      </div>

      {!loading && chartData.length > 0 && (
        <div className="bg-gray-900/50 rounded-2xl border border-gray-800/60 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Top Revenue Days</h2>
            <span className="text-xs text-gray-200">{chartData.length} days in period</span>
          </div>
          <div className="divide-y divide-gray-800/50">
            {[...data.dailyTrend]
              .sort((a, b) => b.revenue - a.revenue)
              .slice(0, 5)
              .map((d, i) => {
                const pct = (d.revenue / data.dailyTrend[0] ? d.revenue / Math.max(...data.dailyTrend.map(x => x.revenue)) * 100 : 0);
                return (
                  <div key={d.date} className="px-5 py-3 flex items-center gap-4 hover:bg-gray-800/30 transition-colors">
                    <span className="text-gray-200 text-sm w-5 shrink-0">#{i+1}</span>
                    <span className="text-gray-300 text-sm w-28 shrink-0">
                      {new Date(d.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-white font-semibold text-sm w-24 text-right">{fmt(d.revenue)}</span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
