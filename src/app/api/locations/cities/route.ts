
import { NextResponse } from 'next/server';
import cities from '@/data/regions/cities.json';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const provId = searchParams.get('province_id');

  if (!provId) {
    return NextResponse.json({ error: 'Province ID required' }, { status: 400 });
  }

  const filtered = cities.filter(c => c.parent_id === parseInt(provId));
  return NextResponse.json(filtered);
}
