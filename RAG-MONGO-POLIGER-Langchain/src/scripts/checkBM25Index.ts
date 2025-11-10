/**
 * Check BM25 Index Configuration and Test Searches
 */

import { MongoClient } from "mongodb";
import { config } from "../config/index.js";

async function checkBM25Index() {
  const client = new MongoClient(config.mongodb.uri);
  
  try {
    await client.connect();
    console.log("✓ Connected to MongoDB\n");
    
    const db = client.db(config.mongodb.dbName);
    const collection = db.collection(config.mongodb.collectionName);
    
    // Check BM25 index
    console.log("📑 Checking BM25 Index Configuration...");
    const indexes = await collection.listSearchIndexes().toArray();
    
    const bm25Index = indexes.find(idx => idx.name === config.mongodb.bm25IndexName);
    
    if (!bm25Index) {
      console.log(`❌ BM25 index "${config.mongodb.bm25IndexName}" not found!`);
      return;
    }
    
    console.log(`\n✓ BM25 Index Found: ${bm25Index.name}`);
    console.log(`  Status: ${bm25Index.status}`);
    console.log(`  Type: ${bm25Index.type || 'search'}`);
    
    if (bm25Index.latestDefinition) {
      console.log(`\n📋 Index Definition:`);
      console.log(JSON.stringify(bm25Index.latestDefinition, null, 2));
    }
    
    // Test with compound query
    console.log(`\n\n🔍 Testing Compound Query (using $text with multiple operators)...\n`);
    
    // Test 1: Try compound search with incidentId
    console.log("Test 1: Searching with compound operator for incidentId");
    try {
      const results1 = await collection.aggregate([
        {
          $search: {
            index: config.mongodb.bm25IndexName,
            compound: {
              should: [
                {
                  text: {
                    query: "INC100000",
                    path: "incidentId"
                  }
                },
                {
                  text: {
                    query: "INC100000",
                    path: ["summary", "description"]
                  }
                }
              ]
            }
          }
        },
        { $limit: 5 },
        {
          $project: {
            incidentId: 1,
            summary: 1,
            score: { $meta: "searchScore" }
          }
        }
      ]).toArray();
      
      console.log(`  Found ${results1.length} results`);
      results1.forEach((doc, idx) => {
        console.log(`  ${idx + 1}. ${doc.incidentId}: ${doc.summary?.substring(0, 50)}...`);
      });
    } catch (error) {
      console.log(`  ❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    // Test 2: Direct document lookup to verify incidentId exists
    console.log(`\n\nTest 2: Direct MongoDB find for INC100000`);
    const directFind = await collection.findOne({ incidentId: "INC100000" });
    if (directFind) {
      console.log(`  ✓ Found document with incidentId: ${directFind.incidentId}`);
      console.log(`  Summary: ${directFind.summary}`);
    } else {
      console.log(`  ❌ No document found with incidentId: INC100000`);
    }
    
    // Test 3: Check if incidentId field is indexed
    console.log(`\n\nTest 3: Testing if incidentId field is searchable in index`);
    console.log(`  Waiting for index to be READY...`);
    console.log(`  Current Status: ${bm25Index.status}`);
    
    if (bm25Index.status !== "READY") {
      console.log(`\n  ⚠️  WARNING: Index is not READY yet!`);
      console.log(`  Please wait for the index to finish building in MongoDB Atlas.`);
      console.log(`  This usually takes 1-3 minutes for your data size.`);
    } else {
      console.log(`  ✓ Index is READY`);
    }
    
    // Test 4: Simple text search on all configured paths
    console.log(`\n\nTest 4: Testing all search paths from code`);
    const searchPaths = [
      "incidentId",
      "summary",
      "description",
      "rootCause",
      "resolutionSteps",
      "category",
      "component",
      "environment",
      "status",
      "priority",
    ];
    
    console.log(`  Configured search paths: ${searchPaths.join(", ")}`);
    
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await client.close();
  }
}

checkBM25Index();

