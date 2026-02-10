'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useCartStore } from '@/lib/store/cart';
import { JNEPriceItem } from '@/types/jne';
import Image from 'next/image';
import Link from 'next/link';
import { CheckoutFormData } from '@/types/woocommerce';
import { AddressSelector } from './AddressSelector';

interface ShippingOption {
  service: string;
  description: string;
  price: number;
  etd_from: string;
  etd_thru: string;
}

export default function CheckoutPage() {
  const { items: cartItems, getCartTotal, getTotalWeight, clearCart } = useCartStore();

  // Form state
  const [formData, setFormData] = useState<CheckoutFormData>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    country: 'Indonesia',
    
    // Hierarchical Address
    province: '',
    city: '',
    district: '',
    subdistrict: '',
    
    // JNE & Postal
    postalCode: '',
    jneDestinationCode: '',
    
    locationLabel: ''
  });

  // Shipping state
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  
  // UI state
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

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
            description: `${item.goods_type} - ${item.service_display}`,
            price: parseInt(item.price),
            etd_from: item.etd_from,
            etd_thru: item.etd_thru
          }));
        setShippingOptions(mapped);
      }
    } catch (err: any) {
      setError(err.message || 'Shipping calculation failed');
      setShippingOptions([]);
    } finally {
      setLoadingShipping(false);
    }
  }, [formData.jneDestinationCode, getTotalWeight]);

  useEffect(() => {
    calculateShipping();
  }, [calculateShipping]);

  // Totals - Restored
  const subtotal = getCartTotal();
  const shippingCost = selectedShipping?.price || 0;
  const totalWeightKg = Math.ceil(getTotalWeight() / 1000);
  const total = subtotal + shippingCost;

  const handlePlaceOrder = async () => {
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
        throw new Error(data.error || 'Failed to create order');
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
          <div className="space-y-10 border w-full border-black p-8">
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
              <SelectGroup
                label="Country"
                required
                options={[{ id: 'Indonesia', name: 'Indonesia' }]}
                value={formData.country}
                onChange={(v) => setFormData({ ...formData, country: v })}
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

              {/* AUTOMATIC ZIP CODE (READ ONLY) */}
              <div className="">
                <div className="space-y-1">
                  <label className="text-sm font-semibold uppercase tracking-tighter">
                    Zip Code (Auto)
                  </label>
                  <input
                    type="text"
                    className="w-full bg-gray-100 border border-gray-300 p-3 text-sm text-gray-500 focus:outline-none cursor-not-allowed"
                    value={formData.postalCode}
                    readOnly
                    placeholder="Auto-filled"
                  />
                </div>
              </div>

              <div className="w-1/2">
                {/* Legacy Zip Code Input Removed in favor of auto-filled one above */}
              </div>
            </section>

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
                        Rp {opt.price.toLocaleString('id-ID')}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
            
            {error && <div className="text-xs text-red-500 mt-2">{error}</div>}
          </div>

          {/* RIGHT COLUMN: ORDER SUMMARY */}
          <div className="lg:pl-8">
            <div className="sticky top-8 space-y-8 border border-black p-8">
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
                        <p className="font-bold">Rp {(cleanPrice * item.quantity).toLocaleString('id-ID')}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-8 pt-6 border-t border-black space-y-2 text-sm uppercase font-bold">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  {selectedShipping && (
                    <div className="flex justify-between">
                      <span>Shipping (JNE {selectedShipping.service})</span>
                      <span>Rp {shippingCost.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg pt-4">
                    <span>Total</span>
                    <span>Rp {total.toLocaleString('id-ID')}</span>
                  </div>
                </div>
                
              </section>

              <section>
                <h2 className="text-sm font-bold uppercase tracking-wider mb-6 border-b border-black pb-2">
                  Payment Method
                </h2>
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

                <button
                  disabled={!agreedToTerms || !selectedShipping || loadingOrder}
                  onClick={handlePlaceOrder}
                  className="w-full bg-black text-white border border-black py-4 uppercase font-bold text-sm tracking-widest hover:bg-black hover:text-white transition-all disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-black"
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