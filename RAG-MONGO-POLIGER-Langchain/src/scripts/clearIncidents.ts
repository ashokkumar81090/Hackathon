/**
 * Clear all incidents from MongoDB collection
 */

import { MongoClient } from 'mongodb';
import { config } from '../config/index.js';
import dotenv from 'dotenv';

dotenv.config();

async function clearIncidents() {
  console.log('🗑️  Clear Incidents Collection');
  console.log('='.repeat(80));
  console.log();

  const client = new MongoClient(config.mongodb.uri);

  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    console.log('✓ Connected to MongoDB\n');

    const db = client.db(config.mongodb.dbName);
    const collection = db.collection(config.mongodb.collectionName);

    // Get count before deletion
    const countBefore = await collection.countDocuments();
    console.log(`📊 Current Records: ${countBefore}`);

    if (countBefore === 0) {
      console.log('✓ Collection is already empty\n');
      return;
    }

    // Ask for confirmation
    console.log(`\n⚠️  WARNING: This will delete ALL ${countBefore} incidents!`);
    console.log(`   Database: ${config.mongodb.dbName}`);
    console.log(`   Collection: ${config.mongodb.collectionName}`);
    console.log();

    // Delete all documents
    console.log('🗑️  Deleting all incidents...');
    const result = await collection.deleteMany({});
    console.log(`✓ Deleted ${result.deletedCount} incidents\n`);

    // Verify deletion
    const countAfter = await collection.countDocuments();
    console.log(`📊 Remaining Records: ${countAfter}`);

    console.log('\n' + '='.repeat(80));
    console.log('✅ SUCCESS! Collection cleared');
    console.log('='.repeat(80));
    console.log('\n📝 Next Steps:');
    console.log('   1. Run: npm run ingest -- --clear (to load new data)');
    console.log('   2. Or: npm run ingest (to load without clearing again)');
    console.log();

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : String(error));
    throw error;
  } finally {
    await client.close();
    console.log('🔌 MongoDB connection closed\n');
  }
}

clearIncidents();

