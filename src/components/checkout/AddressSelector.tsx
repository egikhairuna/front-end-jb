
'use client';

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Region {
  id: number;
  name: string;
  postal_code?: string;
  jne_code?: string;
}

interface AddressSelectorProps {
  onAddressChange: (address: {
    province: string;
    city: string;
    district: string;
    subdistrict: string;
    postalCode: string;
    jneDestinationCode: string;
  }) => void;
  disabled?: boolean;
}

export function AddressSelector({ onAddressChange, disabled }: AddressSelectorProps) {
  // State for data lists
  const [provinces, setProvinces] = useState<Region[]>([]);
  const [cities, setCities] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<Region[]>([]);
  const [subdistricts, setSubdistricts] = useState<Region[]>([]);

  // State for loading
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingSubdistricts, setLoadingSubdistricts] = useState(false);

  // State for selections (IDs)
  const [selectedProvId, setSelectedProvId] = useState<string>('');
  const [selectedCityId, setSelectedCityId] = useState<string>('');
  const [selectedDistId, setSelectedDistId] = useState<string>('');
  const [selectedSubId, setSelectedSubId] = useState<string>('');

  // Selected names for callback
  const [selectedNames, setSelectedNames] = useState({
    province: '',
    city: '',
    district: '',
    subdistrict: '',
    postalCode: '',
    jneDestinationCode: ''
  });

  // Load Provinces on mount
  useEffect(() => {
    fetch('/api/locations/provinces')
      .then(res => res.json())
      .then(data => setProvinces(data))
      .catch(err => console.error('Failed to load provinces:', err));
  }, []);

  // Handle Province Change
  const handleProvChange = async (provId: string) => {
    setSelectedProvId(provId);
    setSelectedCityId('');
    setSelectedDistId('');
    setSelectedSubId('');
    setCities([]);
    setDistricts([]);
    setSubdistricts([]);

    const prov = provinces.find(p => p.id.toString() === provId);
    const newNames = { ...selectedNames, province: prov?.name || '', city: '', district: '', subdistrict: '', postalCode: '', jneDestinationCode: '' };
    setSelectedNames(newNames);

    if (provId) {
      setLoadingCities(true);
      try {
        const res = await fetch(`/api/locations/cities?province_id=${provId}`);
        const data = await res.json();
        setCities(data);
      } catch (err) {
        console.error('Failed to load cities:', err);
      } finally {
        setLoadingCities(false);
      }
    }
  };

  // Handle City Change
  const handleCityChange = async (cityId: string) => {
    setSelectedCityId(cityId);
    setSelectedDistId('');
    setSelectedSubId('');
    setDistricts([]);
    setSubdistricts([]);

    const city = cities.find(c => c.id.toString() === cityId);
    const newNames = { ...selectedNames, city: city?.name || '', district: '', subdistrict: '', postalCode: '', jneDestinationCode: '' };
    setSelectedNames(newNames);

    if (cityId) {
      setLoadingDistricts(true);
      try {
        const res = await fetch(`/api/locations/districts?city_id=${cityId}`);
        const data = await res.json();
        setDistricts(data);
      } catch (err) {
        console.error('Failed to load districts:', err);
      } finally {
        setLoadingDistricts(false);
      }
    }
  };

  // Handle District Change
  const handleDistChange = async (distId: string) => {
    setSelectedDistId(distId);
    
    // Reset downstream data
    setSelectedSubId('');
    setSubdistricts([]);

    const dist = districts.find(d => d.id.toString() === distId);
    const newNames = { ...selectedNames, district: dist?.name || '', subdistrict: '', postalCode: '', jneDestinationCode: '' };
    setSelectedNames(newNames);

    if (distId) {
      setLoadingSubdistricts(true);
      try {
        const res = await fetch(`/api/locations/subdistricts?district_id=${distId}`);
        const data: Region[] = await res.json();
        setSubdistricts(data);

        // ⚡ AUTO-SELECT LOGIC (JNE Code & Zip only)
        // We pick the first subdistrict to get the JNE Code & Zip for calculation
        // But we DO NOT set the subdistrict name, as the user will type it manually.
        if (data.length > 0) {
          const firstSub = data[0];
          // We don't set selectedSubId since we aren't using a dropdown for it.
          
          const finalNames = {
            ...newNames,
            subdistrict: '', // Reset text input when district changes
            postalCode: firstSub.postal_code || '',
            jneDestinationCode: firstSub.jne_code || ''
          };
          setSelectedNames(finalNames);
          onAddressChange(finalNames);
        }

      } catch (err) {
        console.error('Failed to load subdistricts:', err);
      } finally {
        setLoadingSubdistricts(false);
      }
    }
  };

  // Skip handleSubChange as it's no longer manually triggered

  return (
    <div className="space-y-4">
      {/* Province */}
      <div className="space-y-2">
        <Label>Province / Provinsi</Label>
        <Select 
          value={selectedProvId} 
          onValueChange={handleProvChange} 
          disabled={disabled || provinces.length === 0}
        >
          <SelectTrigger className="w-full h-[40px]">
            <SelectValue placeholder="Select Province" />
          </SelectTrigger>
          <SelectContent>
            {provinces.map(p => (
              <SelectItem key={p.id} value={p.id.toString()}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* City */}
      <div className="space-y-2">
        <Label>City / Kota</Label>
        <Select 
          value={selectedCityId} 
          onValueChange={handleCityChange} 
          disabled={disabled || !selectedProvId || loadingCities}
        >
          <SelectTrigger className="w-full h-[40px]">
            <SelectValue placeholder={loadingCities ? "Loading..." : "Select City"} />
          </SelectTrigger>
          <SelectContent>
            {cities.map(c => (
              <SelectItem key={c.id} value={c.id.toString()}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* District */}
      <div className="space-y-2">
        <Label>District / Kecamatan</Label>
        <Select 
          value={selectedDistId} 
          onValueChange={handleDistChange} 
          disabled={disabled || !selectedCityId || loadingDistricts}
        >
          <SelectTrigger className="w-full h-[40px]">
            <SelectValue placeholder={loadingDistricts ? "Loading..." : "Select District"} />
          </SelectTrigger>
          <SelectContent>
            {districts.map(d => (
              <SelectItem key={d.id} value={d.id.toString()}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Manual Subdistrict Input */}
      <div className="space-y-2">
        <Label>Kelurahan / Desa / Sub-district</Label>
        <input
          type="text"
          className="w-full h-[40px] bg-white border border-gray-200 rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="Type your Kelurahan / Desa..."
          value={selectedNames.subdistrict}
          onChange={(e) => {
            const newVal = e.target.value;
            const updatedNames = { ...selectedNames, subdistrict: newVal };
            setSelectedNames(updatedNames);
            onAddressChange(updatedNames);
          }}
          disabled={disabled || !selectedDistId}
        />
      </div>

      {/* Subdistrict Selector REMOVED as per request - Auto-filled now */}

      {/* Postal Code Display */}
      {selectedNames.postalCode && (
        <div className="text-sm text-gray-500 mt-2">
          Postal Code: <strong>{selectedNames.postalCode}</strong>
        </div>
      )}
    </div>
  );
}
