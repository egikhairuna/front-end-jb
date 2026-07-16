/**
 * GET /api/account/orders
 * List the authenticated customer's orders, paginated.
 *
 * 🔒 SECURITY:
 * - Requires authenticated session
 * - Scoped to session.userId
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getWooCommerceClient } from '@/lib/woocommerce/client';
import { WCOrderResponse } from '@/types/woocommerce';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const perPage = Math.min(parseInt(searchParams.get('per_page') || '10', 10), 50); // Cap at 50

    const wc = getWooCommerceClient();
    const result = await wc.getCustomerOrders(session.id, page, perPage);

    // Map orders to a safe response shape
    const orders = result.orders.map((order: WCOrderResponse) => {
      const typedOrder = order as WCOrderResponse & { payment_method_title?: string };
      const trackingMeta = typedOrder.meta_data?.find(m => m.key === 'jneshof_shipping_tracking_number');
      const trackingNumber = trackingMeta && trackingMeta.value ? String(trackingMeta.value) : null;

      return {
        id: typedOrder.id,
        number: typedOrder.number,
        status: typedOrder.status,
        total: typedOrder.total,
        currency: typedOrder.currency,
        dateCreated: typedOrder.date_created,
        itemCount: typedOrder.line_items?.length || 0,
        paymentMethod: typedOrder.payment_method_title,
        trackingNumber,
      };
    });

    return NextResponse.json({
      orders,
      pagination: {
        page,
        perPage,
        totalPages: result.totalPages,
        total: result.total,
      },
    });
  } catch (error) {
    console.error('💥 Orders fetch error:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
