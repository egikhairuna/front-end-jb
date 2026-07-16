import { NextRequest, NextResponse } from 'next/server';
import { getWooCommerceClient } from '@/lib/woocommerce/client';
import { buildOrderPayload, validateOrderPayload } from '@/lib/woocommerce/transformers';
import { handleWooCommerceError, logOrderError } from '@/lib/woocommerce/errors';
import { calculateJNEPrice } from '@/lib/jne';
import { calculateInternationalCost } from '@/lib/rajaongkir';
import { getSession } from '@/lib/auth/session';
import { validateOrigin } from '@/lib/auth/csrf';
import { checkRateLimit, getClientIP } from '@/lib/auth/rate-limit';
import { redis } from '@/lib/redis';

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);
  const idempotencyKey = request.headers.get('idempotency-key');
  const redisKey = idempotencyKey ? `idem:order:${idempotencyKey}` : null;

  try {
    // 🛡️ CSRF check
    if (!validateOrigin(request)) {
      return NextResponse.json(
        { error: 'Invalid request origin' },
        { status: 403 }
      );
    }

    // Retrieve authenticated session if available
    const session = await getSession();

    // 🛡️ Rate limiting (IP combined with session ID if logged in)
    const rateLimitIdentifier = session ? `order:${ip}:${session.id}` : `order:${ip}`;
    const rateCheck = await checkRateLimit(rateLimitIdentifier, 10); // 10 attempts per 15 min
    if (!rateCheck.allowed) {
      const retryAfterSec = Math.ceil((rateCheck.retryAfterMs || 60000) / 1000);
      return NextResponse.json(
        { error: 'Too many order attempts. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': retryAfterSec.toString() },
        }
      );
    }

    // 🛡️ Idempotency key validation
    if (!idempotencyKey) {
      return NextResponse.json(
        { error: 'Idempotency-Key header is required' },
        { status: 400 }
      );
    }

    let cached = null;
    try {
      cached = await redis.get(redisKey!);
    } catch (err: any) {
      console.error('⚠️ Redis connection error during idempotency check:', err.message);
    }

    if (cached) {
      const cachedData = JSON.parse(cached);
      if (cachedData.status === 'in-progress') {
        console.warn(`⚠️ Duplicate order request in progress for key: ${idempotencyKey}`);
        return NextResponse.json(
          { error: 'Order creation is in progress. Please wait.' },
          { status: 409 }
        );
      }
      if (cachedData.status === 'completed') {
        console.log(`✅ Returning cached completed order response for key: ${idempotencyKey}`);
        return NextResponse.json(cachedData.response);
      }
    }

    // Mark as in-progress in Redis (60 seconds TTL)
    try {
      await redis.set(redisKey!, JSON.stringify({ status: 'in-progress' }), 'EX', 60);
    } catch (err: any) {
      console.error('⚠️ Redis connection error setting in-progress:', err.message);
    }

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
        // 🔒 SECURITY: For variations, check the parent product's status.
        // Variations inherit publish state from their parent and don't expose their own `status` field.
        const [variation, parentProduct] = await Promise.all([
          wooCommerceClient.getVariation(productId, variationId),
          wooCommerceClient.getProduct(productId),
        ]);

        if (parentProduct.status !== 'publish') {
          throw new Error(`PRODUCT_ERROR:NOT_AVAILABLE:${item.product.name}`);
        }

        officialPrice = parseFloat(variation.price);
        stockData = {
          manage_stock: variation.manage_stock,
          stock_quantity: variation.stock_quantity,
          stock_status: variation.stock_status,
          backorders: variation.backorders
        };
      } else {
        const product = await wooCommerceClient.getProduct(productId);

        // 🔒 SECURITY: Reject orders for non-published products (private, draft, trash).
        if (product.status !== 'publish') {
          throw new Error(`PRODUCT_ERROR:NOT_AVAILABLE:${item.product.name}`);
        }

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
      // 🔒 SECURITY: Use appropriate service for validation (JNE domestic vs RajaOngkir international)
      const weightGrams = cartItems.reduce((sum: number, item: any) => {
        const weightValue = typeof item.product.weight === 'string' 
          ? parseFloat(item.product.weight) 
          : (item.product.weight || 0);
        return sum + (weightValue * item.quantity);
      }, 0);
      
      const isDomestic = formData.country === 'Indonesia';

      if (isDomestic) {
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
      } else {
        const countryId = formData.internationalShippingCountryId;
        if (countryId) {
          const rates = await calculateInternationalCost(countryId, weightGrams);
          const officialShipping = rates.find((r: any) => r.service === shippingOption.service);
          
          if (officialShipping && officialShipping.price !== shippingOption.price) {
            validatedShippingPrice = officialShipping.price;
          }
        }
      }
    } catch (e) {
      console.error('⚠️ Shipping validation failed — rejecting order to prevent price manipulation:', e);

      // Clean up idempotency key so customer can retry
      if (redisKey) {
        try { await redis.del(redisKey); } catch {}
      }

      return NextResponse.json(
        { 
          error: 'Unable to verify shipping cost at this time. Please try again in a moment.',
          code: 'SHIPPING_VALIDATION_FAILED'
        },
        { status: 503 }
      );
    }

    // Update payloads to use validated data
    const validatedShippingOption = { ...shippingOption, price: validatedShippingPrice };

    // Build order payload using validated items
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

    // 🔒 SECURITY: Attach customer_id from session if user is logged in
    if (session) {
      orderPayload.customer_id = session.id;
    }

    // Validate payload
    const validation = validateOrderPayload(orderPayload);
    if (!validation.valid) {
      // Clean up idempotency key from Redis so the client can correct data and retry
      if (redisKey) {
        try {
          await redis.del(redisKey);
        } catch (err: any) {
          console.error('❌ Failed to delete idempotency key from Redis (validation error cleanup):', err.message);
        }
      }
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
    const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';
    const customPaymentUrl = `${frontendUrl}/order-success/${order.id}?key=${order.order_key}`;

    const successResponse = {
      success: true,
      order: {
        id: order.id,
        number: order.number,
        orderKey: order.order_key,
        status: order.status,
        total: order.total,
        paymentUrl: customPaymentUrl,
      },
    };

    // Cache completed response in Redis (10 minutes = 600s TTL)
    try {
      await redis.set(redisKey!, JSON.stringify({ status: 'completed', response: successResponse }), 'EX', 600);
    } catch (err: any) {
      console.error('⚠️ Redis connection error saving completed order:', err.message);
    }

    // Return success response
    return NextResponse.json(successResponse);

  } catch (error) {
    // 🔒 SECURITY: Ensure idempotency key is removed on unexpected errors so retrying is possible
    if (redisKey) {
      try {
        await redis.del(redisKey);
      } catch (err: any) {
        console.error('❌ Failed to delete idempotency key from Redis (catch block):', err.message);
      }
    }

    // Log error with context
    logOrderError(error, {
      endpoint: '/api/orders/create',
      timestamp: new Date().toISOString(),
    });

    const errorInfo = handleWooCommerceError(error);
    const isClientError = typeof errorInfo === 'object' && (
      errorInfo.code?.includes('stock') ||
      errorInfo.code === 'woocommerce_rest_product_not_available'
    );

    return NextResponse.json(
      typeof errorInfo === 'object' ? errorInfo : { error: errorInfo },
      { status: isClientError ? 400 : 500 }
    );
  }
}
