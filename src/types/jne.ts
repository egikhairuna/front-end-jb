export interface JNEPriceItem {
  origin_name: string;
  destination_name: string;
  service_display: string;
  service_code: string;
  goods_type: string;
  currency: string;
  price: string;
  etd_from: string;
  etd_thru: string;
  times: string;
}

export interface JNESuccessResponse {
  price: JNEPriceItem[];
}

export interface JNEErrorResponse {
  error: string;
  status: boolean;
}

export type JNEResponse = JNESuccessResponse | JNEErrorResponse;

export interface JNEPriceRequest {
  from: string;
  thru: string;
  weight: number;
}
