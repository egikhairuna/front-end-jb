import { NextRequest, NextResponse } from 'next/server';
import { getWooCommerceClient } from '@/lib/woocommerce/client';
import { buildOrderPayload, validateOrderPayload } from '@/lib/woocommerce/transformers';
import { handleWooCommerceError, logOrderError } from '@/lib/woocommerce/errors';
import { calculateJNEPrice } from '@/lib/jne';

export async function POST(request: NextRequest) {
  try {
    const wooCommerceClient = getWooCommerceClient();
    // Parse request body
    const body = await request.json();
    const { cartItems, formData, shippingOption, paymentMethod } = body;

    // 🔒 SECURITY: Server-side price & shipping validation
    // DO NOT trust prices or shipping totals sent from the client.
    
    // 1. Validate Product Prices & Stock
    const validatedCartItems = await Promise.all(cartItems.map(async (item: any) => {
      const productId = item.product.databaseId || parseInt(item.product.id);
      const variationId = item.variation?.databaseId;
      const quantity = item.quantity;
      
      let officialPrice = 0;
      let stockData: any = {};

      if (variationId) {
        const variation = await wooCommerceClient.getVariation(productId, variationId);
        officialPrice = parseFloat(variation.price);
        stockData = {
          manage_stock: variation.manage_stock,
          stock_quantity: variation.stock_quantity,
          stock_status: variation.stock_status,
          backorders: variation.backorders
        };
      } else {
        const product = await wooCommerceClient.getProduct(productId);
        officialPrice = parseFloat(product.price);
        stockData = {
          manage_stock: product.manage_stock,
          stock_quantity: product.stock_quantity,
          stock_status: product.stock_status,
          backorders: product.backorders
        };
      }

      // 🛒 STOCK VALIDATION (Pre-flight)
      const { manage_stock, stock_quantity, stock_status, backorders } = stockData;
      const productName = item.product.name;

      // Rejection logic: Only reject if backorders are 'no'
      if (backorders === 'no') {
        if (stock_status === 'outofstock') {
          throw new Error(`STOCK_ERROR:OUT_OF_STOCK:${productName}`);
        }
        if (manage_stock && stock_quantity < quantity) {
          throw new Error(`STOCK_ERROR:INSUFFICIENT_STOCK:${productName}:${stock_quantity}`);
        }
      }

      return {
        ...item,
        officialPrice
      };
    }));

    // 2. Validate Shipping Cost
    // Silent override if mismatch
    let validatedShippingPrice = shippingOption.price;
    try {
      // 🔒 SECURITY: Use centralized JNE service for validation
      const weightGrams = cartItems.reduce((sum: number, item: any) => {
        const weightValue = typeof item.product.weight === 'string' 
          ? parseFloat(item.product.weight) 
          : (item.product.weight || 0);
        return sum + (weightValue * item.quantity);
      }, 0);
      const weightKg = Math.max(1, Math.ceil(weightGrams / 1000));
      
      const jneData = await calculateJNEPrice({
        from: 'BDO10000', // Origin fixed to Bandung
        thru: formData.jneDestinationCode,
        weight: weightKg
      });
      
      const officialShipping = jneData.price?.find((p: any) => p.service_display === shippingOption.service);
      
      if (officialShipping && parseInt(officialShipping.price) !== shippingOption.price) {
        validatedShippingPrice = parseInt(officialShipping.price);
      }
    } catch (e) {
      console.error('Failed to validate shipping, falling back to client value (Risky):', e);
    }

    // Update payloads to use validated data
    const validatedShippingOption = { ...shippingOption, price: validatedShippingPrice };

    // Build order payload using validated items
    // We pass the official prices so buildOrderPayload calculates the correct BACS total
    const orderPayload = buildOrderPayload(
      validatedCartItems.map((item: any) => ({
        ...item,
        product: { ...item.product, price: item.officialPrice.toString() },
        variation: item.variation ? { ...item.variation, price: item.officialPrice.toString() } : undefined
      })),
      formData,
      validatedShippingOption,
      paymentMethod || 'bacs'
    );

    // Validate payload
    const validation = validateOrderPayload(orderPayload);
    if (!validation.valid) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validation.errors 
        },
        { status: 400 }
      );
    }

    // Create order via WooCommerce REST API
    const order = await wooCommerceClient.createOrder(orderPayload);

    // 🔧 Override payment_url to point to Next.js frontend
    // WooCommerce returns WordPress URLs by default, we need to redirect to our frontend
    const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';
    const customPaymentUrl = `${frontendUrl}/order-success/${order.id}?key=${order.order_key}`;

    // Return success response
    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        number: order.number,
        orderKey: order.order_key,
        status: order.status,
        total: order.total,
        paymentUrl: customPaymentUrl, // ✅ Use our custom URL instead of WooCommerce's
      },
    });

  } catch (error) {
    // Log error with context
    logOrderError(error, {
      endpoint: '/api/orders/create',
      timestamp: new Date().toISOString(),
    });

    const errorInfo = handleWooCommerceError(error);
    const isStockError = typeof errorInfo === 'object' && errorInfo.code?.includes('stock');

    return NextResponse.json(
      typeof errorInfo === 'object' ? errorInfo : { error: errorInfo },
      { status: isStockError ? 400 : 500 }
    );
  }
}
