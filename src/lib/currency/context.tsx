// src/lib/currency/context.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { formatPrice as formatPriceHelper, formatProductPriceRange as formatProductPriceRangeHelper } from './config';
import { toast } from 'sonner';

type Currency = 'IDR' | 'USD';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (amountIDR: number) => string;
  formatProductPriceRange: (priceStr: string | undefined | null) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({
  children,
  initialCurrency = 'IDR',
}: {
  children: React.ReactNode;
  initialCurrency?: Currency;
}) {
  const [currency, setCurrencyState] = useState<Currency>(initialCurrency);

  // Sync state with cookie on change
  const setCurrency = (next: Currency) => {
    setCurrencyState(next);
    if (typeof window !== 'undefined') {
      document.cookie = `preferred_currency=${next}; path=/; max-age=${90 * 24 * 60 * 60}; SameSite=Lax`;
      if (next === 'USD') {
        toast.success("Currency switched to USD ($)");
      } else {
        toast.success("Currency switched to IDR (Rp)");
      }
    }
  };

  // Helper bound to current currency
  const formatPrice = (amountIDR: number) => {
    return formatPriceHelper(amountIDR, currency);
  };

  const formatProductPriceRange = (priceStr: string | undefined | null) => {
    return formatProductPriceRangeHelper(priceStr, currency);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, formatProductPriceRange }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
