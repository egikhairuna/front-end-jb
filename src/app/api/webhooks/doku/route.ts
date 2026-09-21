import { NextRequest, NextResponse } from 'next/server';
import { verifyDokuNotification } from '@/lib/doku/verify-notification';
import { getWooCommerceClient } from '@/lib/woocommerce/client';

interface DokuNotificationPayload {
  order?: {
    invoice_number?: string;
    amount?: number;
  };
  transaction?: {
    status?: string;
    date?: string;
    original_request_id?: string;
  };
  service?: {
    id?: string;
  };
  channel?: {
    id?: string;
    name?: string;
  };
}

export async function POST(request: NextRequest) {
  let rawBody = '';

  try {
    rawBody = await request.text();
  } catch (err: unknown) {
    console.error('❌ Failed to read DOKU webhook body:', err);
    return NextResponse.json({ error: 'Failed to read request body' }, { status: 400 });
  }

  // 🛡️ Verify DOKU signature authenticity
  const verification = verifyDokuNotification(request.headers, rawBody, '/api/webhooks/doku');

  if (!verification.isValid) {
    console.warn('⚠️ DOKU webhook signature verification rejected:', verification.error);
    return NextResponse.json(
      { error: 'Unauthorized: Invalid signature', message: verification.error },
      { status: 401 }
    );
  }

  // Parse JSON body in non-strict mode
  let payload: DokuNotificationPayload | null = null;
  try {
    payload = JSON.parse(rawBody) as DokuNotificationPayload;
  } catch (err: unknown) {
    console.error('❌ Failed to parse DOKU webhook JSON body:', err);
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const invoiceNumber = payload?.order?.invoice_number;
  const transactionStatus = payload?.transaction?.status?.toUpperCase();

  console.log('📬 Received verified DOKU HTTP Notification:', {
    invoiceNumber,
    transactionStatus,
    service: payload?.service?.id,
    channel: payload?.channel?.id,
    amount: payload?.order?.amount,
  });

  if (!invoiceNumber) {
    console.warn('⚠️ DOKU notification missing invoice_number');
    return NextResponse.json({ error: 'Missing invoice_number' }, { status: 400 });
  }

  // Parse order ID from invoice number (handles both raw ID "1234" and prefixed "INV-1234")
  const orderIdMatch = invoiceNumber.toString().match(/\d+/);
  const orderId = orderIdMatch ? parseInt(orderIdMatch[0], 10) : NaN;

  if (isNaN(orderId) || orderId <= 0) {
    console.error(`❌ Could not resolve WooCommerce order ID from invoice number: ${invoiceNumber}`);
    return NextResponse.json({ error: 'Invalid order ID in invoice_number' }, { status: 400 });
  }

  try {
    const wooCommerceClient = getWooCommerceClient();
    const order = await wooCommerceClient.getOrder(orderId);

    if (!order) {
      console.error(`❌ WooCommerce order not found for ID: ${orderId}`);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const currentStatus = order.status?.toLowerCase();

    // 🛡️ Handle duplicate / idempotent notifications
    if (transactionStatus === 'SUCCESS') {
      if (currentStatus === 'processing' || currentStatus === 'completed') {
        console.log(`ℹ️ Order #${orderId} is already marked as '${currentStatus}'. Skipping duplicate update.`);
        return NextResponse.json({ status: 'OK', message: 'Order already processed' }, { status: 200 });
      }

      console.log(`✅ Updating WooCommerce Order #${orderId} status from '${currentStatus}' to 'processing'`);
      await wooCommerceClient.updateOrderStatus(orderId, 'processing');

      return NextResponse.json({ status: 'OK', message: 'Order marked as processing' }, { status: 200 });
    } else if (transactionStatus === 'FAILED') {
      if (currentStatus === 'failed' || currentStatus === 'cancelled') {
        console.log(`ℹ️ Order #${orderId} is already marked as '${currentStatus}'. Skipping duplicate update.`);
        return NextResponse.json({ status: 'OK', message: 'Order already failed/cancelled' }, { status: 200 });
      }

      if (currentStatus === 'pending' || currentStatus === 'on-hold') {
        console.log(`⚠️ Updating WooCommerce Order #${orderId} status from '${currentStatus}' to 'failed'`);
        await wooCommerceClient.updateOrderStatus(orderId, 'failed');
      }

      return NextResponse.json({ status: 'OK', message: 'Order marked as failed' }, { status: 200 });
    } else {
      console.log(`ℹ️ Notification status '${transactionStatus}' requires no action for Order #${orderId}`);
      return NextResponse.json({ status: 'OK', message: `No action taken for status ${transactionStatus}` }, { status: 200 });
    }
  } catch (error: unknown) {
    console.error(`💥 Error updating WooCommerce order #${orderId} from DOKU webhook:`, error);
    return NextResponse.json(
      { error: 'Internal error processing notification' },
      { status: 500 }
    );
  }
}
