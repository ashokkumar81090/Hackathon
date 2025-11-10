/**
 * Show document keys only
 */

import { MongoClient } from 'mongodb';
import { config } from '../config/index.js';
import dotenv from 'dotenv';

dotenv.config();

async function showDocKeys() {
  const client = new MongoClient(config.mongodb.uri);

  try {
    await client.connect();
    const db = client.db(config.mongodb.dbName);
    const collection = db.collection(config.mongodb.collectionName);

    const sampleDoc = await collection.findOne({});
    
    if (!sampleDoc) {
      console.error('No documents found!');
      process.exit(1);
    }

    console.log('📋 Document Keys:\n');
    Object.keys(sampleDoc).forEach(key => {
      if (key === 'embedding') {
        console.log(`   ${key}: [array of ${sampleDoc[key].length} numbers]`);
      } else if (key === '_id') {
        console.log(`   ${key}: ${sampleDoc[key]}`);
      } else {
        const value = sampleDoc[key];
        const preview = typeof value === 'string' && value.length > 60 
          ? value.substring(0, 60) + '...' 
          : value;
        console.log(`   ${key}: ${preview}`);
      }
    });

  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  } finally {
    await client.close();
  }
}

showDocKeys();

