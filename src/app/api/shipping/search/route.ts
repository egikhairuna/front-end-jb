import { NextResponse } from 'next/server';
import destinations from '@/data/jne-destinations.json';

interface JNEDestination {
  code: string;
  province: string;
  city: string;
  district: string;
  subdistrict: string;
  zip: string;
}

interface LocationResult {
  id: string; // TARIFF_CODE
  label: string; // "Province, City, District, Subdistrict (Zip)"
  detail: {
    province: string;
    city: string;
    district: string;
    subdistrict: string;
    zip: string;
    code: string;
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.toLowerCase();

  if (!search || search.length < 3) {
    return NextResponse.json(
      { error: 'Please type at least 3 characters' },
      { status: 400 }
    );
  }

  try {
    const results: LocationResult[] = [];
    const limit = 20;
    
    // Search through JSON data
    for (const location of destinations as JNEDestination[]) {
      if (results.length >= limit) break;

      // Searchable string
      const fullString = `${location.province} ${location.city} ${location.district} ${location.subdistrict} ${location.zip}`.toLowerCase();

      if (fullString.includes(search)) {
        results.push({
          id: location.code,
          label: `${location.province}, ${location.city}, ${location.district}, ${location.subdistrict} (${location.zip})`,
          detail: {
            province: location.province,
            city: location.city,
            district: location.district,
            subdistrict: location.subdistrict,
            zip: location.zip,
            code: location.code
          }
        });
      }
    }
    
    console.log(`✅ Found ${results.length} locations for "${search}"`);

    return NextResponse.json({ data: results });

  } catch (error: any) {
    console.error('💥 Error searching destinations:', error);
    return NextResponse.json(
      { error: 'Failed to search locations' },
      { status: 500 }
    );
  }
}
