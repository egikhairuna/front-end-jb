
import { NextResponse } from 'next/server';
import provinces from '@/data/regions/provinces.json';

export async function GET() {
  return NextResponse.json(provinces);
}
