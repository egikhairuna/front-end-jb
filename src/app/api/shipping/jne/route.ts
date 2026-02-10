import { NextResponse } from 'next/server';
import { JNEPriceRequest } from '@/types/jne';
import { calculateJNEPrice } from '@/lib/jne';

export async function POST(request: Request) {
  try {
    const body: JNEPriceRequest = await request.json();
    const { from, thru, weight } = body;

    if (!from || !thru || weight === undefined) {
      return NextResponse.json(
        { error: 'Origin (from), Destination (thru), and Weight are required' },
        { status: 400 }
      );
    }

    console.log('🚢 Fetching JNE price for:', { from, thru, weight });

    // Use centralized JNE service
    const data = await calculateJNEPrice({ from, thru, weight });

    if ('error' in data && data.error) {
      console.error('❌ JNE Business Error:', data.error);
      return NextResponse.json(
        { error: data.error, status: false },
        { status: 400 }
      );
    }

    console.log('✅ JNE prices fetched successfully');
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('💥 Internal Error in JNE Route:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to calculate JNE price',
        details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
      },
      { status: 500 }
    );
  }
}
