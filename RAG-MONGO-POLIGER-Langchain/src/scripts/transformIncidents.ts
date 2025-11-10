/**
 * Transform ServiceNow incident format to flat structure for ingestion
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const INPUT_FILE = path.join(DATA_DIR, 'incidents_final.json');
const OUTPUT_FILE = path.join(DATA_DIR, 'incidents.json');

/**
 * Extract value from ServiceNow field (handles both strings and objects)
 */
function extractValue(field: any): string {
  if (!field) return '';
  if (typeof field === 'string') return field;
  if (typeof field === 'object') {
    return field.display_value || field.value || '';
  }
  return String(field);
}

/**
 * Transform a single incident to flat structure
 */
function transformIncident(snIncident: any): any {
  return {
    incidentId: extractValue(snIncident.incidentId),
    summary: extractValue(snIncident.summary),
    description: extractValue(snIncident.description),
    urgency: snIncident.urgency || 'Unknown',
    impact: snIncident.impact || 'Unknown',
    priority: snIncident.priority || 'Unknown',
    status: snIncident.status || 'Unknown',
    category: extractValue(snIncident.category) || 'Uncategorized',
    subcategory: extractValue(snIncident.subcategory) || '',
    assignee: snIncident.assignedTo || '',
    reporter: snIncident.reportedBy || '',
    team: snIncident.assignmentGroup || '',
    createdDate: extractValue(snIncident.createdDate),
    updatedDate: extractValue(snIncident.updatedDate),
    resolvedDate: extractValue(snIncident.resolvedDate) || undefined,
    closedDate: extractValue(snIncident.closedDate) || undefined,
    rootCause: extractValue(snIncident.rootCause) || undefined,
    resolutionSteps: extractValue(snIncident.resolutionSteps) || undefined,
    workNotes: extractValue(snIncident.workNotes) || undefined,
    searchableText: snIncident.searchableText || '',
  };
}

/**
 * Main transformation function
 */
async function main() {
  console.log('🔄 Transforming Incidents');
  console.log('='.repeat(80));
  console.log();

  try {
    // Load incidents
    console.log(`📥 Loading incidents from: ${INPUT_FILE}`);
    
    if (!fs.existsSync(INPUT_FILE)) {
      console.error(`❌ Error: ${INPUT_FILE} not found`);
      console.log('\n💡 Run these commands first:');
      console.log('   1. npm run fetch:servicenow');
      console.log('   2. npm run generate:incidents');
      process.exit(1);
    }

    const rawData = fs.readFileSync(INPUT_FILE, 'utf-8');
    const incidents = JSON.parse(rawData);
    console.log(`✓ Loaded ${incidents.length} incidents\n`);

    // Transform incidents
    console.log('⚙️  Transforming incidents to flat structure...');
    const transformedIncidents = incidents.map(transformIncident);
    console.log(`✓ Transformed ${transformedIncidents.length} incidents\n`);

    // Validate transformed data
    console.log('✅ Validating transformed data...');
    const invalid = transformedIncidents.filter((inc: any) => 
      !inc.incidentId || !inc.summary || !inc.description
    );
    
    if (invalid.length > 0) {
      console.warn(`⚠️  Found ${invalid.length} invalid incidents (will be skipped during ingestion)`);
    }
    console.log(`✓ ${transformedIncidents.length - invalid.length} valid incidents\n`);

    // Show sample
    console.log('📋 Sample transformed incident:');
    console.log(JSON.stringify(transformedIncidents[0], null, 2).slice(0, 500) + '...\n');

    // Calculate statistics
    console.log('📊 Transformation Statistics:');
    
    const stats = {
      priority: {} as Record<string, number>,
      status: {} as Record<string, number>,
      category: {} as Record<string, number>,
    };
    
    transformedIncidents.forEach((inc: any) => {
      stats.priority[inc.priority] = (stats.priority[inc.priority] || 0) + 1;
      stats.status[inc.status] = (stats.status[inc.status] || 0) + 1;
      stats.category[inc.category] = (stats.category[inc.category] || 0) + 1;
    });

    console.log('\n  Priority Distribution:');
    Object.entries(stats.priority).sort(([,a], [,b]) => b - a).forEach(([p, count]) => {
      console.log(`    ${p}: ${count} (${(count / transformedIncidents.length * 100).toFixed(1)}%)`);
    });

    console.log('\n  Status Distribution:');
    Object.entries(stats.status).sort(([,a], [,b]) => b - a).forEach(([s, count]) => {
      console.log(`    ${s}: ${count} (${(count / transformedIncidents.length * 100).toFixed(1)}%)`);
    });

    console.log('\n  Top 10 Categories:');
    Object.entries(stats.category).sort(([,a], [,b]) => b - a).slice(0, 10).forEach(([c, count]) => {
      console.log(`    ${c}: ${count} (${(count / transformedIncidents.length * 100).toFixed(1)}%)`);
    });

    // Save transformed data
    console.log(`\n💾 Saving transformed incidents to: ${OUTPUT_FILE}`);
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(transformedIncidents, null, 2));
    console.log(`✓ Saved ${transformedIncidents.length} transformed incidents`);

    console.log('\n' + '='.repeat(80));
    console.log('✅ SUCCESS! Transformation complete');
    console.log('='.repeat(80));
    console.log('\n📝 Next Steps:');
    console.log('   1. Review the transformed data: src/data/incidents.json');
    console.log('   2. Run ingestion: npm run ingest -- --clear');
    console.log('   3. Test RAG system: npm run dev');
    console.log();

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();

