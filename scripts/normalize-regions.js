
const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, '../src/data/jne-destinations.json');
const outputDir = path.join(__dirname, '../src/data/regions');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Read input file
const rawData = fs.readFileSync(inputFile, 'utf8');
const destinations = JSON.parse(rawData);

console.log(`Processing ${destinations.length} records...`);

// Data structures
const provinces = new Map();
const cities = new Map();
const districts = new Map();
const subdistricts = [];

let provIdCounter = 1;
let cityIdCounter = 1;
let distIdCounter = 1;

destinations.forEach((item) => {
  // 1. Province
  const provName = item.province;
  if (!provinces.has(provName)) {
    provinces.set(provName, {
      id: provIdCounter++,
      name: provName
    });
  }
  const provId = provinces.get(provName).id;

  // 2. City
  const cityName = item.city;
  const cityKey = `${provId}-${cityName}`;
  if (!cities.has(cityKey)) {
    cities.set(cityKey, {
      id: cityIdCounter++,
      parent_id: provId,
      name: cityName
    });
  }
  const cityId = cities.get(cityKey).id;

  // 3. District
  const distName = item.district;
  const distKey = `${cityId}-${distName}`;
  if (!districts.has(distKey)) {
    districts.set(distKey, {
      id: distIdCounter++,
      parent_id: cityId,
      name: distName
    });
  }
  const distId = districts.get(distKey).id;

  // 4. Subdistrict (Leaf)
  subdistricts.push({
    id: subdistricts.length + 1,
    parent_id: distId,
    name: item.subdistrict,
    postal_code: item.zip,
    jne_code: item.code
  });
});

// Convert Maps to Arrays and Write Files
const writeJson = (filename, data) => {
  fs.writeFileSync(path.join(outputDir, filename), JSON.stringify(data, null, 2));
  console.log(`✅ Written ${filename}: ${data.length} records`);
};

writeJson('provinces.json', Array.from(provinces.values()));
writeJson('cities.json', Array.from(cities.values()));
writeJson('districts.json', Array.from(districts.values()));
writeJson('subdistricts.json', subdistricts);

console.log('🎉 Normalization complete!');
