'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { AddressSelector } from '@/components/checkout/AddressSelector';
import { COUNTRIES } from '@/constants/countries';
import { FormError } from '@/components/ui/FormError';

interface AddressData {
  first_name: string;
  last_name: string;
  address_1: string;
  address_2: string; // subdistrict (Kelurahan)
  city: string;
  state: string; // province
  postcode: string;
  country: string;
  email: string;
  phone: string;
}

const emptyAddress: AddressData = {
  first_name: '',
  last_name: '',
  address_1: '',
  address_2: '',
  city: '',
  state: '',
  postcode: '',
  country: 'Indonesia',
  email: '',
  phone: '',
};

export default function AddressesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [addressData, setAddressData] = useState<AddressData>(emptyAddress);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch saved address
  useEffect(() => {
    async function fetchAddress() {
      try {
        const response = await fetch('/api/account/addresses', {
          credentials: 'same-origin',
        });
        if (response.status === 401) {
          window.location.href = '/account/login?expired=true';
          return;
        }
        if (response.ok) {
          const data = await response.json();
          // Normalize country code (e.g. 'ID' to 'Indonesia')
          const rawAddress = data.address || {};
          let normalizedCountry = rawAddress.country || 'Indonesia';
          if (normalizedCountry === 'ID') {
            normalizedCountry = 'Indonesia';
          } else {
            const matched = COUNTRIES.find(c => c.code === normalizedCountry);
            if (matched) normalizedCountry = matched.name;
          }

          setAddressData({
            ...emptyAddress,
            ...rawAddress,
            country: normalizedCountry,
          });
        }
      } catch {
        toast.error('Failed to load address');
      } finally {
        setIsLoading(false);
      }
    }
    fetchAddress();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-6 bg-neutral-100 animate-pulse w-32" />
        <div className="h-48 bg-neutral-100 animate-pulse border border-black/5" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-lg">
      <div className="flex items-center justify-between pb-2 border-b border-black">
        <h2 className="text-lg font-bold uppercase tracking-wider">
          Saved Address
        </h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-black transition-colors cursor-pointer"
        >
          {isEditing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      {isEditing ? (
        <AddressForm
          initialData={addressData}
          onSaved={(data) => {
            setAddressData(data);
            setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <AddressDisplay address={addressData} />
      )}
    </div>
  );
}

function AddressDisplay({ address }: { address: AddressData }) {
  const isEmpty = !address.first_name && !address.address_1 && !address.city;
  const [resolvedLocation, setResolvedLocation] = useState<string | null>(null);

  useEffect(() => {
    async function resolveLocation() {
      if (!address.postcode) return;
      try {
        const searchPostcode = address.postcode.trim();
        const res = await fetch(`/api/shipping/search?search=${encodeURIComponent(searchPostcode)}`);
        const json = await res.json();
        
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          let bestMatch = json.data[0];
          
          if (json.data.length > 1 && address.address_2) {
            const subdistrictLower = address.address_2.toLowerCase();
            const matched = json.data.find((item: { detail: { subdistrict: string } }) => 
              item.detail.subdistrict.toLowerCase().includes(subdistrictLower)
            );
            if (matched) bestMatch = matched;
          }
          
          const detail = bestMatch.detail;
          const label = `${detail.province}, ${detail.city}, ${detail.district}, ${detail.subdistrict} (${detail.zip})`.toUpperCase();
          setResolvedLocation(label);
        } else {
          // Fallback formatting
          const fallback = `${address.state}, ${address.city}, ${address.address_2} (${address.postcode})`.toUpperCase();
          setResolvedLocation(fallback);
        }
      } catch {
        const fallback = `${address.state}, ${address.city}, ${address.address_2} (${address.postcode})`.toUpperCase();
        setResolvedLocation(fallback);
      }
    }
    resolveLocation();
  }, [address]);

  if (isEmpty) {
    return (
      <div className="border border-dashed border-black/10 p-8 text-center bg-neutral-50/50">
        <p className="text-sm text-neutral-400">No address saved yet</p>
      </div>
    );
  }

  return (
    <div className="border border-black p-6 space-y-4 bg-white relative font-sans">
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
          {address.first_name} {address.last_name}
        </p>
        <div className="space-y-1">
          <p><span className="text-neutral-400 font-medium">PHONE:</span> {address.phone}</p>
          <p><span className="text-neutral-400 font-medium">EMAIL:</span> {address.email}</p>
        </div>
        
        <div className="pt-4 border-t border-neutral-100 space-y-1">
          <p className="font-medium uppercase">{address.address_1}</p>
          {address.address_2 && <p className="text-neutral-600 uppercase">{address.address_2}</p>}
          <p className="text-neutral-600 uppercase">
            {[address.city, address.state, address.postcode].filter(Boolean).join(', ')}
          </p>
          <p className="text-neutral-500 font-semibold text-xs tracking-wider uppercase mt-1">
            {address.country}
          </p>
        </div>
      </div>

      {resolvedLocation ? (
        <div className="mt-4 p-3 bg-neutral-50 border border-black/10 text-xs text-neutral-600 uppercase font-medium">
          <p className="font-bold text-[9px] text-neutral-400">Resolved Shipping Location:</p>
          <p className="text-[12px] text-neutral-800 font-sans font-normal mt-1 tracking-wide uppercase leading-relaxed">
            {resolvedLocation}
          </p>
        </div>
      ) : (
        <div className="mt-4 p-3 bg-neutral-50 border border-black/10 text-xs text-neutral-400 font-medium uppercase tracking-wider animate-pulse">
          Resolving shipping location details...
        </div>
      )}
    </div>
  );
}

function AddressForm({
  initialData,
  onSaved,
  onCancel,
}: {
  initialData: AddressData;
  onSaved: (data: AddressData) => void;
  onCancel: () => void;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<AddressData>(initialData);
  const [formError, setFormError] = useState<string | null>(null);

  const handleCountryChange = (selectedCountryName: string) => {
    setFormData(prev => ({
      ...prev,
      country: selectedCountryName,
      state: '',
      city: '',
      address_2: '',
      postcode: '',
    }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.first_name.trim()) {
      setFormError('First name is required');
      return;
    }
    if (!formData.address_1.trim()) {
      setFormError('Address is required');
      return;
    }
    if (!formData.phone.trim()) {
      setFormError('Phone number is required');
      return;
    }

    if (formData.country === 'Indonesia') {
      if (!formData.state.trim() || !formData.city.trim()) {
        setFormError('Province and City are required');
        return;
      }
    } else {
      if (!formData.city.trim()) {
        setFormError('City is required');
        return;
      }
    }

    setIsSaving(true);
    try {
      // Map Country Name back to country code for WooCommerce database
      let dbCountry = formData.country;
      if (formData.country === 'Indonesia') {
        dbCountry = 'ID';
      } else {
        const matched = COUNTRIES.find(c => c.name === formData.country);
        if (matched) dbCountry = matched.code;
      }

      const payload = {
        ...formData,
        country: dbCountry,
      };

      const response = await fetch('/api/account/addresses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'same-origin',
      });

      if (response.status === 401) {
        window.location.href = '/account/login?expired=true';
        return;
      }

      const result = await response.json();

      if (!response.ok) {
        setFormError(result.error || 'Failed to update address');
        return;
      }

      // Normalize return code back to name for display
      let normalizedCountry = result.address?.country || 'Indonesia';
      if (normalizedCountry === 'ID') {
        normalizedCountry = 'Indonesia';
      } else {
        const matched = COUNTRIES.find(c => c.code === normalizedCountry);
        if (matched) normalizedCountry = matched.name;
      }

      onSaved({
        ...emptyAddress,
        ...result.address,
        country: normalizedCountry,
      });
      toast.success('Address updated successfully');
    } catch {
      setFormError('An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="border border-black/10 p-6 space-y-4 bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputGroup
          label="First Name"
          required
          value={formData.first_name}
          onChange={(v) => setFormData({ ...formData, first_name: v })}
        />
        <InputGroup
          label="Last Name (Optional)"
          value={formData.last_name}
          onChange={(v) => setFormData({ ...formData, last_name: v })}
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-semibold uppercase tracking-tighter">
          Address <span className="text-red-500">*</span>
        </label>
        <textarea
          className="w-full bg-[#F3F3F3] border border-gray-300 p-3 text-sm focus:outline-none focus:bg-white focus:border-black transition-colors min-h-[100px]"
          value={formData.address_1}
          onChange={(e) => setFormData({ ...formData, address_1: e.target.value })}
          placeholder="Street address, unit, etc."
        />
      </div>

      <SelectGroup
        label="Country"
        required
        options={COUNTRIES.map((c) => ({ id: c.name, name: c.name }))}
        value={formData.country}
        onChange={(v) => handleCountryChange(v)}
      />

      {formData.country === 'Indonesia' ? (
        <>
          {/* Saved Region Display Reference */}
          {initialData.state && initialData.city && (
            <div className="p-3 bg-neutral-50 border border-black/5 text-[11px] text-neutral-500 uppercase tracking-tight leading-relaxed">
              📍 Current Location: <strong className="text-neutral-800">{initialData.state}, {initialData.city}</strong>
              <p className="normal-case text-[10px] text-neutral-400 mt-0.5">Leave the selector below untouched to keep this location.</p>
            </div>
          )}

          {/* Hierarchical Selector */}
          <div className="space-y-2 pt-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Select New Region / City
            </label>
            <AddressSelector
              onAddressChange={(addr) => {
                setFormData(prev => ({
                  ...prev,
                  state: addr.province,
                  city: addr.city,
                  postcode: addr.postalCode,
                  address_2: addr.subdistrict, // Update subdistrict (Kelurahan) automatically
                }));
              }}
              initialProvince={initialData.state}
              initialCity={initialData.city}
              initialSubdistrict={initialData.address_2}
              initialPostalCode={initialData.postcode}
            />
          </div>

        </>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputGroup
              label="City"
              required
              value={formData.city}
              onChange={(v) => setFormData({ ...formData, city: v })}
            />
            <InputGroup
              label="State / Province"
              value={formData.state}
              onChange={(v) => setFormData({ ...formData, state: v })}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputGroup
              label="Postal Code / Zip"
              required
              value={formData.postcode}
              onChange={(v) => setFormData({ ...formData, postcode: v })}
            />
            <InputGroup
              label="Address Line 2 (Optional)"
              value={formData.address_2}
              onChange={(v) => setFormData({ ...formData, address_2: v })}
            />
          </div>
        </>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-semibold uppercase tracking-tighter text-neutral-400">
            Email Address
          </label>
          <input
            type="email"
            className="w-full bg-gray-100 border border-gray-300 p-3 text-sm text-gray-500 focus:outline-none cursor-not-allowed"
            value={formData.email}
            readOnly
          />
        </div>
        <InputGroup
          label="Phone"
          required
          type="tel"
          value={formData.phone}
          onChange={(v) => setFormData({ ...formData, phone: v })}
        />
      </div>

      <FormError message={formError} />

      <div className="flex gap-4 pt-4 border-t border-black/5">
        <button
          type="submit"
          disabled={isSaving}
          className="flex-1 bg-black text-white border border-black py-4 uppercase font-bold text-xs tracking-widest hover:bg-white hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSaving ? 'Saving...' : 'Save Address'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-8 py-4 border border-black/20 text-xs font-bold uppercase tracking-wider text-neutral-500 hover:border-black hover:text-black transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function InputGroup({
  label,
  required,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
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

function SelectGroup({
  label,
  required,
  options,
  value,
  onChange,
  disabled,
  placeholder,
}: {
  label: string;
  required?: boolean;
  options: { id: string; name: string }[];
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1 flex-1">
      <label className="text-sm font-semibold uppercase tracking-tighter">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        className="w-full bg-[#F3F3F3] border border-gray-300 p-3 text-sm focus:outline-none focus:bg-white focus:border-black transition-colors appearance-none disabled:opacity-50"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='black'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 1rem center',
          backgroundSize: '1rem',
        }}
      >
        <option value="" disabled>
          {placeholder || 'Select Country'}
        </option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.name}
          </option>
        ))}
      </select>
    </div>
  );
}
