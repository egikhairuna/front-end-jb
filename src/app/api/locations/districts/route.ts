
import { NextResponse } from 'next/server';
import districts from '@/data/regions/districts.json';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cityId = searchParams.get('city_id');

  if (!cityId) {
    return NextResponse.json({ error: 'City ID required' }, { status: 400 });
  }

  const filtered = districts.filter(d => d.parent_id === parseInt(cityId));
  return NextResponse.json(filtered);
}
