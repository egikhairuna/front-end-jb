import { NextRequest, NextResponse } from 'next/server';
import { getWooCommerceClient } from '@/lib/woocommerce/client';

/**
 * POST /api/products/validate
 * Validates that all provided product IDs are still published and available.
 * Returns a list of unavailable products with their names.
 */
export async function POST(request: NextRequest) {
  try {
    const wooCommerceClient = getWooCommerceClient();
    const body = await request.json();
    const { items } = body as {
      items: { productId: number; variationId?: number; name: string }[];
    };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ unavailable: [] });
    }

    const results = await Promise.all(
      items.map(async (item) => {
        try {
          const product = await wooCommerceClient.getProduct(item.productId);
          if (product.status !== 'publish') {
            return { id: item.productId, name: item.name, reason: 'not_available' };
          }
          if (product.stock_status === 'outofstock' && product.backorders === 'no') {
            return { id: item.productId, name: item.name, reason: 'out_of_stock' };
          }
          return null;
        } catch {
          // If product fetch fails (e.g. deleted), treat as unavailable
          return { id: item.productId, name: item.name, reason: 'not_available' };
        }
      })
    );

    const unavailable = results.filter(Boolean);
    return NextResponse.json({ unavailable });
  } catch (error) {
    console.error('Product validation error:', error);
    return NextResponse.json({ unavailable: [] });
  }
}
