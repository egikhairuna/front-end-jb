import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getWooCommerceClient } from '@/lib/woocommerce/client';
import { WCOrderResponse } from '@/types/woocommerce';

function extractMeta(metaData: Array<{ key: string; value: unknown }>, key: string): string | null {
  const meta = metaData?.find(m => m.key === key);
  if (!meta || meta.value === undefined || meta.value === null) return null;
  return String(meta.value);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { orderId: rawOrderId } = await params;
    const orderId = parseInt(rawOrderId, 10);

    if (isNaN(orderId)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    const wc = getWooCommerceClient();
    let order: WCOrderResponse;
    try {
      order = await wc.getOrder(orderId);
    } catch {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // 🔒 Security Check: verify the order belongs to this customer
    if (order.customer_id !== session.id) {
      console.warn(`🚨 Unauthorized access attempt: user ${session.id} tried to access order ${orderId} belonging to customer ${order.customer_id}`);
      return NextResponse.json(
        { error: 'You are not authorized to view this order.' },
        { status: 403 }
      );
    }

    const typedOrder = order as WCOrderResponse & { payment_method_title?: string; fee_lines?: Array<{ name: string; total: string }> };

    return NextResponse.json({
      id: typedOrder.id,
      number: typedOrder.number,
      status: typedOrder.status,
      date_created: typedOrder.date_created,
      total: typedOrder.total,
      currency: typedOrder.currency,
      shipping_total: typedOrder.shipping_total,
      line_items: typedOrder.line_items.map((item) => {
        const typedItem = item as typeof item & { price?: string; image?: { src: string } };
        return {
          id: typedItem.id,
          name: typedItem.name,
          product_id: typedItem.product_id,
          quantity: typedItem.quantity,
          total: typedItem.total,
          price: typedItem.price || '0',
          image: typedItem.image,
        };
      }),
      shipping_lines: typedOrder.shipping_lines,
      fee_lines: typedOrder.fee_lines || [],
      billing: typedOrder.billing,
      shipping: typedOrder.shipping,
      payment_method: typedOrder.payment_method,
      payment_method_title: typedOrder.payment_method_title || 'Direct Bank Transfer',
      // JNE Tracking
      tracking_number: extractMeta(typedOrder.meta_data, 'jneshof_shipping_tracking_number'),
      pickup_date: extractMeta(typedOrder.meta_data, 'jneshof_shipping_pickup_date'),
      // Unique Code and BACS Meta
      unique_code: extractMeta(typedOrder.meta_data, '_unique_payment_code'),
      transfer_amount: extractMeta(typedOrder.meta_data, '_transfer_amount'),
    });
  } catch (error) {
    console.error('💥 Order details route error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order details' },
      { status: 500 }
    );
  }
}
