export class WooCommerceError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'WooCommerceError';
  }
}

export function handleWooCommerceError(error: unknown): string {
  if (error instanceof WooCommerceError) {
    return getUserFriendlyMessage(error.code || '', error.message);
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}

function getUserFriendlyMessage(code: string, defaultMessage: string): string {
  const messages: Record<string, string> = {
    'woocommerce_rest_invalid_product_id': 'One or more products in your cart are no longer available.',
    'woocommerce_rest_product_invalid_id': 'Invalid product in cart. Please refresh and try again.',
    'woocommerce_rest_cannot_create': 'Unable to create order. Please contact support.',
    'woocommerce_rest_shop_order_invalid_id': 'Invalid order ID.',
    'rest_invalid_param': 'Invalid order data. Please check your information.',
    'rest_missing_callback_param': 'Missing required information. Please fill all fields.',
  };

  return messages[code] || defaultMessage;
}

export function logOrderError(error: unknown, context: Record<string, unknown>) {
  console.error('🚨 Order Error:', {
    error: error instanceof Error ? error.message : error,
    stack: error instanceof Error ? error.stack : undefined,
    context,
    timestamp: new Date().toISOString(),
  });
}
