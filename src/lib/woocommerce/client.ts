import { WCOrderPayload, WCOrderResponse, WCErrorResponse } from '@/types/woocommerce';

class WooCommerceClient {
  private baseUrl: string;
  private consumerKey: string;
  private consumerSecret: string;

  constructor() {
    this.baseUrl = process.env.WOOCOMMERCE_API_URL || '';
    this.consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY || '';
    this.consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET || '';

    if (!this.baseUrl || !this.consumerKey || !this.consumerSecret) {
      throw new Error('WooCommerce API credentials are not configured');
    }
  }

  /**
   * Generate Basic Auth header for WooCommerce REST API
   */
  private getAuthHeader(): string {
    const credentials = Buffer.from(
      `${this.consumerKey}:${this.consumerSecret}`
    ).toString('base64');
    return `Basic ${credentials}`;
  }

  /**
   * Make authenticated request to WooCommerce REST API
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.getAuthHeader(),
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      const error = data as WCErrorResponse;
      console.error('WooCommerce API Error:', {
        status: response.status,
        code: error.code,
        message: error.message,
        endpoint,
      });
      throw new Error(error.message || 'WooCommerce API request failed');
    }

    return data as T;
  }

  /**
   * Create a new order
   */
  async createOrder(payload: WCOrderPayload): Promise<WCOrderResponse> {
    try {
      // 🔒 SECURITY: Log only metadata, never PII (names, addresses, phone numbers)
      const sanitizedPayload = {
        item_count: payload.line_items?.length,
        payment_method: payload.payment_method,
        has_shipping: !!payload.shipping_lines?.length
      };
      
      console.log('📦 Creating WooCommerce order via REST API...', sanitizedPayload);

      const order = await this.request<WCOrderResponse>('/orders', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      console.log('✅ Order created successfully:', {
        id: order.id,
        number: order.number,
        status: order.status,
        total: order.total,
      });

      return order;
    } catch (error) {
      console.error('💥 Order creation failed:', error);
      throw error;
    }
  }

  /**
   * Get order by ID
   */
  async getOrder(orderId: number): Promise<WCOrderResponse> {
    return this.request<WCOrderResponse>(`/orders/${orderId}`);
  }

  /**
   * Update order status
   */
  async updateOrderStatus(
    orderId: number,
    status: 'pending' | 'processing' | 'on-hold' | 'completed' | 'cancelled' | 'refunded' | 'failed'
  ): Promise<WCOrderResponse> {
    return this.request<WCOrderResponse>(`/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  /**
   * Get product details (Used for price validation)
   */
  async getProduct(productId: number): Promise<any> {
    return this.request<any>(`/products/${productId}`);
  }

  /**
   * Get product variation details (Used for price validation)
   */
  async getVariation(productId: number, variationId: number): Promise<any> {
    return this.request<any>(`/products/${productId}/variations/${variationId}`);
  }

  // ============================================
  // Customer Methods
  // ============================================

  /**
   * Create a new WooCommerce customer
   * 🔒 SECURITY: Log only non-PII metadata
   */
  async createCustomer(data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    username?: string;
    billing?: {
      first_name?: string;
      last_name?: string;
      email?: string;
      phone?: string;
    };
    meta_data?: Array<{ key: string; value: any }>;
  }): Promise<any> {
    console.log('👤 Creating WooCommerce customer...');
    
    try {
      const customer = await this.request<any>('/customers', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      console.log('✅ Customer created:', { id: customer.id, role: customer.role });
      return customer;
    } catch (error) {
      console.error('💥 Customer creation failed:', error instanceof Error ? error.message : error);
      throw error;
    }
  }

  /**
   * Get a customer by ID
   */
  async getCustomer(customerId: number): Promise<any> {
    return this.request<any>(`/customers/${customerId}`);
  }

  /**
   * Update a customer by ID
   * 🔒 SECURITY: Log only non-PII metadata
   */
  async updateCustomer(customerId: number, data: Record<string, any>): Promise<any> {
    console.log('✏️ Updating WooCommerce customer:', { id: customerId, fields: Object.keys(data) });
    
    try {
      const customer = await this.request<any>(`/customers/${customerId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });

      console.log('✅ Customer updated:', { id: customer.id });
      return customer;
    } catch (error) {
      console.error('💥 Customer update failed:', error instanceof Error ? error.message : error);
      throw error;
    }
  }

  /**
   * Get orders for a specific customer, paginated
   */
  async getCustomerOrders(
    customerId: number,
    page: number = 1,
    perPage: number = 10
  ): Promise<{ orders: any[]; totalPages: number; total: number }> {
    const endpoint = `/orders?customer=${customerId}&page=${page}&per_page=${perPage}&orderby=date&order=desc`;
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.getAuthHeader(),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch orders');
    }

    return {
      orders: data,
      totalPages: parseInt(response.headers.get('X-WP-TotalPages') || '1', 10),
      total: parseInt(response.headers.get('X-WP-Total') || '0', 10),
    };
  }
}

let instance: WooCommerceClient | null = null;

/**
 * Factory function to get or create the WooCommerce client instance.
 * Performs environment variable validation at runtime.
 */
export function getWooCommerceClient(): WooCommerceClient {
  const url = process.env.WOOCOMMERCE_API_URL;
  const key = process.env.WOOCOMMERCE_CONSUMER_KEY;
  const secret = process.env.WOOCOMMERCE_CONSUMER_SECRET;

  if (!url || !key || !secret) {
    throw new Error('WooCommerce API credentials are not configured');
  }

  if (!instance) {
    instance = new WooCommerceClient();
  }
  return instance;
}
