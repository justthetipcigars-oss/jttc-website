export interface PipeSpecs {
  length?: string;
  weight?: string;
  bowl_height?: string;
  chamber_depth?: string;
  chamber_diameter?: string;
  outside_diameter?: string;
  stem_material?: string;
  filter?: string;
  shape?: string;
  finish?: string;
  material?: string;
  country?: string;
}

const FIELD_MAP: Record<string, keyof PipeSpecs> = {
  'length':           'length',
  'weight':           'weight',
  'bowl height':      'bowl_height',
  'chamber depth':    'chamber_depth',
  'chamber diameter': 'chamber_diameter',
  'outside diameter': 'outside_diameter',
  'stem material':    'stem_material',
  'filter':           'filter',
  'shape':            'shape',
  'finish':           'finish',
  'material':         'material',
  'country':          'country',
};

export function parsePipeSpecs(description: string): PipeSpecs {
  if (!description) return {};

  const specs: PipeSpecs = {};
  const re = /<li>\s*<strong>([^<]+)<\/strong>\s*:\s*([^<]+)<\/li>/gi;

  let match: RegExpExecArray | null;
  while ((match = re.exec(description)) !== null) {
    const rawLabel = match[1].trim().toLowerCase();
    const rawValue = match[2].trim()
      .replace(/&amp;/g, '&')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ');

    const key = FIELD_MAP[rawLabel];
    if (key && rawValue) specs[key] = rawValue;
  }

  return specs;
}
