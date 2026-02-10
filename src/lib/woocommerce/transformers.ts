import { 
  WCAddress, 
  WCLineItem, 
  WCShippingLine, 
  WCMetaData,
  WCOrderPayload,
  CartItem,
  CheckoutFormData,
  ShippingOption
} from '@/types/woocommerce';

/**
 * Transform cart items to WooCommerce line items format
 */
export function transformCartToLineItems(cartItems: CartItem[]): WCLineItem[] {
  return cartItems.map((item) => {
    const productId = item.product.databaseId || parseInt(item.product.id);
    const variationId = item.variation?.databaseId;

    return {
      product_id: productId,
      variation_id: variationId,
      quantity: item.quantity,
      name: item.product.name,
    };
  });
}

/**
 * Transform form data to WooCommerce address format
 */
// Transform form data to WooCommerce address format
export function transformFormToAddress(
  formData: CheckoutFormData,
  includeEmail: boolean = true
): WCAddress {
  const address: WCAddress = {
    first_name: formData.firstName,
    last_name: formData.lastName,
    address_1: formData.address, // Street address
    address_2: formData.subdistrict, // Use subdistrict as address_2
    city: formData.city,
    state: formData.province, // Mapping province to state
    postcode: formData.postalCode,
    country: 'ID', // Indonesia
    phone: formData.phone,
  };

  if (includeEmail) {
    address.email = formData.email;
  }

  return address;
}

// Create shipping line for JNE
export function createShippingLine(
  shippingOption: ShippingOption
): WCShippingLine {
  return {
    method_id: 'jne',
    method_title: `JNE ${shippingOption.service}`,
    total: shippingOption.price.toString(),
  };
}

// Create metadata for JNE shipping details
export function createJNEMetadata(
  formData: CheckoutFormData,
  shippingOption: ShippingOption
): WCMetaData[] {
  return [
    { key: 'province', value: formData.province },
    { key: 'city', value: formData.city },
    { key: 'district', value: formData.district },
    { key: 'subdistrict', value: formData.subdistrict },
    { key: 'postal_code', value: formData.postalCode },
    { key: 'jne_destination_code', value: formData.jneDestinationCode },
    
    // Legacy internal fields for backward compatibility if needed
    { key: '_shipping_jne_service', value: shippingOption.service },
    { key: '_shipping_jne_etd', value: `${shippingOption.etd_from}-${shippingOption.etd_thru} days` },
  ];
}

/**
 * Build complete order payload
 */
export function buildOrderPayload(
  cartItems: CartItem[],
  formData: CheckoutFormData,
  shippingOption: ShippingOption,
  paymentMethod: string = 'bacs',
  uniqueCode?: number // Optional unique code parameter
): WCOrderPayload {
  const billing = transformFormToAddress(formData, true);
  const shipping = transformFormToAddress(formData, false);
  const lineItems = transformCartToLineItems(cartItems);
  const shippingLines = [createShippingLine(shippingOption)];
  const metaData = createJNEMetadata(formData, shippingOption);

  // Calculate subtotal for unique code generation
  const subtotal = cartItems.reduce((sum, item) => {
    const priceString = item.variation?.price || item.product.price || "0";
    const cleanPrice = parseInt(priceString.replace(/[^0-9]/g, '')) || 0;
    return sum + (cleanPrice * item.quantity);
  }, 0);
  
  const total = subtotal + shippingOption.price;
  
  // Generate unique code for BACS if not provided
  let finalUniqueCode = uniqueCode;
  if (paymentMethod === 'bacs' && !finalUniqueCode) {
    // Generate random 3-digit code (101-999) to ensure it's never 0
    finalUniqueCode = Math.floor(Math.random() * 899) + 101;
  }

  // Build payload
  const payload: WCOrderPayload = {
    payment_method: paymentMethod,
    payment_method_title: getPaymentMethodTitle(paymentMethod),
    set_paid: false,
    status: 'on-hold',
    billing,
    shipping,
    line_items: lineItems,
    shipping_lines: shippingLines,
    meta_data: metaData,
  };

  // Add unique code for BACS payments
  if (paymentMethod === 'bacs' && finalUniqueCode !== undefined) {
    // Calculate final total with unique code
    const finalTotal = total + finalUniqueCode;
    
    // Add unique code as a fee line
    payload.fee_lines = [
      {
        name: 'UNIQUE CODE',
        total: finalUniqueCode.toString(),
        tax_status: 'none',
      }
    ];

    // Add unique code and transfer amount to meta data
    payload.meta_data = [
      ...metaData,
      { key: '_unique_payment_code', value: finalUniqueCode.toString() },
      { key: '_transfer_amount', value: finalTotal.toString() },
    ];
  }

  return payload;
}

/**
 * Get human-readable payment method title
 */
function getPaymentMethodTitle(method: string): string {
  const titles: Record<string, string> = {
    'bacs': 'Direct Bank Transfer',
    'cod': 'Cash on Delivery',
    'cheque': 'Check Payment',
  };
  return titles[method] || method;
}

/**
 * Validate order payload before submission
 */
export function validateOrderPayload(payload: WCOrderPayload): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate billing address
  if (!payload.billing.first_name) errors.push('First name is required');
  if (!payload.billing.email) errors.push('Email is required');
  if (!payload.billing.phone) errors.push('Phone is required');
  if (!payload.billing.address_1) errors.push('Address is required');
  if (!payload.billing.city) errors.push('City is required');
  if (!payload.billing.postcode) errors.push('Postal code is required');

  // Validate line items
  if (!payload.line_items || payload.line_items.length === 0) {
    errors.push('Cart is empty');
  }

  // Validate shipping
  if (!payload.shipping_lines || payload.shipping_lines.length === 0) {
    errors.push('Shipping method is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
