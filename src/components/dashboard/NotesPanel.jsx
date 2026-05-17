'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

function pageName(pathname) {
  if (pathname === '/admin/dashboard')                          return 'Sales Reports';
  if (pathname.startsWith('/admin/dashboard/customers/'))       return 'Customer Detail';
  if (pathname === '/admin/dashboard/customers')                return 'Customers';
  if (pathname === '/admin/dashboard/products')                 return 'Products';
  if (pathname.startsWith('/admin/dashboard/tobacconist/'))     return 'Tobacconist Detail';
  if (pathname === '/admin/dashboard/tobacconist')              return 'Tobacconist';
  return pathname;
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)   return 'just now';
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const PAGE_COLORS = {
  'Sales Reports':       'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'Customers':           'bg-sky-500/20 text-sky-300 border-sky-500/30',
  'Customer Detail':     'bg-sky-500/20 text-sky-300 border-sky-500/30',
  'Products':            'bg-amber-500/20 text-amber-300 border-amber-500/30',
  'Tobacconist':         'bg-orange-500/20 text-orange-300 border-orange-500/30',
  'Tobacconist Detail':  'bg-orange-500/20 text-orange-300 border-orange-500/30',
};

export default function NotesPanel() {
  const pathname  = usePathname();
  const page      = pageName(pathname);
  const [open, setOpen]     = useState(false);
  const [notes, setNotes]   = useState([]);
  const [text, setText]     = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const textRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch('/api/admin/dashboard/notes')
      .then(r => r.json())
      .then(d => setNotes(d.notes || []))
      .finally(() => setLoading(false));
  }, [open]);

  useEffect(() => {
    if (open) textRef.current?.focus();
  }, [open]);

  async function submit(e) {
    e.preventDefault();
    if (!text.trim() || saving) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/dashboard/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, page }),
      });
      const data = await res.json();
      if (data.note) {
        setNotes(prev => [...prev, data.note]);
        setText('');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold shadow-lg transition-all ${
          open
            ? 'bg-gray-700 text-white shadow-gray-900/50'
            : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white shadow-gray-900/50'
        }`}
      >
        <span className="text-base">📝</span>
        Notes
        {notes.length > 0 && !open && (
          <span className="ml-1 w-5 h-5 rounded-full bg-amber-500 text-gray-950 text-xs font-black flex items-center justify-center">
            {notes.length}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed bottom-20 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-gray-900 border border-gray-700/60 rounded-2xl shadow-2xl shadow-gray-950/80 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-white">Dashboard Notes</div>
              <div className="text-xs text-gray-300 mt-0.5">Currently on: <span className="text-amber-400">{page}</span></div>
            </div>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-300 text-lg leading-none">×</button>
          </div>

          <div className="flex-1 overflow-y-auto max-h-72 divide-y divide-gray-800/60">
            {loading ? (
              <div className="py-8 text-center text-gray-400 text-sm">Loading...</div>
            ) : notes.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-sm">No notes yet</div>
            ) : (
              notes.map(n => {
                const tagCls = PAGE_COLORS[n.page] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
                return (
                  <div key={n.id} className="px-4 py-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${tagCls}`}>
                        {n.page}
                      </span>
                      <span className="text-xs text-gray-400">{timeAgo(n.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">{n.text}</p>
                  </div>
                );
              })
            )}
          </div>

          <form onSubmit={submit} className="p-3 border-t border-gray-800">
            <textarea
              ref={textRef}
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) submit(e); }}
              placeholder={`Note for ${page}... (Enter to save)`}
              rows={2}
              className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-700/50 text-white placeholder-gray-400 text-sm resize-none focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              disabled={!text.trim() || saving}
              className="mt-2 w-full py-1.5 rounded-lg bg-amber-500 text-gray-950 text-sm font-semibold hover:bg-amber-400 disabled:opacity-30 transition-all"
            >
              {saving ? 'Saving...' : 'Save Note'}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
