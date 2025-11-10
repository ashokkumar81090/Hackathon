/**
 * Debug script to test search functionality
 * Tests vector search, BM25 search, and hybrid search
 */

import { config, validateConfig } from "../config/index.js";
import { createEmbeddings } from "../lib/embeddings/index.js";
import { IncidentVectorStore } from "../lib/vectorstore/incidentVectorStore.js";
import { MongoClient } from "mongodb";

async function debugSearch() {
  try {
    console.log("🔍 Starting Search Debug...\n");

    // Validate config
    validateConfig({ skipLLM: true });
    console.log("✓ Configuration valid\n");

    // Initialize embeddings
    const embeddings = createEmbeddings();
    console.log("✓ Embeddings initialized\n");

    // Initialize vector store
    const vectorStore = new IncidentVectorStore(embeddings);
    await vectorStore.initialize();
    console.log("✓ Connected to MongoDB\n");

    // Test query
    const testQuery = "My computer keeps freezing randomly";
    console.log(`📝 Test Query: "${testQuery}"\n`);

    // Check collection stats
    const client = new MongoClient(config.mongodb.uri);
    await client.connect();
    const db = client.db(config.mongodb.dbName);
    const collection = db.collection(config.mongodb.collectionName);
    
    const totalDocs = await collection.countDocuments();
    console.log(`📊 Total documents in collection: ${totalDocs}`);
    
    const docsWithEmbeddings = await collection.countDocuments({ embedding: { $exists: true } });
    console.log(`📊 Documents with embeddings: ${docsWithEmbeddings}`);
    
    if (docsWithEmbeddings === 0) {
      console.log("\n⚠️  WARNING: No documents have embeddings!");
      console.log("You need to run: npm run ingest\n");
    }

    // Sample a document to check structure
    const sampleDoc = await collection.findOne({ embedding: { $exists: true } });
    if (sampleDoc) {
      console.log(`\n📄 Sample Document Structure:`);
      console.log(`   - _id: ${sampleDoc._id}`);
      console.log(`   - incidentId: ${sampleDoc.incidentId || 'N/A'}`);
      console.log(`   - summary: ${sampleDoc.summary?.substring(0, 50) || 'N/A'}...`);
      console.log(`   - embedding dimensions: ${sampleDoc.embedding?.length || 0}`);
    }

    // Test Vector Search
    console.log(`\n🔍 Testing Vector Search...`);
    try {
      const vectorResults = await vectorStore.similaritySearch(testQuery, 5);
      console.log(`   Found ${vectorResults.length} results`);
      if (vectorResults.length > 0) {
        console.log(`   Top result: ${vectorResults[0].metadata?.incidentId || 'N/A'} - ${vectorResults[0].metadata?.summary?.substring(0, 50) || 'N/A'}...`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Test BM25 Search directly
    console.log(`\n🔍 Testing BM25 Search...`);
    try {
      const bm25Results = await collection.aggregate([
        {
          $search: {
            index: "incidents_bm25_index",
            text: {
              query: testQuery,
              path: ["summary", "description", "resolutionSteps"]
            }
          }
        },
        { $limit: 5 },
        { $project: { incidentId: 1, summary: 1, score: { $meta: "searchScore" } } }
      ]).toArray();
      
      console.log(`   Found ${bm25Results.length} results`);
      if (bm25Results.length > 0) {
        console.log(`   Top result: ${bm25Results[0].incidentId || 'N/A'} - ${bm25Results[0].summary?.substring(0, 50) || 'N/A'}...`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Check indexes
    console.log(`\n📑 Checking Search Indexes...`);
    const indexes = await collection.listSearchIndexes().toArray();
    console.log(`   Total search indexes: ${indexes.length}`);
    indexes.forEach(idx => {
      console.log(`   - ${idx.name}: ${idx.status} (type: ${idx.type || 'vectorSearch'})`);
    });

    if (indexes.length === 0) {
      console.log("\n⚠️  WARNING: No search indexes found!");
      console.log("You need to create indexes in MongoDB Atlas. See MONGODB_INDEX_SETUP.md\n");
    }

    await client.close();

    console.log("\n✅ Debug complete!");

  } catch (error) {
    console.error("❌ Error:", error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run the debug script
debugSearch();

