/**
 * Inspect actual document structure in MongoDB
 */

import { MongoClient } from 'mongodb';
import { config } from '../config/index.js';
import dotenv from 'dotenv';

dotenv.config();

async function inspectDocument() {
  console.log('🔍 Document Structure Inspector');
  console.log('='.repeat(80));
  console.log();

  const client = new MongoClient(config.mongodb.uri);

  try {
    await client.connect();
    const db = client.db(config.mongodb.dbName);
    const collection = db.collection(config.mongodb.collectionName);

    // Get a sample document
    const sampleDoc = await collection.findOne({});
    
    if (!sampleDoc) {
      console.error('❌ No documents found in collection!');
      process.exit(1);
    }

    console.log('📄 Sample Document Structure:\n');
    console.log(JSON.stringify(sampleDoc, null, 2));
    console.log('\n' + '='.repeat(80));
    console.log('\n🔑 Top-level keys:');
    Object.keys(sampleDoc).forEach(key => {
      const value = sampleDoc[key];
      const type = Array.isArray(value) ? 'array' : typeof value;
      const extra = Array.isArray(value) ? ` (length: ${value.length})` : '';
      console.log(`   - ${key}: ${type}${extra}`);
    });

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  } finally {
    await client.close();
  }
}

inspectDocument();

