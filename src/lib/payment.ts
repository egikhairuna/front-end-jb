/**
 * Helper to determine if a destination country uses domestic payment (BACS manual transfer)
 * or international payment (DOKU Credit / Debit Card).
 *
 * Indonesia and Malaysia use domestic manual bank transfer (BACS).
 * All other countries use DOKU Card payment.
 */
export function isDomesticPaymentCountry(countryName?: string | null): boolean {
  if (!countryName) return true;
  const normalized = countryName.trim().toLowerCase();
  return normalized === 'indonesia' || normalized === 'malaysia' || normalized === 'id' || normalized === 'my';
}

export type PaymentMethodCode = 'bacs' | 'doku_card';

export function getPaymentMethodForCountry(countryName?: string | null): PaymentMethodCode {
  return isDomesticPaymentCountry(countryName) ? 'bacs' : 'doku_card';
}
