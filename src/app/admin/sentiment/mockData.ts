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

export const MOCK_CIGARS: CigarSentiment[] = [
  {
    productId: 'p_001',
    name: 'Padron 1964 Anniversary Exclusivo',
    brand: 'Padron',
    size: '5.5 x 50',
    entries: 47,
    avgOverall: 4.8,
    avgBody: 4.1,
    avgStrength: 3.9,
    avgFlavor: 4.7,
    avgValue: 4.2,
    avgAppearance: 4.9,
    wouldTryAgainPct: 96,
    ratingVariance: 0.3,
    ratingDistribution: [0, 0, 2, 7, 38],
    recentTrend: 'flat',
    tagCounts: {
      'Cocoa': 38, 'Espresso': 34, 'Cedar': 29, 'Leather': 24,
      'Black Pepper': 19, 'Toast': 14, 'Caramel': 11, 'Earth': 9,
    },
    notes: [
      { userHandle: 'Dave M.', date: '2026-04-12', overall: 5, body: 4, strength: 4, tags: ['Cocoa','Espresso','Cedar'], wouldTryAgain: true, text: 'Perfect construction. Razor-sharp burn, tight ash. Cocoa and espresso dominate the first third, cedar and a hint of black pepper come through halfway. Never bitter, never harsh. Worth every penny.' },
      { userHandle: 'R. Kwan', date: '2026-04-09', overall: 5, body: 4, strength: 4, tags: ['Espresso','Leather','Cocoa'], wouldTryAgain: true, text: 'I keep coming back to this one. It\'s the benchmark I judge other cigars against.' },
      { userHandle: 'Marcus T.', date: '2026-04-03', overall: 4, body: 4, strength: 4, tags: ['Cedar','Toast','Caramel'], wouldTryAgain: true, text: 'Excellent but pricey. The caramel sweetness on the retrohale was unexpected and wonderful.' },
      { userHandle: 'J. Patel', date: '2026-03-28', overall: 5, body: 5, strength: 4, tags: ['Cocoa','Earth','Black Pepper'], wouldTryAgain: true, text: 'Smoked after dinner with a Lagavulin 16. Match made in heaven. Rich and complex without being overwhelming.' },
    ],
  },
  {
    productId: 'p_002',
    name: 'Arturo Fuente Hemingway Short Story',
    brand: 'Arturo Fuente',
    size: '4 x 49',
    entries: 41,
    avgOverall: 4.6,
    avgBody: 3.2,
    avgStrength: 3.0,
    avgFlavor: 4.4,
    avgValue: 4.7,
    avgAppearance: 4.5,
    wouldTryAgainPct: 93,
    ratingVariance: 0.4,
    ratingDistribution: [0, 1, 3, 9, 28],
    recentTrend: 'up',
    tagCounts: {
      'Cedar': 31, 'Cream': 28, 'Almond': 22, 'Honey': 19,
      'Toast': 16, 'Floral': 12, 'Butter': 10, 'Vanilla': 8,
    },
    notes: [
      { userHandle: 'Ellen R.', date: '2026-04-14', overall: 5, body: 3, strength: 3, tags: ['Cream','Almond','Honey'], wouldTryAgain: true, text: 'My go-to 45-minute smoke. Creamy, nutty, never aggressive. Perfect morning cigar.' },
      { userHandle: 'T. O\'Brien', date: '2026-04-10', overall: 5, body: 3, strength: 3, tags: ['Cedar','Cream','Toast'], wouldTryAgain: true, text: 'Punches above its weight class. The Cameroon wrapper is doing a lot of work here.' },
      { userHandle: 'Dave M.', date: '2026-04-02', overall: 4, body: 3, strength: 3, tags: ['Almond','Butter','Floral'], wouldTryAgain: true, text: 'Great value. Consistent from first to last one in the box.' },
    ],
  },
  {
    productId: 'p_003',
    name: 'Oliva Serie V Melanio Figurado',
    brand: 'Oliva',
    size: '6.5 x 52',
    entries: 38,
    avgOverall: 4.5,
    avgBody: 4.0,
    avgStrength: 3.7,
    avgFlavor: 4.5,
    avgValue: 4.4,
    avgAppearance: 4.6,
    wouldTryAgainPct: 92,
    ratingVariance: 0.5,
    ratingDistribution: [0, 1, 4, 10, 23],
    recentTrend: 'flat',
    tagCounts: {
      'Cedar': 29, 'Caramel': 26, 'Espresso': 21, 'Cinnamon': 17,
      'Leather': 15, 'Dark Chocolate': 12, 'Oak': 10, 'Toast': 7,
    },
    notes: [
      { userHandle: 'K. Ruiz', date: '2026-04-13', overall: 5, body: 4, strength: 4, tags: ['Caramel','Espresso','Cinnamon'], wouldTryAgain: true, text: 'The figurado shape concentrates the flavors beautifully. Cinnamon on the finish is distinctive.' },
      { userHandle: 'Marcus T.', date: '2026-04-06', overall: 4, body: 4, strength: 3, tags: ['Cedar','Caramel','Leather'], wouldTryAgain: true, text: 'Solid. Not as complex as the Anniversary but half the price.' },
    ],
  },
  {
    productId: 'p_004',
    name: 'Aladino Cameroon Robusto',
    brand: 'Aladino',
    size: '5 x 50',
    entries: 22,
    avgOverall: 4.7,
    avgBody: 2.8,
    avgStrength: 2.6,
    avgFlavor: 4.6,
    avgValue: 4.8,
    avgAppearance: 4.3,
    wouldTryAgainPct: 95,
    ratingVariance: 0.25,
    ratingDistribution: [0, 0, 1, 4, 17],
    recentTrend: 'up',
    tagCounts: {
      'Cream': 18, 'Honey': 16, 'Toast': 14, 'Cedar': 11,
      'Almond': 10, 'Hay': 7, 'Floral': 6, 'Butter': 5,
    },
    notes: [
      { userHandle: 'Ellen R.', date: '2026-04-15', overall: 5, body: 3, strength: 3, tags: ['Cream','Honey','Toast'], wouldTryAgain: true, text: 'Sleeper hit. Everyone at the lounge who\'s tried one has come back for a box.' },
      { userHandle: 'W. Hassan', date: '2026-04-11', overall: 5, body: 3, strength: 2, tags: ['Cream','Almond','Hay'], wouldTryAgain: true, text: 'Old-school Cameroon character. Reminds me of cigars from 20 years ago.' },
    ],
  },
  {
    productId: 'p_005',
    name: 'Camacho Triple Maduro Robusto',
    brand: 'Camacho',
    size: '5 x 50',
    entries: 33,
    avgOverall: 3.8,
    avgBody: 4.7,
    avgStrength: 4.8,
    avgFlavor: 3.9,
    avgValue: 3.5,
    avgAppearance: 4.0,
    wouldTryAgainPct: 61,
    ratingVariance: 1.4,
    ratingDistribution: [2, 5, 7, 9, 10],
    recentTrend: 'flat',
    tagCounts: {
      'Dark Chocolate': 24, 'Espresso': 22, 'Black Pepper': 19, 'Earth': 17,
      'Leather': 13, 'Molasses': 9, 'Oak': 7, 'Clove': 5,
    },
    notes: [
      { userHandle: 'J. Patel', date: '2026-04-08', overall: 5, body: 5, strength: 5, tags: ['Dark Chocolate','Espresso','Black Pepper'], wouldTryAgain: true, text: 'If you want to get knocked on your ass, this is it. Massive dark chocolate and pepper.' },
      { userHandle: 'Dave M.', date: '2026-04-04', overall: 2, body: 5, strength: 5, tags: ['Earth','Leather'], wouldTryAgain: false, text: 'Too much. Overwhelmed dinner. Not for me — I can see why strength-chasers love it though.' },
      { userHandle: 'Ellen R.', date: '2026-03-30', overall: 3, body: 5, strength: 5, tags: ['Black Pepper','Molasses','Earth'], wouldTryAgain: false, text: 'Had to put it down halfway. Pepper bomb. Respect the construction.' },
      { userHandle: 'Marcus T.', date: '2026-03-22', overall: 5, body: 5, strength: 5, tags: ['Dark Chocolate','Oak','Clove'], wouldTryAgain: true, text: 'Monster. Pair with bourbon. Not for beginners.' },
    ],
  },
  {
    productId: 'p_006',
    name: 'Rocky Patel Vintage 1992 Toro',
    brand: 'Rocky Patel',
    size: '6 x 52',
    entries: 29,
    avgOverall: 4.2,
    avgBody: 3.5,
    avgStrength: 3.3,
    avgFlavor: 4.1,
    avgValue: 4.0,
    avgAppearance: 4.2,
    wouldTryAgainPct: 83,
    ratingVariance: 0.6,
    ratingDistribution: [0, 2, 4, 11, 12],
    recentTrend: 'down',
    tagCounts: {
      'Cedar': 22, 'Leather': 18, 'Coffee': 15, 'Raisin': 12,
      'Cinnamon': 9, 'Toast': 8, 'Plum': 6, 'Fig': 4,
    },
    notes: [
      { userHandle: 'R. Kwan', date: '2026-04-07', overall: 3, body: 3, strength: 3, tags: ['Cedar','Leather'], wouldTryAgain: false, text: 'Last three have had burn issues. Previously a 5-star for me. Maybe a bad box?' },
      { userHandle: 'T. O\'Brien', date: '2026-04-01', overall: 4, body: 4, strength: 3, tags: ['Coffee','Raisin','Cedar'], wouldTryAgain: true, text: 'Still solid. Nutty and sweet middle third.' },
    ],
  },
  {
    productId: 'p_007',
    name: 'Dunbarton Sin Compromiso Paladin',
    brand: 'Dunbarton',
    size: '6 x 56',
    entries: 14,
    avgOverall: 4.9,
    avgBody: 4.3,
    avgStrength: 4.0,
    avgFlavor: 4.9,
    avgValue: 4.1,
    avgAppearance: 4.8,
    wouldTryAgainPct: 100,
    ratingVariance: 0.1,
    ratingDistribution: [0, 0, 0, 2, 12],
    recentTrend: 'up',
    tagCounts: {
      'Espresso': 13, 'Dark Chocolate': 12, 'Cedar': 10, 'Black Pepper': 9,
      'Leather': 8, 'Oak': 6, 'Raisin': 5, 'Molasses': 3,
    },
    notes: [
      { userHandle: 'J. Patel', date: '2026-04-14', overall: 5, body: 4, strength: 4, tags: ['Espresso','Dark Chocolate','Cedar'], wouldTryAgain: true, text: 'Steve Saka does not miss. Every single one in the box has been flawless.' },
      { userHandle: 'W. Hassan', date: '2026-04-05', overall: 5, body: 5, strength: 4, tags: ['Dark Chocolate','Black Pepper','Leather'], wouldTryAgain: true, text: 'Luxurious. Low entry count but I haven\'t seen a bad review of this yet at the lounge.' },
    ],
  },
  {
    productId: 'p_008',
    name: 'Macanudo Café Hyde Park',
    brand: 'Macanudo',
    size: '5.5 x 49',
    entries: 19,
    avgOverall: 3.1,
    avgBody: 2.0,
    avgStrength: 1.8,
    avgFlavor: 2.9,
    avgValue: 3.4,
    avgAppearance: 4.0,
    wouldTryAgainPct: 47,
    ratingVariance: 0.8,
    ratingDistribution: [1, 4, 8, 5, 1],
    recentTrend: 'down',
    tagCounts: {
      'Cream': 14, 'Hay': 11, 'Cedar': 8, 'Grass': 6,
      'Almond': 4, 'Toast': 3, 'Floral': 2, 'Bread': 1,
    },
    notes: [
      { userHandle: 'Marcus T.', date: '2026-04-10', overall: 3, body: 2, strength: 2, tags: ['Cream','Hay','Grass'], wouldTryAgain: false, text: 'Fine for a golf course cigar. Not much happening flavor-wise.' },
      { userHandle: 'K. Ruiz', date: '2026-04-03', overall: 2, body: 2, strength: 2, tags: ['Hay','Grass'], wouldTryAgain: false, text: 'Too mild. Tastes like lawn clippings. Give me something with character.' },
      { userHandle: 'Ellen R.', date: '2026-03-25', overall: 4, body: 2, strength: 2, tags: ['Cream','Cedar','Almond'], wouldTryAgain: true, text: 'I like a gentle morning smoke. This is fine for what it is.' },
    ],
  },
];

export const ALL_TAGS = [
  'Leather','Cedar','Oak','Earth','Hay','Tobacco',
  'Black Pepper','White Pepper','Cinnamon','Nutmeg','Clove',
  'Chocolate','Dark Chocolate','Coffee','Espresso','Vanilla','Caramel','Honey','Molasses','Cocoa',
  'Citrus','Cherry','Fig','Raisin','Dried Fruit','Plum',
  'Floral','Grass','Herbal','Mint','Tea',
  'Almond','Walnut','Peanut','Cream','Butter','Toast','Bread',
];
