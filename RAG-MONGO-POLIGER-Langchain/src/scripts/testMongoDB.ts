/**
 * Test MongoDB Connection
 */

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { config } from '../config/index.js';

dotenv.config();

async function testMongoDBConnection() {
  console.log('🔍 MongoDB Connection Diagnostics');
  console.log('='.repeat(80));
  console.log();

  // Check environment variable
  const mongoUri = process.env.MONGODB_URI;
  console.log('📋 Configuration Check:');
  console.log(`   MONGODB_URI exists: ${mongoUri ? '✅' : '❌'}`);
  
  if (!mongoUri) {
    console.error('\n❌ ERROR: MONGODB_URI is not set in .env file!\n');
    console.log('💡 Please add your MongoDB connection string:');
    console.log('   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname\n');
    process.exit(1);
  }

  // Mask password for display
  const maskedUri = mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
  console.log(`   URI: ${maskedUri}`);
  console.log();

  // Extract cluster info
  const clusterMatch = mongoUri.match(/@([^/]+)/);
  if (clusterMatch) {
    console.log(`   Cluster: ${clusterMatch[1]}`);
  }
  console.log(`   Database: ${config.mongodb.dbName}`);
  console.log(`   Collection: ${config.mongodb.collectionName}`);
  console.log();

  // Test connection
  console.log('🔌 Testing Connection...');
  const client = new MongoClient(mongoUri, {
    serverSelectionTimeoutMS: 10000, // 10 second timeout
  });

  try {
    console.log('   Connecting...');
    await client.connect();
    console.log('   ✅ Connection successful!\n');

    // Test database access
    console.log('📊 Testing Database Access...');
    const db = client.db(config.mongodb.dbName);
    const collections = await db.listCollections().toArray();
    console.log(`   ✅ Database accessible`);
    console.log(`   Collections found: ${collections.length}`);
    
    if (collections.length > 0) {
      console.log('   Available collections:');
      collections.forEach(col => console.log(`     - ${col.name}`));
    }
    console.log();

    // Check incidents collection
    if (collections.some(col => col.name === config.mongodb.collectionName)) {
      const collection = db.collection(config.mongodb.collectionName);
      const count = await collection.countDocuments();
      const size = await db.command({ collStats: config.mongodb.collectionName });
      
      console.log(`📦 Incidents Collection:`);
      console.log(`   Documents: ${count}`);
      console.log(`   Size: ${(size.size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Storage: ${(size.storageSize / 1024 / 1024).toFixed(2)} MB`);
      console.log();

      // Check for embeddings
      const sampleDoc = await collection.findOne({});
      if (sampleDoc) {
        console.log(`   ✅ Sample document found`);
        console.log(`   Has embedding: ${sampleDoc.embedding ? '✅' : '❌'}`);
        if (sampleDoc.embedding) {
          console.log(`   Embedding dimensions: ${sampleDoc.embedding.length}`);
        }
      }
    } else {
      console.log(`⚠️  Collection "${config.mongodb.collectionName}" not found`);
      console.log('   Run: npm run ingest\n');
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ MongoDB is working correctly!');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('\n' + '='.repeat(80));
    console.error('❌ CONNECTION FAILED!');
    console.error('='.repeat(80));
    console.error();

    if (error instanceof Error) {
      console.error(`Error: ${error.message}\n`);

      // Provide specific troubleshooting
      if (error.message.includes('ESERVFAIL')) {
        console.error('🔧 DNS Resolution Failed - Possible causes:');
        console.error('   1. MongoDB Atlas cluster is PAUSED (most common)');
        console.error('   2. Network/VPN blocking DNS lookups');
        console.error('   3. Firewall blocking port 27017');
        console.error('   4. DNS server issues\n');
        console.error('💡 Solution:');
        console.error('   → Go to MongoDB Atlas (cloud.mongodb.com)');
        console.error('   → Check if your cluster is paused');
        console.error('   → Click "Resume" if paused');
        console.error('   → Wait 2-3 minutes for cluster to start');
        console.error('   → Run this test again\n');
      } else if (error.message.includes('Authentication failed')) {
        console.error('🔧 Authentication Failed:');
        console.error('   → Check username and password in MONGODB_URI');
        console.error('   → Ensure user has proper permissions');
        console.error('   → Check if password has special characters (URL encode them)\n');
      } else if (error.message.includes('ENOTFOUND')) {
        console.error('🔧 Cluster Not Found:');
        console.error('   → Verify cluster hostname in MONGODB_URI');
        console.error('   → Ensure cluster exists in MongoDB Atlas\n');
      }
    }

    console.error('📚 MongoDB Atlas Guide:');
    console.error('   https://www.mongodb.com/docs/atlas/getting-started/\n');
    
    process.exit(1);
  } finally {
    await client.close();
  }
}

testMongoDBConnection();

