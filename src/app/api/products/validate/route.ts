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
          let data;
          if (item.variationId) {
            data = await wooCommerceClient.getVariation(item.productId, item.variationId);
          } else {
            data = await wooCommerceClient.getProduct(item.productId);
          }

          // If fetching fails or status is not publish
          if (!data || (data.status && data.status !== 'publish')) {
             // Note: Variations might not have a separate 'status' field in some WC versions/responses 
             // but if they do, we check it. Usually if the parent product is pending/draft, the variation is unavailable.
             return { id: item.productId, variationId: item.variationId, name: item.name, reason: 'not_available' };
          }

          // Check stock status
          // WooCommerce REST API properties: stock_status ('instock', 'outofstock', 'onbackorder')
          if (data.stock_status === 'outofstock') {
            return { id: item.productId, variationId: item.variationId, name: item.name, reason: 'out_of_stock' };
          }

          // Optional: Check if stock quantity is managed and reached 0
          if (data.manage_stock && data.stock_quantity !== null && data.stock_quantity <= 0 && data.backorders === 'no') {
            return { id: item.productId, variationId: item.variationId, name: item.name, reason: 'out_of_stock' };
          }

          return null;
        } catch (error) {
          console.error(`Validation failed for item ${item.name}:`, error);
          // If fetch fails (e.g. 404), treat as unavailable
          return { id: item.productId, variationId: item.variationId, name: item.name, reason: 'not_available' };
        }
      })
    );

    const unavailable = results.filter(Boolean);
    return NextResponse.json({ unavailable });
  } catch (error) {
    console.error('Global validation error:', error);
    return NextResponse.json({ unavailable: [] });
  }
}
