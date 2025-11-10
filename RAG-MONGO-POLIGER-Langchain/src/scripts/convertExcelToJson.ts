/**
 * Convert incidents_final_langflow.xlsx to JSON format
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_FILE = path.join(__dirname, '../data/incidents_final_langflow.xlsx');
const OUTPUT_FILE = path.join(__dirname, '../data/incidents_final_langflow.json');

async function convertExcelToJson() {
  console.log('📊 Converting Excel to JSON');
  console.log('='.repeat(80));
  console.log();

  try {
    // Check if input file exists
    console.log(`📥 Loading Excel from: ${INPUT_FILE}`);
    
    // Read the Excel file
    const workbook = XLSX.readFile(INPUT_FILE);
    
    // Get the first sheet
    const sheetName = workbook.SheetNames[0];
    console.log(`✓ Found sheet: "${sheetName}"\n`);
    
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    console.log('⚙️  Converting to JSON...');
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    console.log(`✓ Converted ${jsonData.length} rows\n`);

    // Get column names
    const columns = Object.keys(jsonData[0] || {});
    console.log(`📋 Columns (${columns.length} total):`);
    columns.forEach((col, i) => {
      if (i < 15) {
        console.log(`   ${i + 1}. ${col}`);
      }
    });
    if (columns.length > 15) {
      console.log(`   ... and ${columns.length - 15} more columns`);
    }
    console.log();

    // Sample first record
    if (jsonData.length > 0) {
      console.log('📄 Sample Record (first incident):');
      console.log(JSON.stringify(jsonData[0], null, 2));
      console.log();
    }

    // Write to JSON file
    console.log(`💾 Saving JSON to: ${OUTPUT_FILE}`);
    await fs.writeFile(OUTPUT_FILE, JSON.stringify(jsonData, null, 2));
    console.log('✓ File saved successfully\n');

    // Get file sizes
    const inputStats = await fs.stat(INPUT_FILE);
    const outputStats = await fs.stat(OUTPUT_FILE);
    const inputSizeMB = (inputStats.size / 1024 / 1024).toFixed(2);
    const outputSizeMB = (outputStats.size / 1024 / 1024).toFixed(2);
    
    console.log('='.repeat(80));
    console.log('✅ SUCCESS! Conversion complete');
    console.log('='.repeat(80));
    console.log(`\n📊 Conversion Summary:`);
    console.log(`   Input:  ${INPUT_FILE}`);
    console.log(`   Output: ${OUTPUT_FILE}`);
    console.log(`   Records: ${jsonData.length}`);
    console.log(`   Columns: ${columns.length}`);
    console.log(`   Input Size:  ${inputSizeMB} MB`);
    console.log(`   Output Size: ${outputSizeMB} MB`);
    console.log();

  } catch (error) {
    console.error(`\n❌ Conversion failed: ${error instanceof Error ? error.message : String(error)}`);
    
    if (error instanceof Error && error.message.includes('ENOENT')) {
      console.log('\n💡 Make sure incidents_final_langflow.xlsx exists in src/data/');
      console.log(`   Looking for: ${INPUT_FILE}\n`);
    }
    
    process.exit(1);
  }
}

convertExcelToJson();

