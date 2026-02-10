
/**
 * 🚢 Centralized JNE Shipping Service
 * Handles price calculations and API communication securely.
 */

interface JNEPriceRequest {
  from: string;
  thru: string;
  weight: number;
}

interface JNEPriceItem {
  service_display: string;
  goods_type: string;
  price: string;
  etd_from: string;
  etd_thru: string;
}

interface JNEResponse {
  price?: JNEPriceItem[];
  error?: string;
  status: boolean;
}

const JNE_API_URL = process.env.JNE_API_ENDPOINT || 'https://apiv2.jne.co.id:10205/tracing/api/pricedev';
const JNE_USERNAME = process.env.JNE_USERNAME;
const JNE_API_KEY = process.env.JNE_API_KEY;

export async function calculateJNEPrice(params: JNEPriceRequest): Promise<JNEResponse> {
  if (!JNE_USERNAME || !JNE_API_KEY) {
    throw new Error('JNE credentials are not configured in environment variables');
  }

  const formData = new URLSearchParams();
  formData.append('username', JNE_USERNAME);
  formData.append('api_key', JNE_API_KEY);
  formData.append('from', params.from);
  formData.append('thru', params.thru);
  formData.append('weight', params.weight.toString());

  try {
    const response = await fetch(JNE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: formData.toString(),
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`JNE API error: ${response.status}`);
    }

    const data = await response.json();
    return data as JNEResponse;
  } catch (error) {
    console.error('💥 JNE Service Error:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}
