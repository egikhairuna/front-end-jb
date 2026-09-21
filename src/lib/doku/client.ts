import { getDokuConfig } from './config';
import { generateDigest, generateSignature, getDokuTimestamp } from './signature';

export interface DokuLineItem {
  name: string;
  price: number;
  quantity: number;
}

export interface DokuCustomer {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  country?: string; // 2-letter ISO code e.g. "US", "SG", "JP"
  city?: string;
}

export interface CreateCardPaymentPageParams {
  invoiceNumber: string;
  amountIDR: number;
  lineItems: DokuLineItem[];
  customer: DokuCustomer;
  callbackUrl: string;
  failedUrl?: string;
  autoRedirect?: boolean;
}

export interface CreateCardPaymentPageResult {
  url: string;
  invoiceNumber: string;
}

/**
 * Calls DOKU's Credit Card Payment Page API (Non-SNAP)
 * Endpoint: POST /credit-card/v1/payment-page
 */
export async function createCardPaymentPage(
  params: CreateCardPaymentPageParams
): Promise<CreateCardPaymentPageResult> {
  const config = getDokuConfig();
  const endpointPath = '/credit-card/v1/payment-page';
  const url = `${config.baseUrl}${endpointPath}`;

  // Clean integer amounts in IDR with no decimals
  const cleanAmount = Math.round(params.amountIDR);

  // Clean and sanitize line items
  const cleanLineItems: DokuLineItem[] = params.lineItems.map((item) => ({
    name: (item.name || 'Item').slice(0, 255),
    price: Math.round(item.price),
    quantity: Math.max(1, Math.round(item.quantity)),
  }));

  // Ensure line items sum matches cleanAmount exactly
  const lineItemsSum = cleanLineItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const diff = cleanAmount - lineItemsSum;
  if (diff !== 0) {
    if (cleanLineItems.length > 0) {
      // Adjust the first or last item so the total matches exactly
      cleanLineItems[cleanLineItems.length - 1].price += diff;
    } else {
      cleanLineItems.push({
        name: 'Order Total',
        price: cleanAmount,
        quantity: 1,
      });
    }
  }

  // Format customer phone if present
  let phone = params.customer.phone?.replace(/[^0-9]/g, '') || '';
  // If phone starts with 0, replace with 62 (if Indonesia) or keep as is
  if (phone.startsWith('0')) {
    phone = '62' + phone.slice(1);
  }

  const requestBody = {
    order: {
      invoice_number: params.invoiceNumber.slice(0, 64),
      amount: cleanAmount,
      line_items: cleanLineItems,
      callback_url: params.callbackUrl,
      failed_url: params.failedUrl || params.callbackUrl,
      auto_redirect: params.autoRedirect ?? true,
    },
    customer: {
      id: (params.customer.id || params.customer.email || 'CUST').slice(0, 64),
      name: (params.customer.name || 'Customer').slice(0, 128),
      email: params.customer.email || '',
      ...(phone ? { phone: phone.slice(0, 32) } : {}),
      ...(params.customer.address ? { address: params.customer.address.slice(0, 255) } : {}),
      ...(params.customer.country ? { country: params.customer.country.slice(0, 2) } : {}),
      ...(params.customer.city ? { city: params.customer.city.slice(0, 100) } : {}),
    },
    payment: {
      type: 'SALE',
    },
  };

  const jsonBody = JSON.stringify(requestBody);
  const requestId = crypto.randomUUID();
  const requestTimestamp = getDokuTimestamp();
  const digest = generateDigest(jsonBody);

  const signature = generateSignature({
    clientId: config.clientId,
    requestId,
    requestTimestamp,
    requestTarget: endpointPath,
    digest,
    secretKey: config.secretKey,
  });

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Client-Id': config.clientId,
    'Request-Id': requestId,
    'Request-Timestamp': requestTimestamp,
    'Signature': signature,
  };

  console.log('💳 Initiating DOKU Payment Page generation:', {
    invoiceNumber: params.invoiceNumber,
    amountIDR: cleanAmount,
    env: config.env,
    requestId,
  });

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: jsonBody,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data) {
    const errorDetails = data?.errors?.message || data?.error?.message || data?.message || JSON.stringify(data) || response.statusText;
    console.error('💥 DOKU API Error:', {
      status: response.status,
      statusText: response.statusText,
      data,
    });
    throw new Error(`DOKU Payment Page generation failed (${response.status}): ${errorDetails}`);
  }

  const paymentPageUrl = data.credit_card_payment_page?.url;
  if (!paymentPageUrl) {
    console.error('💥 DOKU response missing credit_card_payment_page.url:', data);
    throw new Error('DOKU API response did not contain a payment page URL');
  }

  console.log('✅ DOKU Payment Page generated successfully:', {
    invoiceNumber: params.invoiceNumber,
  });

  return {
    url: paymentPageUrl,
    invoiceNumber: data.order?.invoice_number || params.invoiceNumber,
  };
}
