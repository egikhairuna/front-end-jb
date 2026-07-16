// src/lib/currency/config.ts

const DEFAULT_RATE = 10000;

export function getExchangeRate(): number {
  const rateEnv = process.env.NEXT_PUBLIC_IDR_TO_USD_RATE;
  if (!rateEnv) return DEFAULT_RATE;
  const parsed = parseFloat(rateEnv);
  return isNaN(parsed) || parsed <= 0 ? DEFAULT_RATE : parsed;
}

export function convertIDRtoUSD(amountIDR: number): number {
  const rate = getExchangeRate();
  return amountIDR / rate;
}

export function formatPrice(amountIDR: number, currency: 'IDR' | 'USD'): string {
  if (currency === 'USD') {
    const amountUSD = convertIDRtoUSD(amountIDR);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amountUSD);
  }

  // Default to IDR formatting
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amountIDR);
}

export function parsePriceString(priceStr: string | number): number {
  if (typeof priceStr === 'number') return priceStr;
  if (!priceStr) return 0;
  const cleaned = priceStr.replace(/[^0-9]/g, '');
  return parseInt(cleaned, 10) || 0;
}

export function formatProductPriceRange(priceStr: string | undefined | null, currency: 'IDR' | 'USD'): string {
  if (!priceStr) return formatPrice(0, currency);
  if (priceStr.includes(' - ')) {
    const parts = priceStr.split(' - ');
    const formattedParts = parts.map(p => formatPrice(parsePriceString(p), currency));
    return formattedParts.join(' - ');
  }
  return formatPrice(parsePriceString(priceStr), currency);
}
