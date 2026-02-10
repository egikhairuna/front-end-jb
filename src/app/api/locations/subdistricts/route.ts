
import { NextResponse } from 'next/server';
import subdistricts from '@/data/regions/subdistricts.json';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const distId = searchParams.get('district_id');

  if (!distId) {
    return NextResponse.json({ error: 'District ID required' }, { status: 400 });
  }

  const filtered = subdistricts.filter(s => s.parent_id === parseInt(distId));
  return NextResponse.json(filtered);
}
