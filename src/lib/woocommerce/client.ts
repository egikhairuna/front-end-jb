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
}

// Export singleton instance
export const wooCommerceClient = new WooCommerceClient();
