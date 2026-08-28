
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
  initialProvince?: string;
  initialCity?: string;
  initialDistrict?: string;
  initialSubdistrict?: string;
  initialPostalCode?: string;
  initialJneCode?: string;
}

export function AddressSelector({ 
  onAddressChange, 
  disabled,
  initialProvince,
  initialCity,
  initialDistrict,
  initialSubdistrict,
  initialPostalCode,
  initialJneCode
}: AddressSelectorProps) {
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
  const [manualPostalCode, setManualPostalCode] = useState<string>('');

  // Selected names for callback
  const [selectedNames, setSelectedNames] = useState({
    province: '',
    city: '',
    district: '',
    subdistrict: '',
    postalCode: '',
    jneDestinationCode: ''
  });

  // Load Provinces on mount & sequential resolution of initial values
  useEffect(() => {
    async function loadAndInitialize() {
      try {
        const provRes = await fetch('/api/locations/provinces');
        const provData = await provRes.json();
        setProvinces(provData);

        if (initialProvince) {
          const matchedProv = provData.find((p: Region) => 
            p.name.toLowerCase() === initialProvince.toLowerCase()
          );
          if (matchedProv) {
            const provId = matchedProv.id.toString();
            setSelectedProvId(provId);
            setSelectedNames(prev => ({ ...prev, province: matchedProv.name }));

            // Fetch cities list for matched province
            const cityRes = await fetch(`/api/locations/cities?province_id=${provId}`);
            const cityData = await cityRes.json();
            setCities(cityData);

            if (initialCity) {
              const matchedCity = cityData.find((c: Region) => 
                c.name.toLowerCase() === initialCity.toLowerCase()
              );
              if (matchedCity) {
                const cityId = matchedCity.id.toString();
                setSelectedCityId(cityId);
                setSelectedNames(prev => ({ ...prev, city: matchedCity.name }));

                // Fetch districts list for matched city
                const distRes = await fetch(`/api/locations/districts?city_id=${cityId}`);
                const distData = await distRes.json();
                setDistricts(distData);

                let matchedDist: Region | undefined;

                // Resolve district using JNE postcode lookups
                if (initialPostalCode) {
                  try {
                    const searchRes = await fetch(`/api/shipping/search?search=${encodeURIComponent(initialPostalCode)}`);
                    const searchJson = await searchRes.json();
                    if (searchJson.data && searchJson.data.length > 0) {
                      const resolved = searchJson.data[0];
                      const resolvedDistrict = resolved.detail.district;
                      
                      matchedDist = distData.find((d: Region) => 
                        d.name.toLowerCase() === resolvedDistrict.toLowerCase()
                      );
                    }
                  } catch (e) {
                    console.error('Failed to resolve initial district from postcode:', e);
                  }
                }

                // Fallback to name-based match
                if (!matchedDist && initialDistrict) {
                  matchedDist = distData.find((d: Region) => 
                    d.name.toLowerCase() === initialDistrict.toLowerCase()
                  );
                }

                if (matchedDist) {
                  const distId = matchedDist.id.toString();
                  setSelectedDistId(distId);
                  setManualPostalCode(initialPostalCode || '');
                  setSelectedNames({
                    province: matchedProv.name,
                    city: matchedCity.name,
                    district: matchedDist.name,
                    subdistrict: initialSubdistrict || '',
                    postalCode: initialPostalCode || '',
                    jneDestinationCode: initialJneCode || ''
                  });

                  // Fetch subdistricts list for state cache
                  const subRes = await fetch(`/api/locations/subdistricts?district_id=${distId}`);
                  const subData = await subRes.json();
                  setSubdistricts(subData);
                }
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to initialize address selector data:', err);
      }
    }

    loadAndInitialize();
  }, [initialProvince, initialCity, initialDistrict, initialSubdistrict, initialPostalCode, initialJneCode]);

  // Handle Province Change
  const handleProvChange = async (provId: string) => {
    setManualPostalCode('');
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
    setManualPostalCode('');
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
        // We pick the first subdistrict to get the JNE Code for calculation
        // But we DO NOT set the subdistrict name or postal code, as the user will type it manually.
        if (data.length > 0) {
          const firstSub = data[0];
          
          // Reset postal code to empty when district changes — user must type it manually
          setManualPostalCode('');

          const finalNames = {
            ...newNames,
            subdistrict: '', // Reset text input when district changes
            postalCode: '',                               // Always empty — user types manually
            jneDestinationCode: firstSub.jne_code || ''  // Keep auto-populated for shipping calc
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

      {/* Postal Code — Manual Input */}
      <div className="space-y-2">
        <Label>ZIP CODE / KODE POS *</Label>
        <input
          type="text"
          inputMode="numeric"
          maxLength={5}
          className="w-full h-[40px] bg-white border border-gray-200 rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="e.g. 40361"
          value={manualPostalCode}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '').slice(0, 5);
            setManualPostalCode(val);
            const updatedNames = { ...selectedNames, postalCode: val };
            setSelectedNames(updatedNames);
            onAddressChange(updatedNames);
          }}
          disabled={disabled || !selectedDistId}
        />
      </div>
    </div>
  );
}
