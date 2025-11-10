/**
 * Fetch incidents from ServiceNow and save to JSON file
 */

import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { ServiceNowClient, mapServiceNowIncidents, getIncidentStatistics } from '../integrations/servicenow/index.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Load configuration from environment variables
 */
function loadConfig() {
  const instanceUrl = process.env.SERVICENOW_INSTANCE_URL;
  const username = process.env.SERVICENOW_USERNAME;
  const password = process.env.SERVICENOW_PASSWORD;
  const fetchLimit = parseInt(process.env.SERVICENOW_FETCH_LIMIT || '500', 10);

  if (!instanceUrl || !username || !password) {
    console.error('\n❌ Missing ServiceNow configuration!');
    console.error('\nRequired environment variables:');
    console.error('  - SERVICENOW_INSTANCE_URL');
    console.error('  - SERVICENOW_USERNAME');
    console.error('  - SERVICENOW_PASSWORD');
    console.error('\nPlease add these to your .env file.\n');
    process.exit(1);
  }

  return {
    instanceUrl,
    username,
    password,
    fetchLimit,
  };
}

/**
 * Main function to fetch ServiceNow data
 */
async function main() {
  console.log('🔍 ServiceNow Data Fetcher');
  console.log('='.repeat(80));
  console.log();

  try {
    // Load configuration
    const config = loadConfig();
    console.log(`📋 Configuration:`);
    console.log(`  Instance: ${config.instanceUrl}`);
    console.log(`  Username: ${config.username}`);
    console.log(`  Fetch Limit: ${config.fetchLimit}`);
    console.log();

    // Create ServiceNow client
    console.log('🔌 Connecting to ServiceNow...');
    const client = new ServiceNowClient({
      instanceUrl: config.instanceUrl,
      username: config.username,
      password: config.password,
    });

    // Test connection
    const isConnected = await client.testConnection();
    if (!isConnected) {
      throw new Error('Failed to connect to ServiceNow. Check your credentials.');
    }
    console.log('✓ Connection successful\n');

    // Get total incident count
    console.log('📊 Checking available incidents...');
    const totalCount = await client.getIncidentCount();
    console.log(`✓ Total incidents available: ${totalCount}`);
    console.log(`✓ Will fetch: ${Math.min(config.fetchLimit, totalCount)}\n`);

    // Fetch incidents
    console.log('📥 Fetching incidents...');
    const incidents = await client.fetchIncidents({
      limit: config.fetchLimit,
      fields: [
        'number',
        'short_description',
        'description',
        'urgency',
        'impact',
        'priority',
        'state',
        'category',
        'subcategory',
        'assignment_group',
        'assigned_to',
        'caller_id',
        'opened_at',
        'sys_created_on',
        'sys_updated_on',
        'resolved_at',
        'closed_at',
        'close_notes',
        'work_notes',
        'comments_and_work_notes',
      ],
    });

    if (incidents.length === 0) {
      console.warn('\n⚠️  No incidents found in ServiceNow instance.');
      console.warn('Your developer instance might not have sample data yet.');
      console.warn('\nTip: You can load sample data from the ServiceNow UI:');
      console.warn('  1. Login to your instance');
      console.warn('  2. Go to: Incident > Create New');
      console.warn('  3. Or activate sample data plugins\n');
      process.exit(0);
    }

    console.log(`✓ Fetched ${incidents.length} incidents\n`);

    // Map to our format
    console.log('🔄 Mapping incidents to internal format...');
    const mappedIncidents = mapServiceNowIncidents(incidents);
    console.log(`✓ Mapped ${mappedIncidents.length} incidents\n`);

    // Get statistics
    console.log('📊 Data Statistics:');
    const stats = getIncidentStatistics(mappedIncidents);
    
    console.log(`\n  Total Incidents: ${stats.total}`);
    
    console.log('\n  Priority Distribution:');
    Object.entries(stats.byPriority)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([priority, count]) => {
        const percentage = ((count / stats.total) * 100).toFixed(1);
        console.log(`    ${priority}: ${count} (${percentage}%)`);
      });
    
    console.log('\n  Status Distribution:');
    Object.entries(stats.byStatus)
      .sort(([a], [b]) => b.localeCompare(a))
      .forEach(([status, count]) => {
        const percentage = ((count / stats.total) * 100).toFixed(1);
        console.log(`    ${status}: ${count} (${percentage}%)`);
      });
    
    console.log('\n  Top 5 Categories:');
    Object.entries(stats.byCategory)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .forEach(([category, count]) => {
        const percentage = ((count / stats.total) * 100).toFixed(1);
        console.log(`    ${category}: ${count} (${percentage}%)`);
      });
    
    console.log();

    // Save to file
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const outputPath = path.join(dataDir, 'servicenow_real.json');
    console.log(`💾 Saving to: ${outputPath}`);
    
    fs.writeFileSync(
      outputPath,
      JSON.stringify(mappedIncidents, null, 2),
      'utf-8'
    );
    
    console.log(`✓ Saved ${mappedIncidents.length} incidents\n`);

    // Save sample for review
    const samplePath = path.join(dataDir, 'servicenow_sample.json');
    const sampleIncidents = mappedIncidents.slice(0, 10);
    fs.writeFileSync(
      samplePath,
      JSON.stringify(sampleIncidents, null, 2),
      'utf-8'
    );
    console.log(`✓ Saved 10 sample incidents to: ${samplePath}\n`);

    // Save raw ServiceNow data for reference
    const rawPath = path.join(dataDir, 'servicenow_raw.json');
    fs.writeFileSync(
      rawPath,
      JSON.stringify(incidents.slice(0, 10), null, 2),
      'utf-8'
    );
    console.log(`✓ Saved 10 raw ServiceNow incidents for reference: ${rawPath}\n`);

    console.log('='.repeat(80));
    console.log('✅ SUCCESS! ServiceNow data fetched successfully');
    console.log('='.repeat(80));
    console.log('\n📁 Files Created:');
    console.log(`  1. ${outputPath} (${mappedIncidents.length} incidents)`);
    console.log(`  2. ${samplePath} (10 sample incidents)`);
    console.log(`  3. ${rawPath} (10 raw ServiceNow incidents)`);
    console.log('\n📝 Next Steps:');
    console.log('  1. Review the sample file to see the data structure');
    console.log('  2. Share sample incidents with Cursor AI');
    console.log('  3. I will generate 1500 additional incidents based on patterns');
    console.log('  4. Merge and ingest all 2000 incidents\n');

  } catch (error) {
    console.error('\n❌ Error fetching ServiceNow data:', error);
    if (error instanceof Error) {
      console.error(`\nError details: ${error.message}`);
      if (error.stack) {
        console.error(`\nStack trace:\n${error.stack}`);
      }
    }
    process.exit(1);
  }
}

// Run the script
main();

