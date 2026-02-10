import { NextResponse } from 'next/server';

const WP_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://jamesboogie.com';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');

  if (!search || search.length < 3) {
    return NextResponse.json(
      { error: 'Minimum 3 characters required' },
      { status: 400 }
    );
  }

  try {
    const url = `${WP_URL}/wp-json/checkout/v1/search-destination?search=${encodeURIComponent(search)}`;
    const response = await fetch(url, { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}