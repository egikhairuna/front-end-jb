import fs from 'fs'
import path from 'path'
import csv from 'csv-parser'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const csvPath = path.join(__dirname, 'list-dest.csv')
const outputPath = path.join(
  __dirname,
  '../src/data/jne-destinations.json'
)

const results = []

fs.createReadStream(csvPath)
  .pipe(csv({ separator: ';' }))
  .on('data', (row) => {
    results.push({
      code: row.TARIFF_CODE,
      province: row.PROVINCE_NAME,
      city: row.CITY_NAME,
      district: row.DISTRICT_NAME,
      subdistrict: row.SUBDISTRICT_NAME,
      zip: row.ZIP_CODE
    })
  })
  .on('end', () => {
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2))
    console.log('✅ Destination JSON ready:', results.length, 'locations')
  })
  .on('error', (err) => {
    console.error('❌ CSV ERROR:', err)
  })
