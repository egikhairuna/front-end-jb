
export interface RajaOngkirProvince {
  province_id: string;
  province: string;
}

export interface RajaOngkirCity {
  city_id: string;
  province_id: string;
  province: string;
  type: string;
  city_name: string;
  postal_code: string;
}

export interface RajaOngkirCost {
  service: string;
  description: string;
  cost: Array<{
    value: number;
    etd: string;
    note: string;
  }>;
}

export interface ShippingOption {
  service: string;
  description: string;
  cost: number;
  etd: string;
}

export interface RajaOngkirResponse<T> {
  rajaongkir: {
    query: any;
    status: {
      code: number;
      description: string;
    };
    results: T;
  };
}
