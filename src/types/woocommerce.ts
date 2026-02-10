
export interface ProductImage {
  sourceUrl: string;
  altText: string;
}

export interface ProductAttribute {
  name: string;
  value: string;
}

export interface ProductVariation {
  id: string;
  databaseId: number;
  name: string;
  price: string;
  stockStatus: string;
  stockQuantity: number | null;
  attributes: {
    nodes: ProductAttribute[];
  };
}

export interface Product {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  shortDescription: string;
  description?: string;
  image: ProductImage;
  price?: string;
  rawPrice?: string; // custom field if needed or mapped
  regularPrice?: string;
  stockStatus?: string;
  stockQuantity?: number | null;
  weight?: string | number;
  galleryImages?: {
    nodes: ProductImage[];
  };
  variations?: {
    nodes: ProductVariation[];
  };
  features?: { features: string } | null;
  sizeChart?: { sizeChart: string } | null;
}

export interface CartItem {
  product: Product;
  quantity: number;
  variation?: ProductVariation;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, quantity: number, variation?: ProductVariation) => void;
  removeItem: (productId: string, variationId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variationId?: string) => void;
  clearCart: () => void;
  toggleCart: () => void;
  getCartTotal: () => number;
  getTotalWeight: () => number;
  shippingFee: number;
  setShippingFee: (fee: number) => void;
  selectedShipping: any;
  setSelectedShipping: (shipping: any) => void;
}

// ============================================
// WooCommerce REST API Types
// ============================================

export interface WCAddress {
  first_name: string;
  last_name: string;
  address_1: string;
  address_2?: string;
  city: string;
  state?: string;
  postcode: string;
  country: string;
  email?: string;
  phone?: string;
}

export interface WCLineItem {
  product_id: number;
  variation_id?: number;
  quantity: number;
  name?: string;
  price?: string;
}

export interface WCShippingLine {
  method_id: string;
  method_title: string;
  total: string;
}

export interface WCMetaData {
  key: string;
  value: string;
}

export interface WCFeeLine {
  name: string;
  total: string;
  tax_status?: string;
}

export interface WCOrderPayload {
  payment_method: string;
  payment_method_title: string;
  set_paid: boolean;
  status?: string;
  billing: WCAddress;
  shipping: WCAddress;
  line_items: WCLineItem[];
  shipping_lines: WCShippingLine[];
  fee_lines?: WCFeeLine[];
  meta_data?: WCMetaData[];
  customer_note?: string;
}

export interface WCOrderResponse {
  id: number;
  order_key: string;
  number: string;
  status: string;
  currency: string;
  total: string;
  shipping_total: string;
  date_created: string;
  payment_url?: string;
  billing: WCAddress;
  shipping: WCAddress;
  line_items: Array<{
    id: number;
    name: string;
    product_id: number;
    quantity: number;
    total: string;
  }>;
  shipping_lines: WCShippingLine[];
  fee_lines: any[];
  meta_data: WCMetaData[];
}

export interface WCErrorResponse {
  code: string;
  message: string;
  data?: {
    status: number;
    params?: Record<string, string>;
  };
}

export interface CheckoutFormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  country: string;
  
  // Hierarchical Address
  province: string;
  city: string;
  district: string;
  subdistrict: string;
  
  // Shipping & Location
  postalCode: string; // Replaces zipCode
  jneDestinationCode: string; // Replaces districtId (JNE Tariff Code)
  
  locationLabel?: string; // Optional: Full formatted address string for display
}

export interface ShippingOption {
  service: string;
  description: string;
  price: number;
  etd_from: string;
  etd_thru: string;
}

