export type JournalRow = {
  id: string;
  product_id: string | null;
  cigar_name: string | null;
  brand: string | null;
  size: string | null;
  overall_rating: number | null;
  flavor_rating: number | null;
  value_rating: number | null;
  appearance_rating: number | null;
  body: number | null;
  strength: number | null;
  flavor_intensity: number | null;
  flavor_tags: string[] | null;
  would_try_again: boolean | null;
  notes: string | null;
  date_smoked: string | null;
  created_at: string;
  updated_at: string;
};

export type CigarNote = {
  userHandle: string;
  date: string;
  overall: number;
  body: number;
  strength: number;
  tags: string[];
  wouldTryAgain: boolean;
  text: string;
};

export type CigarSentiment = {
  productId: string;
  name: string;
  brand: string;
  size: string;
  entries: number;
  avgOverall: number;
  avgBody: number;
  avgStrength: number;
  avgFlavor: number;
  avgValue: number;
  avgAppearance: number;
  wouldTryAgainPct: number;
  ratingVariance: number;
  tagCounts: Record<string, number>;
  ratingDistribution: [number, number, number, number, number];
  recentTrend: 'up' | 'down' | 'flat';
  notes: CigarNote[];
};

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((s, n) => s + n, 0) / nums.length;
}

function stdDev(nums: number[]): number {
  if (nums.length < 2) return 0;
  const m = avg(nums);
  const v = nums.reduce((s, n) => s + (n - m) ** 2, 0) / nums.length;
  return Math.sqrt(v);
}

function computeTrend(rows: JournalRow[]): 'up' | 'down' | 'flat' {
  const dated = rows
    .filter(r => r.overall_rating != null)
    .map(r => ({ rating: r.overall_rating!, when: new Date(r.date_smoked || r.created_at).getTime() }))
    .sort((a, b) => a.when - b.when);

  if (dated.length < 4) return 'flat';

  const half = Math.floor(dated.length / 2);
  const early = avg(dated.slice(0, half).map(d => d.rating));
  const recent = avg(dated.slice(half).map(d => d.rating));
  const delta = recent - early;
  if (delta >= 0.4) return 'up';
  if (delta <= -0.4) return 'down';
  return 'flat';
}

function buildNote(r: JournalRow, userLabel: string): CigarNote {
  return {
    userHandle: userLabel,
    date: (r.date_smoked || r.created_at).slice(0, 10),
    overall: r.overall_rating ?? 0,
    body: r.body ?? 0,
    strength: r.strength ?? 0,
    tags: r.flavor_tags ?? [],
    wouldTryAgain: !!r.would_try_again,
    text: r.notes ?? '',
  };
}

function anonymizeUser(userId: string | null | undefined, index: number): string {
  if (!userId) return `Member #${index + 1}`;
  // Deterministic short label from user_id so the same user reads as the same handle
  const slice = userId.replace(/-/g, '').slice(0, 4).toUpperCase();
  return `Member ${slice}`;
}

export function aggregateJournal(
  rows: Array<JournalRow & { user_id?: string | null }>,
): CigarSentiment[] {
  const byProduct = new Map<string, Array<JournalRow & { user_id?: string | null }>>();
  for (const r of rows) {
    const key = r.product_id || `unknown:${r.cigar_name ?? 'Unknown'}`;
    if (!byProduct.has(key)) byProduct.set(key, []);
    byProduct.get(key)!.push(r);
  }

  const out: CigarSentiment[] = [];

  for (const [productId, group] of byProduct) {
    const overall = group.map(r => r.overall_rating).filter((n): n is number => n != null);
    if (overall.length === 0) continue;

    const tagCounts: Record<string, number> = {};
    for (const r of group) {
      for (const t of r.flavor_tags ?? []) {
        tagCounts[t] = (tagCounts[t] ?? 0) + 1;
      }
    }

    const dist: [number, number, number, number, number] = [0, 0, 0, 0, 0];
    for (const n of overall) {
      const idx = Math.min(5, Math.max(1, Math.round(n))) - 1;
      dist[idx]++;
    }

    const tryAgain = group.map(r => r.would_try_again).filter((v): v is boolean => v != null);
    const wouldTryAgainPct = tryAgain.length
      ? Math.round((tryAgain.filter(Boolean).length / tryAgain.length) * 100)
      : 0;

    // Notes: most recent 10, non-empty text first
    const withDate = group
      .map((r, i) => ({ row: r, i, when: new Date(r.date_smoked || r.updated_at || r.created_at).getTime() }))
      .sort((a, b) => b.when - a.when);

    const notes: CigarNote[] = withDate
      .filter(({ row }) => (row.notes ?? '').trim().length > 0)
      .slice(0, 10)
      .map(({ row, i }) => buildNote(row, anonymizeUser(row.user_id, i)));

    // Representative name/brand/size: take the most recent non-null
    const display = withDate.find(({ row }) => row.cigar_name)?.row ?? group[0];

    out.push({
      productId,
      name: display.cigar_name ?? 'Unknown Cigar',
      brand: display.brand ?? '',
      size: display.size ?? '',
      entries: group.length,
      avgOverall: avg(overall),
      avgBody: avg(group.map(r => r.body).filter((n): n is number => n != null)),
      avgStrength: avg(group.map(r => r.strength).filter((n): n is number => n != null)),
      avgFlavor: avg(group.map(r => r.flavor_rating).filter((n): n is number => n != null)),
      avgValue: avg(group.map(r => r.value_rating).filter((n): n is number => n != null)),
      avgAppearance: avg(group.map(r => r.appearance_rating).filter((n): n is number => n != null)),
      wouldTryAgainPct,
      ratingVariance: stdDev(overall),
      tagCounts,
      ratingDistribution: dist,
      recentTrend: computeTrend(group),
      notes,
    });
  }

  out.sort((a, b) => b.avgOverall - a.avgOverall);
  return out;
}
