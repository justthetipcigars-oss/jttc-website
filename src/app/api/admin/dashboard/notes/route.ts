import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';

const REPO = 'justthetipcigars-oss/lightspeed-visual-interface';
const PATH = 'notes.json';
const API  = `https://api.github.com/repos/${REPO}/contents/${PATH}`;

function githubHeaders() {
  return {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

type Note = { id: string; text: string; page: string; createdAt: string };

async function readFile(): Promise<{ notes: Note[]; sha: string }> {
  const res = await fetch(API, { headers: githubHeaders(), cache: 'no-store' });
  if (!res.ok) throw new Error(`GitHub read failed: ${res.status}`);
  const meta = await res.json();
  const content = Buffer.from(meta.content, 'base64').toString('utf8');
  return { notes: JSON.parse(content), sha: meta.sha };
}

async function writeFile(notes: Note[], sha: string, message: string) {
  const content = Buffer.from(JSON.stringify(notes, null, 2) + '\n').toString('base64');
  const res = await fetch(API, {
    method: 'PUT',
    headers: { ...githubHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, content, sha }),
  });
  if (!res.ok) throw new Error(`GitHub write failed: ${res.status} ${await res.text()}`);
}

export async function GET() {
  const user = await requireRole(['tobacconist']);
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const { notes } = await readFile();
    return NextResponse.json({ notes });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await requireRole(['tobacconist']);
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const { text, page } = await request.json();
    if (!text?.trim()) return NextResponse.json({ error: 'text required' }, { status: 400 });

    const { notes, sha } = await readFile();
    const note: Note = {
      id: Date.now().toString(),
      text: text.trim(),
      page: page || 'Unknown',
      createdAt: new Date().toISOString(),
    };
    notes.push(note);
    await writeFile(notes, sha, `Add note on ${page}`);
    return NextResponse.json({ note });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const user = await requireRole(['tobacconist']);
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const { notes, sha } = await readFile();
    const filtered = notes.filter(n => n.id !== id);
    if (filtered.length === notes.length) return NextResponse.json({ error: 'note not found' }, { status: 404 });

    await writeFile(filtered, sha, `Delete note ${id}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
