import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { cnote_no } = await request.json();

    if (!cnote_no) {
      return NextResponse.json({ error: 'cnote_no is required' }, { status: 400 });
    }

    const JNE_USERNAME = process.env.JNE_USERNAME;
    const JNE_API_KEY = process.env.JNE_API_KEY;
    const JNE_TRACKING_ENDPOINT = process.env.JNE_TRACKING_ENDPOINT || 'https://apiv2.jne.co.id:10205/tracing/api/trackingCnote';

    if (!JNE_USERNAME || !JNE_API_KEY) {
      return NextResponse.json({ error: 'JNE credentials not configured' }, { status: 500 });
    }

    const formData = new URLSearchParams();
    formData.append('username', JNE_USERNAME);
    formData.append('api_key', JNE_API_KEY);
    formData.append('cnote_no', cnote_no);

    console.log(`🚢 Fetching JNE tracking status for cnote_no: ${cnote_no}`);
    const response = await fetch(JNE_TRACKING_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: formData.toString(),
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`JNE API returned status ${response.status}`);
    }

    const data = await response.json();

    // If JNE returns error or status is false, return 404
    if (data.status === false || data.error || !data.cnote) {
      return NextResponse.json(
        { error: data.error || 'Tracking information not found' },
        { status: 404 }
      );
    }

    const cnote = data.cnote || {};
    const history = data.history || [];

    return NextResponse.json({
      pod_status: cnote.pod_status || 'ON PROCESS',
      last_status: cnote.last_status || '',
      cnote_date: cnote.cnote_date || '',
      estimate_delivery: cnote.estimate_delivery || '',
      history: (history as Array<Record<string, unknown>>).map((item) => {
        return {
          date: typeof item.date === 'string' ? item.date : '',
          desc: typeof item.desc === 'string' ? item.desc : '',
          code: typeof item.code === 'string' ? item.code : '',
        };
      }),
    });

  } catch (error: unknown) {
    console.error('💥 Error JNE tracking API:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
