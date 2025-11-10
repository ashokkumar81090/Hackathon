/**
 * Convert incidents_final.json to Excel (XLSX) format
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as XLSX from 'xlsx';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_FILE = path.join(__dirname, '../data/incidents_final.json');
const OUTPUT_FILE = path.join(__dirname, '../data/incidents_final.xlsx');

async function convertToExcel() {
  console.log('📊 Converting JSON to Excel (XLSX)');
  console.log('='.repeat(80));
  console.log();

  try {
    // Read JSON file
    console.log(`📥 Loading JSON from: ${INPUT_FILE}`);
    const rawData = await fs.readFile(INPUT_FILE, 'utf-8');
    const incidents = JSON.parse(rawData);
    console.log(`✓ Loaded ${incidents.length} incidents\n`);

    // Flatten nested objects for Excel compatibility
    console.log('⚙️  Flattening nested fields for Excel...');
    const flattenedIncidents = incidents.map((incident: any, index: number) => {
      const flattened: any = {};
      
      for (const key in incident) {
        if (Object.prototype.hasOwnProperty.call(incident, key)) {
          const value = incident[key];
          
          // Handle nested objects with display_value/value structure
          if (value && typeof value === 'object' && !Array.isArray(value)) {
            if (value.display_value !== undefined || value.value !== undefined) {
              // Use display_value if available, otherwise value
              flattened[key] = value.display_value || value.value || '';
            } else {
              // For other objects, convert to JSON string
              flattened[key] = JSON.stringify(value);
            }
          } else if (Array.isArray(value)) {
            // Convert arrays to comma-separated strings
            flattened[key] = value.join(', ');
          } else {
            // Keep primitives as-is
            flattened[key] = value;
          }
        }
      }
      
      return flattened;
    });
    console.log(`✓ Flattened ${flattenedIncidents.length} incidents\n`);

    // Create worksheet from JSON
    console.log('📝 Creating Excel worksheet...');
    const worksheet = XLSX.utils.json_to_sheet(flattenedIncidents);
    console.log('✓ Worksheet created\n');

    // Auto-size columns
    console.log('📏 Auto-sizing columns...');
    const columnWidths: any[] = [];
    const headers = Object.keys(flattenedIncidents[0] || {});
    
    headers.forEach((header, index) => {
      const maxLength = Math.max(
        header.length,
        ...flattenedIncidents.map((row: any) => {
          const cellValue = row[header];
          return cellValue ? String(cellValue).length : 0;
        })
      );
      columnWidths[index] = { wch: Math.min(maxLength + 2, 50) }; // Max 50 chars wide
    });
    
    worksheet['!cols'] = columnWidths;
    console.log('✓ Columns auto-sized\n');

    // Create workbook and add worksheet
    console.log('📚 Creating workbook...');
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Incidents');
    console.log('✓ Workbook created\n');

    // Write to file
    console.log(`💾 Saving Excel file to: ${OUTPUT_FILE}`);
    XLSX.writeFile(workbook, OUTPUT_FILE);
    console.log('✓ File saved successfully\n');

    // Get file size
    const stats = await fs.stat(OUTPUT_FILE);
    const fileSizeMB = (stats.size / 1024 / 1024).toFixed(2);
    
    console.log('='.repeat(80));
    console.log('✅ SUCCESS! Conversion complete');
    console.log('='.repeat(80));
    console.log(`\n📊 Excel File Details:`);
    console.log(`   Location: ${OUTPUT_FILE}`);
    console.log(`   Records: ${incidents.length}`);
    console.log(`   Columns: ${headers.length}`);
    console.log(`   File Size: ${fileSizeMB} MB`);
    console.log();
    console.log('💡 Column Headers:');
    headers.slice(0, 10).forEach((header, i) => {
      console.log(`   ${i + 1}. ${header}`);
    });
    if (headers.length > 10) {
      console.log(`   ... and ${headers.length - 10} more columns`);
    }
    console.log();

  } catch (error) {
    console.error(`\n❌ Conversion failed: ${error instanceof Error ? error.message : String(error)}`);
    
    if (error instanceof Error && error.message.includes('ENOENT')) {
      console.log('\n💡 Make sure incidents_final.json exists in src/data/');
      console.log('   Run: npm run generate:incidents (if not generated yet)\n');
    }
    
    process.exit(1);
  }
}

convertToExcel();

