'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useCartStore } from '@/lib/store/cart';
import { JNEPriceItem } from '@/types/jne';
import Image from 'next/image';
import Link from 'next/link';
import { CheckoutFormData, WCAddress } from '@/types/woocommerce';
import { AddressSelector } from './AddressSelector';
import { COUNTRIES } from '@/constants/countries';
import { InternationalShippingSelector } from './InternationalShippingSelector';
import { FormError } from '@/components/ui/FormError';
import { formatPrice } from '@/lib/currency/config';


interface ShippingOption {
  service: string;
  service_code?: string;
  description: string;
  price: number;
  etd_from: string;
  etd_thru: string;
}

interface CheckoutFormProps {
  savedAddresses?: {
    billing?: WCAddress;
    shipping?: WCAddress;
  };
}

const isPaymentAvailable = (countryName: string): boolean => {
  return countryName === 'Indonesia' || countryName === 'Malaysia';
};

export default function CheckoutPage({ savedAddresses }: CheckoutFormProps = {}) {
  const { items: cartItems, getCartTotal, getTotalWeight, clearCart } = useCartStore();
  const hasSavedAddress = !!(savedAddresses?.billing?.first_name || savedAddresses?.billing?.address_1);
  const [useSavedAddress, setUseSavedAddress] = useState(hasSavedAddress);

  const idempotencyKeyRef = useRef<string>('');

  useEffect(() => {
    idempotencyKeyRef.current = window.crypto.randomUUID();
  }, []);

  // Form state — pre-fill from saved address if available and user chooses to use it
  const getInitialFormData = (): CheckoutFormData => {
    const billing = savedAddresses?.billing;
    if (hasSavedAddress && billing) {
      const isIndonesia = billing.country === 'ID';
      const countryName = isIndonesia ? 'Indonesia' : (COUNTRIES.find(c => c.code === billing.country)?.name || 'Indonesia');
      return {
        firstName: billing.first_name || '',
        lastName: billing.last_name || '',
        phone: billing.phone || '',
        email: billing.email || '',
        address: billing.address_1 || '',
        country: countryName,
        province: isIndonesia ? (billing.state || '') : '',
        city: isIndonesia ? (billing.city || '') : '',
        district: '',
        subdistrict: isIndonesia ? (billing.address_2 || '') : '',
        postalCode: isIndonesia ? (billing.postcode || '') : '',
        jneDestinationCode: '',
        locationLabel: '',
        internationalCity: isIndonesia ? '' : (billing.city || ''),
        internationalPostalCode: isIndonesia ? '' : (billing.postcode || ''),
        internationalCountryCode: isIndonesia ? '' : (billing.country || ''),
        internationalShippingCountryId: '',
        internationalAddress2: isIndonesia ? '' : (billing.address_2 || ''),
        internationalState: isIndonesia ? '' : (billing.state || ''),
      };
    }
    return {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      address: '',
      country: 'Indonesia',
      province: '',
      city: '',
      district: '',
      subdistrict: '',
      postalCode: '',
      jneDestinationCode: '',
      locationLabel: '',
      internationalCity: '',
      internationalPostalCode: '',
      internationalCountryCode: '',
      internationalShippingCountryId: '',
      internationalAddress2: '',
      internationalState: '',
    };
  };

  const [formData, setFormData] = useState<CheckoutFormData>(getInitialFormData);

  // Calculate display currency locally based on checkout country
  const checkoutCurrency = isPaymentAvailable(formData.country || 'Indonesia') ? 'IDR' : 'USD';

  // Shipping state
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  
  // UI state
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // UI states for saved address JNE resolution
  const [resolvingSavedAddress, setResolvingSavedAddress] = useState(false);
  const [savedAddressResolveFailed, setSavedAddressResolveFailed] = useState(false);
  const [manualSearchQuery, setManualSearchQuery] = useState('');
  const [manualSearchResults, setManualSearchResults] = useState<any[]>([]);
  const [manualSearchLoading, setManualSearchLoading] = useState(false);

  const handleManualLocationSearch = async (query: string) => {
    setManualSearchQuery(query);
    if (query.trim().length < 3) {
      setManualSearchResults([]);
      return;
    }
    setManualSearchLoading(true);
    try {
      const res = await fetch(`/api/shipping/search?search=${encodeURIComponent(query)}`);
      const json = await res.json();
      if (json.data && Array.isArray(json.data)) {
        setManualSearchResults(json.data);
      } else {
        setManualSearchResults([]);
      }
    } catch (e) {
      console.error('Error searching manual JNE destination:', e);
    } finally {
      setManualSearchLoading(false);
    }
  };

  const handleSelectManualLocation = (result: any) => {
    setFormData(prev => ({
      ...prev,
      jneDestinationCode: result.id,
      locationLabel: result.label,
      province: result.detail.province,
      city: result.detail.city,
      district: result.detail.district,
      subdistrict: result.detail.subdistrict,
      postalCode: result.detail.zip || prev.postalCode,
    }));
    setSavedAddressResolveFailed(false);
    setManualSearchResults([]);
    setManualSearchQuery('');
  };

  // JNE Shipping Calculation
  const calculateShipping = useCallback(async () => {
    // Only calculate if we have the final JNE destination code
    if (!formData.jneDestinationCode) return;

    setLoadingShipping(true);
    setShippingOptions([]);
    setSelectedShipping(null); // Reset selection on new calculation
    setError(null);
    try {
      const weightGrams = getTotalWeight();
      const weightKg = Math.max(1, Math.ceil(weightGrams / 1000));
      
      const response = await fetch('/api/shipping/jne', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'BDO10000', // Origin fixed to Bandung (BDO10000)
          thru: formData.jneDestinationCode, 
          weight: weightKg
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      if (data.price && Array.isArray(data.price)) {
        // Services user wants to disable: JTR, SPS, and JTR variations
        const DISABLED_SERVICES = ['JTR', 'SPS', 'JTR<130', 'JTR>130', 'JTR>200', 'CTCSPS'];

        const mapped = data.price
          .filter((item: JNEPriceItem) => !DISABLED_SERVICES.includes(item.service_display))
          .map((item: JNEPriceItem) => ({
            service: item.service_display,
            service_code: item.service_code,
            description: `${item.goods_type} - ${item.service_display}`,
            price: parseInt(item.price),
            etd_from: item.etd_from,
            etd_thru: item.etd_thru
          }));
        setShippingOptions(mapped);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Shipping calculation failed';
      setError(msg);
      setShippingOptions([]);
    } finally {
      setLoadingShipping(false);
    }
  }, [formData.jneDestinationCode, getTotalWeight]);

  useEffect(() => {
    calculateShipping();
  }, [calculateShipping]);

  // Resolve JNE Destination Code for saved address automatically
  useEffect(() => {
    async function resolveSavedAddressCode() {
      if (!useSavedAddress || !savedAddresses?.billing) return;

      const billing = savedAddresses.billing;

      // If it is international, do not resolve JNE code
      if (billing.country !== 'ID') {
        const countryName = COUNTRIES.find(c => c.code === billing.country)?.name || billing.country;
        setFormData(prev => ({
          ...prev,
          country: countryName,
          locationLabel: [billing.city, billing.state, countryName].filter(Boolean).join(', '),
        }));
        setSavedAddressResolveFailed(false);
        return;
      }

      const searchPostcode = billing.postcode?.trim();
      const searchSubdistrict = billing.address_2?.trim();
      const searchCity = billing.city?.trim();

      if (!searchPostcode) {
        setSavedAddressResolveFailed(true);
        return;
      }

      setResolvingSavedAddress(true);
      setSavedAddressResolveFailed(false);
      setError(null);

      try {
        // Step 1: Search by postcode
        const res = await fetch(`/api/shipping/search?search=${encodeURIComponent(searchPostcode)}`);
        const json = await res.json();

        let resolved = false;

        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          // If we have search results, find the best match
          let bestMatch = json.data[0];

          // Try to match subdistrict / city / district
          if (json.data.length > 1) {
            const subdistrictLower = searchSubdistrict?.toLowerCase();
            const cityLower = searchCity?.toLowerCase();

            interface JNESearchItem {
              id: string;
              label: string;
              detail: {
                province: string;
                city: string;
                district: string;
                subdistrict: string;
                zip: string;
                code: string;
              };
            }

            const matchBySubdistrict = json.data.find((item: JNESearchItem) => 
              subdistrictLower && item.detail.subdistrict.toLowerCase().includes(subdistrictLower)
            );

            if (matchBySubdistrict) {
              bestMatch = matchBySubdistrict;
            } else {
              const matchByCity = json.data.find((item: JNESearchItem) => 
                cityLower && item.detail.city.toLowerCase().includes(cityLower)
              );
              if (matchByCity) {
                bestMatch = matchByCity;
              }
            }
          }

          console.log('✅ Resolved saved address JNE Destination Code:', bestMatch.id);

          setFormData(prev => ({
            ...prev,
            jneDestinationCode: bestMatch.id,
            locationLabel: bestMatch.label,
            province: bestMatch.detail.province,
            city: bestMatch.detail.city,
            district: bestMatch.detail.district,
            subdistrict: bestMatch.detail.subdistrict,
            postalCode: bestMatch.detail.zip || prev.postalCode,
          }));
          resolved = true;
        } else {
          // Fall back to searching by subdistrict/district name
          const fallbackSearch = searchSubdistrict || searchCity;
          if (fallbackSearch && fallbackSearch.length >= 3) {
            const fallbackRes = await fetch(`/api/shipping/search?search=${encodeURIComponent(fallbackSearch)}`);
            const fallbackJson = await fallbackRes.json();
            if (fallbackJson.data && Array.isArray(fallbackJson.data) && fallbackJson.data.length > 0) {
              const bestMatch = fallbackJson.data[0];
              console.log('✅ Resolved saved address JNE Destination Code (fallback):', bestMatch.id);
              setFormData(prev => ({
                ...prev,
                jneDestinationCode: bestMatch.id,
                locationLabel: bestMatch.label,
                province: bestMatch.detail.province,
                city: bestMatch.detail.city,
                district: bestMatch.detail.district,
                subdistrict: bestMatch.detail.subdistrict,
                postalCode: bestMatch.detail.zip || prev.postalCode,
              }));
              resolved = true;
            }
          }
        }

        if (!resolved) {
          setSavedAddressResolveFailed(true);
        }
      } catch (err) {
        console.error('Failed to resolve JNE destination code:', err);
        setSavedAddressResolveFailed(true);
      } finally {
        setResolvingSavedAddress(false);
      }
    }

    resolveSavedAddressCode();
  }, [useSavedAddress, savedAddresses]);

  const handleCountryChange = (selectedCountryName: string) => {
    const isDomestic = selectedCountryName === 'Indonesia';
    const matchedCountry = COUNTRIES.find(c => c.name === selectedCountryName);
    
    setFormData(prev => {
      if (isDomestic) {
        return {
          ...prev,
          country: selectedCountryName,
          internationalCity: '',
          internationalPostalCode: '',
          internationalCountryCode: '',
          internationalShippingCountryId: '',
          internationalAddress2: '',
          internationalState: '',
        };
      } else {
        return {
          ...prev,
          country: selectedCountryName,
          province: '',
          city: '',
          district: '',
          subdistrict: '',
          jneDestinationCode: '',
          locationLabel: '',
          internationalCountryCode: matchedCountry?.code || '',
          internationalAddress2: '',
          internationalState: '',
        };
      }
    });

    // Reset shipping options when country changes
    setShippingOptions([]);
    setSelectedShipping(null);
    setError(null);
  };

  // Totals - Restored
  const subtotal = getCartTotal();
  const shippingCost = selectedShipping?.price || 0;
  const total = subtotal + shippingCost;

  const handlePlaceOrder = async () => {
    if (!isPaymentAvailable(formData.country || 'Indonesia')) {
      setError('Payment is not available for the selected country.');
      return;
    }

    if (formData.country !== 'Indonesia') {
      if (!formData.internationalState?.trim()) {
        setError('State / Province is required for international shipping.');
        return;
      }
      if (!formData.internationalCity?.trim()) {
        setError('City is required for international shipping.');
        return;
      }
      if (!formData.internationalPostalCode?.trim()) {
        setError('Postal code is required for international shipping.');
        return;
      }
    }

    if (!selectedShipping) {
      setError('Please select a shipping method first.');
      return;
    }

    if (!agreedToTerms) {
      setError('Please agree to the terms and conditions.');
      return;
    }

    setLoadingOrder(true);
    setError(null);

    try {
      console.log('🚀 Creating order via REST API...');

      // Call Next.js API route to create order via WooCommerce REST API
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKeyRef.current,
        },
        body: JSON.stringify({
          cartItems,
          formData,
          shippingOption: selectedShipping,
          paymentMethod: 'bacs',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to create order');
      }

      if (data.success) {
        console.log('✅ Order created successfully:', data.order);

        // Clear local cart
        clearCart();

        // Redirect to payment gateway or success page
        if (data.order.paymentUrl) {
          window.location.href = data.order.paymentUrl;
        } else {
          window.location.href = `/order-success/${data.order.id}?key=${data.order.orderKey}`;
        }
      } else {
        throw new Error('Order creation failed');
      }
    } catch (err: unknown) {
      console.error('💥 Order Error:', err);
      const msg = err instanceof Error ? err.message : 'Failed to place order';
      setError(msg);
    } finally {
      setLoadingOrder(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <Link href="/shop" className="text-black underline">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#1a1a1a] font-sans selection:bg-black selection:text-white">
      <div className="mx-auto md:px-8 lg:px-0 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* LEFT COLUMN: CONTACT & ADDRESS */}
          <div className="space-y-10 border border-black/50 md:border-black p-8 -mx-4 md:mx-0">
            {/* Saved Address Toggle (only for logged-in users with saved addresses) */}
            {hasSavedAddress && (
              <div className="mb-6 p-4 bg-neutral-50 border border-black/10">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-5 w-5 border border-neutral-300 rounded-none accent-black cursor-pointer"
                    checked={useSavedAddress}
                    onChange={(e) => {
                      setUseSavedAddress(e.target.checked);
                      if (e.target.checked) {
                        setFormData(getInitialFormData());
                        setSavedAddressResolveFailed(false);
                        setManualSearchQuery('');
                        setManualSearchResults([]);
                      }
                    }}
                  />
                  <span className="text-xs font-bold uppercase tracking-wider">Use saved address</span>
                </label>
              </div>
            )}

            {useSavedAddress && savedAddresses?.billing ? (
              /* Display Saved Address Card */
              <section className="space-y-6">
                <h2 className="text-sm font-bold uppercase tracking-wider mb-6 border-b border-black pb-2">
                  Shipping Address
                </h2>
                {(() => {
                  const billing = savedAddresses.billing;
                  return (
                    <div className="p-6 border border-black bg-white space-y-4">
                      <div className="flex justify-between items-start">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                          Saved Address Details
                        </h3>
                        <span className="bg-black text-white text-[9px] font-bold px-2 py-0.5 uppercase tracking-widest">
                          Default
                        </span>
                      </div>
                      
                      <div className="space-y-3 text-sm text-neutral-800 font-sans">
                        <p className="font-bold text-base uppercase">
                          {billing.first_name} {billing.last_name}
                        </p>
                        <div className="space-y-1">
                          <p><span className="text-neutral-400 font-medium">PHONE:</span> {billing.phone}</p>
                          <p><span className="text-neutral-400 font-medium">EMAIL:</span> {billing.email}</p>
                        </div>
                        
                        <div className="pt-2 border-t border-neutral-100 space-y-1">
                          <p className="font-medium">{billing.address_1}</p>
                          {billing.address_2 && <p className="text-neutral-600">{billing.address_2}</p>}
                          <p className="text-neutral-600">
                            {[billing.city, billing.state, billing.postcode].filter(Boolean).join(', ')}
                          </p>
                          <p className="text-neutral-500 font-semibold text-xs tracking-wider uppercase mt-1">
                            {billing.country === 'ID' ? 'Indonesia' : (COUNTRIES.find(c => c.code === billing.country)?.name || billing.country)}
                          </p>
                        </div>
                      </div>

                      {formData.locationLabel ? (
                        <div className="mt-4 p-3 bg-neutral-50 border border-black/10 text-xs text-neutral-600 uppercase font-medium">
                          <p className="font-bold text-[9px] text-neutral-400">RESOLVED SHIPPING LOCATION:</p>
                          <p className="normal-case text-[13px] text-neutral-800 font-sans font-normal mt-1">{formData.locationLabel}</p>
                        </div>
                      ) : resolvingSavedAddress ? (
                        <div className="mt-4 p-3 bg-neutral-50 border border-black/10 text-xs text-neutral-400 font-medium uppercase tracking-wider animate-pulse">
                          Resolving shipping location details...
                        </div>
                      ) : savedAddressResolveFailed ? (
                        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-3">
                          <p className="font-bold uppercase tracking-wider">⚠️ Could not resolve shipping location automatically</p>
                          <p className="normal-case text-[13px] text-neutral-700 font-sans">
                            We couldn't automatically verify the JNE shipping code for your postcode (<strong>{billing.postcode}</strong>) or address. Please select your location manually below to calculate shipping, or uncheck "Use saved address" above.
                          </p>
                          
                          {/* Manual JNE Location Search Input */}
                          <div className="space-y-2 mt-2">
                            <label className="font-bold text-[9px] text-amber-900 uppercase tracking-wider block">
                              Search Shipping Location (District, City, or Subdistrict)
                            </label>
                            <input
                              type="text"
                              className="w-full bg-white border border-amber-300 p-3 text-sm text-neutral-800 focus:outline-none focus:ring-1 focus:ring-amber-500 rounded-none font-sans"
                              placeholder="Type at least 3 characters to search (e.g. Coblong, Bandung)..."
                              value={manualSearchQuery}
                              onChange={(e) => handleManualLocationSearch(e.target.value)}
                            />
                            {manualSearchLoading && (
                              <p className="text-[10px] italic text-amber-600 animate-pulse">Searching matching destinations...</p>
                            )}
                            
                            {manualSearchResults.length > 0 && (
                              <div className="border border-neutral-200 max-h-48 overflow-y-auto bg-white divide-y divide-neutral-100 mt-1 font-sans">
                                {manualSearchResults.map((result) => (
                                  <div
                                    key={result.id}
                                    onClick={() => handleSelectManualLocation(result)}
                                    className="p-3 hover:bg-neutral-50 cursor-pointer text-xs text-neutral-700 normal-case transition-colors"
                                  >
                                    {result.label}
                                  </div>
                                ))}
                              </div>
                            )}
                            {manualSearchQuery.trim().length >= 3 && !manualSearchLoading && manualSearchResults.length === 0 && (
                              <p className="text-[10px] text-neutral-500 italic">No locations found. Try searching with a different keyword.</p>
                            )}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })()}
              </section>
            ) : (
              /* Display Form Inputs */
              <>
                <section>
                  <h2 className="text-sm font-bold uppercase tracking-wider mb-6 border-b border-black pb-2">
                    Contact Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputGroup
                      label="First Name"
                      required
                      value={formData.firstName}
                      onChange={(v) => setFormData({ ...formData, firstName: v })}
                    />
                    <InputGroup
                      label="Last Name (Optional)"
                      value={formData.lastName}
                      onChange={(v) => setFormData({ ...formData, lastName: v })}
                    />
                    <InputGroup
                      label="Phone"
                      required
                      type="tel"
                      value={formData.phone}
                      onChange={(v) => setFormData({ ...formData, phone: v })}
                    />
                    <InputGroup
                      label="Email Address"
                      required
                      type="email"
                      value={formData.email}
                      onChange={(v) => setFormData({ ...formData, email: v })}
                    />
                  </div>
                </section>

                <section className="space-y-4">
                  <h2 className="text-sm font-bold uppercase tracking-wider mb-2 border-b border-black pb-2">
                    Shipping Details
                  </h2>
                  <SelectGroup
                    label="Country"
                    required
                    options={COUNTRIES.map((c) => ({ id: c.name, name: c.name }))}
                    value={formData.country}
                    onChange={(v) => handleCountryChange(v)}
                  />
                  
                  <div className="space-y-1">
                    <label className="text-sm font-semibold uppercase tracking-tighter">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      className="w-full bg-white border border-black p-3 text-sm focus:outline-none focus:ring-1 focus:ring-black min-h-[100px]"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Street address, unit, etc."
                    />
                  </div>

                  {formData.country === 'Indonesia' ? (
                    <>
                      {/* HIERARCHICAL ADDRESS SELECTOR */}
                      <div className="space-y-4 pt-2">
                        <div className="flex justify-between items-center pb-1 mb-2">
                          {loadingShipping && <span className="text-sm animate-pulse">UPDATING RATES...</span>}
                        </div>
                        
                        <AddressSelector 
                          onAddressChange={(addr) => {
                            setFormData(prev => ({
                              ...prev,
                              province: addr.province,
                              city: addr.city,
                              district: addr.district,
                              subdistrict: addr.subdistrict,
                              postalCode: addr.postalCode,
                              jneDestinationCode: addr.jneDestinationCode,
                              locationLabel: `${addr.subdistrict}, ${addr.district}, ${addr.city}, ${addr.province}`
                            }));
                          }}
                          disabled={loadingOrder}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      {/* INTERNATIONAL ADDRESS FIELDS (FREE TEXT) */}
                      <div className="space-y-4 pt-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InputGroup
                            label="Address Line 2 / District (Optional)"
                            value={formData.internationalAddress2 || ''}
                            onChange={(v) => setFormData({ ...formData, internationalAddress2: v })}
                            placeholder="e.g. Petaling Jaya"
                          />
                          <InputGroup
                            label="State / Province"
                            required
                            value={formData.internationalState || ''}
                            onChange={(v) => setFormData({ ...formData, internationalState: v })}
                            placeholder="e.g. Selangor"
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InputGroup
                            label="City"
                            required
                            value={formData.internationalCity || ''}
                            onChange={(v) => setFormData({ ...formData, internationalCity: v })}
                            placeholder="e.g. Tokyo"
                          />
                          <InputGroup
                            label="Postal Code"
                            required
                            value={formData.internationalPostalCode || ''}
                            onChange={(v) => setFormData({ ...formData, internationalPostalCode: v })}
                            placeholder="e.g. 100-0001"
                          />
                        </div>
                      </div>

                    </>
                  )}
                </section>
              </>
            )}

            {/* INTERNATIONAL SHIPPING SELECTOR */}
            <InternationalShippingSelector
              countryName={formData.country}
              weightGrams={getTotalWeight()}
              onShippingResolved={(option, countryId) => {
                setSelectedShipping(option);
                setFormData((prev) => ({
                  ...prev,
                  internationalShippingCountryId: countryId || '',
                }));
              }}
              disabled={loadingOrder}
              checkoutCurrency={checkoutCurrency}
            />

            {/* SHIPPING METHOD (IF CALCULATED) */}
            {loadingShipping && <div className="text-xs italic py-2">Calculating shipping rates...</div>}
            
            {shippingOptions.length > 0 && !loadingShipping && (
              <section>
                <h2 className="text-sm font-bold uppercase tracking-wider mb-4 mt-6 border-t border-black pt-4">
                  Shipping Method (JNE)
                </h2>
                <div className="space-y-2">
                  {shippingOptions.map((opt) => (
                    <div 
                      key={opt.service}
                      onClick={() => setSelectedShipping(opt)}
                      className={`flex items-center justify-between p-4 border cursor-pointer transition-colors ${
                        selectedShipping?.service === opt.service ? 'border-black bg-black/5' : 'border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border border-black flex items-center justify-center`}>
                          {selectedShipping?.service === opt.service && <div className="w-2 h-2 bg-black rounded-full" />}
                        </div>
                        <div>
                          <div className="text-sm font-bold">JNE {opt.service}</div>
                          <div className="text-xs text-gray-500">{opt.etd_from}-{opt.etd_thru} Days</div>
                        </div>
                      </div>
                      <div className="text-sm font-bold">
                        {formatPrice(opt.price, checkoutCurrency)}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* RIGHT COLUMN: ORDER SUMMARY */}
          <div className="lg:pl-8">
            <div className="sticky top-8 space-y-8 border border-black/50 md:border-black p-8 -mx-4 md:mx-0">
              <section>
                <h2 className="text-sm font-bold uppercase tracking-wider mb-6 py-4 border-b border-black ">
                  ORDER SUMMARY
                </h2>
                <div className="space-y-6">
                  {cartItems.map((item, idx) => {
                    const priceString = item.variation?.price || item.product.price || "0";
                    const cleanPrice = parseInt(priceString.replace(/[^0-9]/g, '')) || 0;
                    return (
                      <div key={idx} className="flex justify-between items-start text-sm">
                        <div>
                          <p className="font-bold uppercase">{item.product.name}</p>
                          <p className="text-gray-500 text-xs">
                            {item.variation ? (
                              <>
                                {item.variation.attributes?.nodes.length > 0 
                                  ? item.variation.attributes.nodes.map(attr => attr.value).join(', ')
                                  : item.variation.name.includes(' - ') 
                                    ? item.variation.name.split(' - ').slice(1).join(' - ')
                                    : item.variation.name
                                }
                              </>
                            ) : ''} × {item.quantity}
                          </p>
                        </div>
                        <p className="font-bold">{formatPrice(cleanPrice * item.quantity, checkoutCurrency)}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-8 pt-6 border-t border-black space-y-2 text-sm uppercase font-bold">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal, checkoutCurrency)}</span>
                  </div>
                  {selectedShipping && (
                    <div className="flex justify-between">
                      <span>Shipping ({formData.country === 'Indonesia' ? `JNE ${selectedShipping.service}` : 'JNE INTL'})</span>
                      <span>{formatPrice(shippingCost, checkoutCurrency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg pt-4">
                    <span>Total</span>
                    <span>{formatPrice(total, checkoutCurrency)}</span>
                  </div>
                </div>
                
              </section>

              <section>
                <h2 className="text-sm font-bold uppercase tracking-wider mb-6 border-b border-black pb-2">
                  Payment Method
                </h2>
                {!isPaymentAvailable(formData.country || 'Indonesia') ? (
                  <div className="bg-white border border-black p-6 rounded-sm">
                    <p className="text-sm font-bold text-red-700 uppercase tracking-wide">
                      Payment Option Unavailable
                    </p>
                    <p className="text-xs text-red-700 mt-2 font-sans font-medium uppercase leading-relaxed">
                      International card payment is currently being set up — please check back soon.
                    </p>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-100 p-6 rounded-sm shadow-sm">
                     <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                           <input type="radio" checked readOnly className="accent-black" />
                           <span className="text-sm font-bold uppercase">BCA - Bank Transfer</span>
                        </div>
                        <div className="pl-6">
                           <div className="mb-4">
                              <Image 
                                 src="/Bank_Central_Asia.svg" 
                                 alt="BCA" 
                                 width={7} 
                                 height={5} 
                                 className="h-6 w-auto"
                              />
                           </div>
                        </div>
                     </div>
                  </div>
                )}
              </section>

              <div className="space-y-6">
                <p className="text-[12px] text-gray-500 leading-relaxed uppercase">
                  Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our <span className="underline cursor-pointer">privacy policy</span>.
                </p>
                
                <label className="flex items-start gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="mt-1 accent-black"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                   />
                  <span className="text-[12px] uppercase font-normal tracking-tight">
                    I have read and agree to the website <span className="text-red-500">terms and conditions</span> *
                  </span>
                </label>

                <FormError message={error} />

                <button
                  disabled={!agreedToTerms || !selectedShipping || loadingOrder || !isPaymentAvailable(formData.country || 'Indonesia')}
                  onClick={handlePlaceOrder}
                  className="w-full bg-black text-white cursor-pointer border border-black py-4 uppercase font-bold text-sm tracking-widest hover:bg-black hover:text-white transition-all disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-black"
                >
                  {loadingOrder ? 'Processing...' : 'Place Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InputGroup({ label, required, value, onChange, type = 'text', placeholder }: { label: string, required?: boolean, value: string, onChange: (v: string) => void, type?: string, placeholder?: string }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-semibold uppercase tracking-tighter">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        className="w-full bg-[#F3F3F3] border border-gray-300 p-3 text-sm focus:outline-none focus:bg-white focus:border-black transition-colors"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

interface Location { id: string; name: string; }
function SelectGroup({ label, required, options, value, onChange, disabled, placeholder }: { label: string, required?: boolean, options: Location[], value: string, onChange: (v: string) => void, disabled?: boolean, placeholder?: string }) {
  return (
    <div className="space-y-1 flex-1">
      <label className="text-sm font-semibold uppercase tracking-tighter">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        className="w-full bg-white border border-black p-3 text-sm focus:outline-none appearance-none disabled:bg-gray-50 disabled:border-gray-200"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='black'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 1rem center',
          backgroundSize: '1rem'
        }}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.name}
          </option>
        ))}
      </select>
    </div>
  );
}