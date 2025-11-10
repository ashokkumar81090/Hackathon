/**
 * Test BM25 search directly
 */

import { MongoClient } from "mongodb";
import { config } from "../config/index.js";

async function testBM25Search() {
  const client = new MongoClient(config.mongodb.uri);
  
  try {
    await client.connect();
    console.log("✓ Connected to MongoDB\n");
    
    const db = client.db(config.mongodb.dbName);
    const collection = db.collection(config.mongodb.collectionName);
    
    // Check index
    console.log("📑 Checking search indexes...");
    const indexes = await collection.listSearchIndexes().toArray();
    console.log(`Found ${indexes.length} search indexes:`);
    indexes.forEach(idx => {
      console.log(`  - Name: ${idx.name}, Status: ${idx.status}, Type: ${idx.type || 'vectorSearch'}`);
    });
    
    // Check BM25 index name
    const bm25IndexName = config.mongodb.bm25IndexName;
    console.log(`\n🔍 Using BM25 index: "${bm25IndexName}"`);
    
    const bm25Index = indexes.find(idx => idx.name === bm25IndexName);
    if (!bm25Index) {
      console.log(`❌ ERROR: BM25 index "${bm25IndexName}" not found!`);
      console.log(`Available indexes: ${indexes.map(i => i.name).join(', ')}`);
      return;
    }
    console.log(`✓ BM25 index found and status: ${bm25Index.status}`);
    
    // Test queries
    const testQueries = [
      "INC100000",
      "application crash",
      "database timeout",
      "memory leak"
    ];
    
    for (const query of testQueries) {
      console.log(`\n🔍 Testing query: "${query}"`);
      
      try {
        const results = await collection.aggregate([
          {
            $search: {
              index: bm25IndexName,
              compound: {
                should: [
                  // Exact match for incidentId
                  {
                    text: {
                      query: query,
                      path: "incidentId",
                    },
                  },
                  // Exact matches for keyword fields
                  {
                    text: {
                      query: query,
                      path: ["status", "priority", "category", "component", "environment"],
                    },
                  },
                  // Fuzzy text search for content fields
                  {
                    text: {
                      query: query,
                      path: ["summary", "description", "rootCause", "resolutionSteps"],
                      fuzzy: {
                        maxEdits: 1,
                      },
                    },
                  },
                ],
                minimumShouldMatch: 1,
              },
            },
          },
          {
            $addFields: {
              score: { $meta: "searchScore" }
            }
          },
          { $limit: 5 },
          {
            $project: {
              incidentId: 1,
              summary: 1,
              score: 1
            }
          }
        ]).toArray();
        
        console.log(`  Found ${results.length} results`);
        results.forEach((doc, idx) => {
          console.log(`  ${idx + 1}. ${doc.incidentId}: ${doc.summary?.substring(0, 60)}... (score: ${doc.score?.toFixed(3)})`);
        });
        
        if (results.length === 0) {
          console.log(`  ⚠️  No results found for "${query}"`);
        }
      } catch (error) {
        console.log(`  ❌ Error: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    // Check sample documents
    console.log(`\n📄 Sample documents in collection:`);
    const sampleDocs = await collection.find({}).limit(3).project({
      incidentId: 1,
      summary: 1,
      description: 1
    }).toArray();
    
    sampleDocs.forEach((doc, idx) => {
      console.log(`  ${idx + 1}. ${doc.incidentId}: ${doc.summary?.substring(0, 80) || 'No summary'}`);
    });
    
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await client.close();
  }
}

testBM25Search();

