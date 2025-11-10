/**
 * Test Vector Search Configuration and Functionality
 */

import { MongoClient } from "mongodb";
import { config, validateConfig } from "../config/index.js";
import { createEmbeddings } from "../lib/embeddings/index.js";
import { IncidentVectorStore } from "../lib/vectorstore/index.js";

async function testVectorSearch() {
  try {
    console.log("🔍 Vector Search Configuration Test\n");

    // Validate config
    validateConfig({ skipLLM: true });
    console.log("✓ Configuration valid\n");

    // Check MongoDB connection
    const client = new MongoClient(config.mongodb.uri);
    await client.connect();
    console.log("✓ Connected to MongoDB\n");

    const db = client.db(config.mongodb.dbName);
    const collection = db.collection(config.mongodb.collectionName);

    // Check collection stats
    console.log("📊 Collection Statistics:");
    const totalDocs = await collection.countDocuments();
    console.log(`  Total documents: ${totalDocs}`);
    
    const docsWithEmbeddings = await collection.countDocuments({ embedding: { $exists: true } });
    console.log(`  Documents with embeddings: ${docsWithEmbeddings}`);
    
    if (docsWithEmbeddings === 0) {
      console.log("\n⚠️  WARNING: No embeddings found! Run 'npm run ingest' first.\n");
      await client.close();
      return;
    }

    // Check sample embedding
    const sampleDoc = await collection.findOne({ embedding: { $exists: true } });
    if (sampleDoc) {
      console.log(`  Embedding dimensions: ${sampleDoc.embedding?.length || 0}`);
      console.log(`  Sample incident: ${sampleDoc.incidentId}\n`);
    }

    // Check vector search indexes
    console.log("📑 Vector Search Indexes:");
    const indexes = await collection.listSearchIndexes().toArray();
    const vectorIndex = indexes.find(idx => idx.name === config.mongodb.vectorIndexName);
    
    if (!vectorIndex) {
      console.log(`❌ Vector index "${config.mongodb.vectorIndexName}" not found!`);
      console.log(`Available indexes: ${indexes.map(i => i.name).join(', ')}\n`);
      await client.close();
      return;
    }
    
    console.log(`  ✓ Index: ${vectorIndex.name}`);
    console.log(`  Status: ${vectorIndex.status}`);
    console.log(`  Type: ${vectorIndex.type || 'vectorSearch'}`);
    
    if (vectorIndex.latestDefinition) {
      console.log(`\n  Index Configuration:`);
      console.log(JSON.stringify(vectorIndex.latestDefinition, null, 2));
    }
    
    if (vectorIndex.status !== 'READY') {
      console.log(`\n⚠️  WARNING: Index status is ${vectorIndex.status}, not READY`);
      console.log(`Please wait for the index to be ready in MongoDB Atlas.\n`);
      await client.close();
      return;
    }

    // Initialize embeddings and vector store
    console.log("\n\n🔧 Initializing Vector Store...");
    const embeddingsProvider = config.embeddings.provider;
    console.log(`  Provider: ${embeddingsProvider.toUpperCase()}`);
    
    const embeddings = createEmbeddings();
    const vectorStore = new IncidentVectorStore(embeddings);
    await vectorStore.initialize();
    console.log("  ✓ Vector store initialized\n");

    // Test queries
    const testQueries = [
      "Application crashes on startup with memory error",
      "VPN connection timeout issues",
      "Database connection pool exhausted",
      "SSL certificate expired"
    ];

    console.log("🔍 Testing Vector Search Queries:\n");
    
    for (const query of testQueries) {
      console.log(`Query: "${query}"`);
      
      try {
        const results = await vectorStore.searchWithScores(query, 3);
        
        if (results.length === 0) {
          console.log(`  ⚠️  No results found`);
        } else {
          console.log(`  Found ${results.length} results:`);
          results.forEach(([doc, score], idx) => {
            const incidentId = doc.metadata.incidentId;
            const summary = doc.metadata.summary as string;
            console.log(`  ${idx + 1}. ${incidentId} (score: ${score.toFixed(3)})`);
            console.log(`     ${summary?.substring(0, 80)}...`);
          });
        }
      } catch (error) {
        console.log(`  ❌ Error: ${error instanceof Error ? error.message : String(error)}`);
      }
      
      console.log();
    }

    // Test filter capability (if supported)
    console.log("\n📋 Testing Filter Fields:");
    console.log("  Filter fields in index:");
    
    if (vectorIndex.latestDefinition?.fields) {
      const filterFields = vectorIndex.latestDefinition.fields.filter((f: any) => f.type === 'filter');
      filterFields.forEach((field: any) => {
        console.log(`  ✓ ${field.path} (filter)`);
      });
      
      if (filterFields.length === 0) {
        console.log("  ℹ️  No filter fields configured");
      }
    }

    // Test with MongoDB aggregation to verify vector search directly
    console.log("\n\n🔍 Testing Direct MongoDB Vector Search:");
    
    try {
      // Generate embedding for test query
      const testQuery = "database connection timeout";
      console.log(`  Query: "${testQuery}"`);
      
      const queryEmbedding = await embeddings.embedQuery(testQuery);
      console.log(`  ✓ Generated query embedding (${queryEmbedding.length} dimensions)`);
      
      // Direct vector search via aggregation
      const directResults = await collection.aggregate([
        {
          $vectorSearch: {
            index: config.mongodb.vectorIndexName,
            path: "embedding",
            queryVector: queryEmbedding,
            numCandidates: 100,
            limit: 3,
          }
        },
        {
          $project: {
            incidentId: 1,
            summary: 1,
            category: 1,
            status: 1,
            priority: 1,
            score: { $meta: "vectorSearchScore" }
          }
        }
      ]).toArray();
      
      console.log(`  Found ${directResults.length} results:`);
      directResults.forEach((doc: any, idx: number) => {
        console.log(`  ${idx + 1}. ${doc.incidentId} (score: ${doc.score?.toFixed(3)})`);
        console.log(`     ${doc.summary?.substring(0, 80)}...`);
        console.log(`     Category: ${doc.category}, Priority: ${doc.priority}, Status: ${doc.status}`);
      });
    } catch (error) {
      console.log(`  ❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    }

    await client.close();
    console.log("\n✅ Vector search test complete!");

  } catch (error) {
    console.error("\n❌ Error:", error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

testVectorSearch();

