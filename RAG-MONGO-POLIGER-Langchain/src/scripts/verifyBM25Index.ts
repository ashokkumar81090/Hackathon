/**
 * Verify BM25 Index Configuration in MongoDB Atlas
 */

import { MongoClient } from 'mongodb';
import { config } from '../config/index.js';
import dotenv from 'dotenv';

dotenv.config();

async function verifyBM25Index() {
  console.log('🔍 BM25 Index Verification');
  console.log('='.repeat(80));
  console.log();

  const client = new MongoClient(config.mongodb.uri);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = client.db(config.mongodb.dbName);
    const collection = db.collection(config.mongodb.collectionName);

    // Check if collection has documents
    const docCount = await collection.countDocuments();
    console.log(`📊 Collection Stats:`);
    console.log(`   Documents: ${docCount}`);
    console.log();

    if (docCount === 0) {
      console.error('❌ No documents in collection!');
      console.log('   Run: npm run ingest\n');
      process.exit(1);
    }

    // Sample document structure
    console.log('📋 Document Structure:');
    const sampleDoc = await collection.findOne({});
    if (sampleDoc) {
      console.log('   Available fields:');
      console.log(`     - pageContent: ${sampleDoc.pageContent ? '✅' : '❌'}`);
      console.log(`     - metadata: ${sampleDoc.metadata ? '✅' : '❌'}`);
      if (sampleDoc.metadata) {
        console.log(`       • metadata.incidentId: ${sampleDoc.metadata.incidentId ? '✅' : '❌'}`);
        console.log(`       • metadata.summary: ${sampleDoc.metadata.summary ? '✅' : '❌'}`);
        console.log(`       • metadata.description: ${sampleDoc.metadata.description ? '✅' : '❌'}`);
        console.log(`       • metadata.status: ${sampleDoc.metadata.status ? '✅' : '❌'}`);
        console.log(`       • metadata.priority: ${sampleDoc.metadata.priority ? '✅' : '❌'}`);
        console.log(`       • metadata.category: ${sampleDoc.metadata.category ? '✅' : '❌'}`);
      }
      console.log();
    }

    // Try to list search indexes (Atlas only feature)
    console.log('🔎 Checking for Search Indexes...');
    console.log(`   Looking for index: "${config.mongodb.bm25IndexName}"`);
    console.log();

    try {
      // This command only works on MongoDB Atlas
      const command = {
        aggregate: config.mongodb.collectionName,
        pipeline: [
          {
            $searchMeta: {
              index: config.mongodb.bm25IndexName,
              exists: { path: 'metadata.incidentId' }
            }
          }
        ],
        cursor: {}
      };
      
      await db.command(command);
      console.log(`✅ BM25 Index "${config.mongodb.bm25IndexName}" exists and is accessible!\n`);

    } catch (error: any) {
      if (error.message && error.message.includes('index not found')) {
        console.error(`❌ BM25 Index "${config.mongodb.bm25IndexName}" NOT FOUND!\n`);
        console.log('📝 TO CREATE THE BM25 INDEX:\n');
        console.log('1. Go to MongoDB Atlas: https://cloud.mongodb.com');
        console.log('2. Navigate to your cluster → Browse Collections');
        console.log(`3. Select database: "${config.mongodb.dbName}"`);
        console.log(`4. Select collection: "${config.mongodb.collectionName}"`);
        console.log('5. Click "Search Indexes" tab (not "Indexes")');
        console.log('6. Click "Create Search Index"');
        console.log('7. Choose "JSON Editor"');
        console.log(`8. Set Index Name: "${config.mongodb.bm25IndexName}"`);
        console.log('9. Paste this configuration:\n');

        const bm25Config = {
          mappings: {
            dynamic: false,
            fields: {
              "metadata.incidentId": { type: "string", analyzer: "lucene.keyword" },
              "metadata.summary": { type: "string", analyzer: "lucene.standard" },
              "metadata.description": { type: "string", analyzer: "lucene.standard" },
              "metadata.urgency": { type: "string", analyzer: "lucene.keyword" },
              "metadata.impact": { type: "string", analyzer: "lucene.keyword" },
              "metadata.priority": { type: "string", analyzer: "lucene.keyword" },
              "metadata.status": { type: "string", analyzer: "lucene.keyword" },
              "metadata.category": { type: "string", analyzer: "lucene.keyword" },
              "metadata.subcategory": { type: "string", analyzer: "lucene.keyword" },
              "metadata.rootCause": { type: "string", analyzer: "lucene.standard" },
              "metadata.resolutionSteps": { type: "string", analyzer: "lucene.standard" },
              "metadata.workNotes": { type: "string", analyzer: "lucene.standard" },
              "pageContent": { type: "string", analyzer: "lucene.standard" },
              "metadata.createdDate": { type: "date" },
              "metadata.updatedDate": { type: "date" },
              "metadata.resolvedDate": { type: "date" },
              "metadata.closedDate": { type: "date" }
            }
          }
        };

        console.log(JSON.stringify(bm25Config, null, 2));
        console.log('\n10. Click "Create Search Index"');
        console.log('11. Wait 2-5 minutes for index to build');
        console.log('12. Run this script again to verify\n');
        
        console.log('💾 Configuration also saved in: src/config/bm25index.json\n');
        process.exit(1);
      } else {
        console.log(`⚠️  Could not verify index (this is normal for non-Atlas MongoDB)`);
        console.log(`   Error: ${error.message}\n`);
        console.log('💡 If you\'re using MongoDB Atlas:');
        console.log('   - Ensure the search index is created');
        console.log(`   - Index name should be: "${config.mongodb.bm25IndexName}"`);
        console.log('   - Refer to: src/config/bm25index.json for configuration\n');
      }
    }

    // Test BM25 search with a simple query
    console.log('🧪 Testing BM25 Search...');
    try {
      const testPipeline = [
        {
          $search: {
            index: config.mongodb.bm25IndexName,
            text: {
              query: "network",
              path: ["metadata.summary", "metadata.description", "pageContent"]
            }
          }
        },
        { $limit: 3 },
        { $project: { "metadata.incidentId": 1, "metadata.summary": 1, score: { $meta: "searchScore" } } }
      ];

      const testResults = await collection.aggregate(testPipeline).toArray();
      
      if (testResults.length > 0) {
        console.log(`✅ BM25 Search is WORKING!`);
        console.log(`   Found ${testResults.length} results for "network"`);
        console.log(`   Top result: ${testResults[0].metadata?.incidentId || 'N/A'}\n`);
        
        console.log('='.repeat(80));
        console.log('✅ SUCCESS! BM25 Index is configured correctly!');
        console.log('='.repeat(80));
        console.log('\n🎉 Your BM25 search should now work in the RAG system!\n');
      } else {
        console.log(`⚠️  BM25 query executed but returned 0 results`);
        console.log('   This might indicate an index configuration issue\n');
      }
    } catch (searchError: any) {
      console.error(`❌ BM25 Search Test Failed:`);
      console.error(`   ${searchError.message}\n`);
    }

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  } finally {
    await client.close();
  }
}

verifyBM25Index();

