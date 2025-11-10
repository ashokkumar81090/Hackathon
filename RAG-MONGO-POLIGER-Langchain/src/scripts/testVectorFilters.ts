/**
 * Test Vector Search Filtering Functionality
 */

import { MongoClient } from "mongodb";
import { config, validateConfig } from "../config/index.js";
import { createEmbeddings } from "../lib/embeddings/index.js";
import { IncidentVectorStore } from "../lib/vectorstore/index.js";

async function testVectorFilters() {
  try {
    console.log("🔍 Vector Search Filter Test\n");
    console.log("=".repeat(80));

    // Validate config
    validateConfig({ skipLLM: true });
    console.log("✓ Configuration valid\n");

    // Connect to MongoDB
    const client = new MongoClient(config.mongodb.uri);
    await client.connect();
    console.log("✓ Connected to MongoDB\n");

    const db = client.db(config.mongodb.dbName);
    const collection = db.collection(config.mongodb.collectionName);

    // Initialize embeddings and vector store
    const embeddings = createEmbeddings();
    const vectorStore = new IncidentVectorStore(embeddings);
    await vectorStore.initialize();
    console.log("✓ Vector store initialized\n");

    console.log("=".repeat(80));
    console.log("\n📊 Test 1: Search WITHOUT Filters (Baseline)\n");

    const baselineQuery = "database connection timeout";
    console.log(`Query: "${baselineQuery}"`);
    
    const baselineResults = await vectorStore.searchWithScores(baselineQuery, 5);
    console.log(`Found ${baselineResults.length} results:\n`);
    
    baselineResults.forEach(([doc, score], idx) => {
      const incidentId = doc.metadata.incidentId;
      const category = doc.metadata.category;
      const status = doc.metadata.status;
      const priority = doc.metadata.priority;
      const summary = doc.metadata.summary as string;
      
      console.log(`${idx + 1}. ${incidentId} (score: ${score.toFixed(3)})`);
      console.log(`   Category: ${category}`);
      console.log(`   Status: ${status}`);
      console.log(`   Priority: ${priority}`);
      console.log(`   Summary: ${summary?.substring(0, 80)}...`);
      console.log();
    });

    console.log("=".repeat(80));
    console.log("\n📊 Test 2: Filter by STATUS = 'Resolved'\n");

    const resolvedResults = await vectorStore.searchWithScores(
      baselineQuery, 
      5, 
      { status: "Resolved" }
    );
    
    console.log(`Found ${resolvedResults.length} results:\n`);
    
    resolvedResults.forEach(([doc, score], idx) => {
      const incidentId = doc.metadata.incidentId;
      const status = doc.metadata.status;
      const priority = doc.metadata.priority;
      
      console.log(`${idx + 1}. ${incidentId} (score: ${score.toFixed(3)}) - Status: ${status}, Priority: ${priority}`);
    });

    if (resolvedResults.length > 0) {
      console.log("\n✅ Status filter working!");
    } else {
      console.log("\n⚠️  No resolved incidents found. Try a different status.");
    }

    console.log("\n" + "=".repeat(80));
    console.log("\n📊 Test 3: Filter by CATEGORY = 'Cloud Service Outage'\n");

    const cloudResults = await vectorStore.searchWithScores(
      baselineQuery, 
      5, 
      { category: "Cloud Service Outage" }
    );
    
    console.log(`Found ${cloudResults.length} results:\n`);
    
    cloudResults.forEach(([doc, score], idx) => {
      const incidentId = doc.metadata.incidentId;
      const category = doc.metadata.category;
      const priority = doc.metadata.priority;
      
      console.log(`${idx + 1}. ${incidentId} (score: ${score.toFixed(3)}) - Category: ${category}, Priority: ${priority}`);
    });

    if (cloudResults.length > 0) {
      console.log("\n✅ Category filter working!");
    } else {
      console.log("\n⚠️  No cloud service outages found. Try a different category.");
    }

    console.log("\n" + "=".repeat(80));
    console.log("\n📊 Test 4: Filter by PRIORITY = 'High'\n");

    const highPriorityResults = await vectorStore.searchWithScores(
      baselineQuery, 
      5, 
      { priority: "High" }
    );
    
    console.log(`Found ${highPriorityResults.length} results:\n`);
    
    highPriorityResults.forEach(([doc, score], idx) => {
      const incidentId = doc.metadata.incidentId;
      const priority = doc.metadata.priority;
      const status = doc.metadata.status;
      
      console.log(`${idx + 1}. ${incidentId} (score: ${score.toFixed(3)}) - Priority: ${priority}, Status: ${status}`);
    });

    if (highPriorityResults.length > 0) {
      console.log("\n✅ Priority filter working!");
    } else {
      console.log("\n⚠️  No high priority incidents found.");
    }

    console.log("\n" + "=".repeat(80));
    console.log("\n📊 Test 5: Multiple Filters (STATUS + PRIORITY)\n");

    const multiFilterResults = await vectorStore.searchWithScores(
      baselineQuery, 
      5, 
      { 
        status: "Resolved",
        priority: "High"
      }
    );
    
    console.log(`Found ${multiFilterResults.length} results:\n`);
    
    multiFilterResults.forEach(([doc, score], idx) => {
      const incidentId = doc.metadata.incidentId;
      const status = doc.metadata.status;
      const priority = doc.metadata.priority;
      const category = doc.metadata.category;
      
      console.log(`${idx + 1}. ${incidentId} (score: ${score.toFixed(3)})`);
      console.log(`   Status: ${status}, Priority: ${priority}, Category: ${category}`);
    });

    if (multiFilterResults.length > 0) {
      console.log("\n✅ Multiple filters working!");
    } else {
      console.log("\n⚠️  No incidents match both filters.");
    }

    console.log("\n" + "=".repeat(80));
    console.log("\n📊 Test 6: Filter by Specific INCIDENT ID\n");

    // Get first incident ID from baseline results
    if (baselineResults.length > 0) {
      const testIncidentId = baselineResults[0][0].metadata.incidentId as string;
      console.log(`Looking for: ${testIncidentId}`);
      
      const specificIncidentResults = await vectorStore.searchWithScores(
        baselineQuery, 
        5, 
        { incidentId: testIncidentId }
      );
      
      console.log(`Found ${specificIncidentResults.length} results:\n`);
      
      specificIncidentResults.forEach(([doc, score], idx) => {
        const incidentId = doc.metadata.incidentId;
        const summary = doc.metadata.summary as string;
        
        console.log(`${idx + 1}. ${incidentId} (score: ${score.toFixed(3)})`);
        console.log(`   ${summary?.substring(0, 80)}...`);
      });

      if (specificIncidentResults.length > 0 && specificIncidentResults[0][0].metadata.incidentId === testIncidentId) {
        console.log("\n✅ Incident ID filter working!");
      } else {
        console.log("\n❌ Incident ID filter not working as expected");
      }
    }

    console.log("\n" + "=".repeat(80));
    console.log("\n📊 Test 7: Available Filter Values\n");

    // Get distinct values for each filter field
    const categories = await collection.distinct("category");
    const statuses = await collection.distinct("status");
    const priorities = await collection.distinct("priority");

    console.log("Available Categories:");
    categories.forEach((cat: string) => console.log(`  - ${cat}`));
    console.log();

    console.log("Available Statuses:");
    statuses.forEach((status: string) => console.log(`  - ${status}`));
    console.log();

    console.log("Available Priorities:");
    priorities.forEach((priority: string) => console.log(`  - ${priority}`));
    console.log();

    await client.close();
    
    console.log("=".repeat(80));
    console.log("\n✅ Filter test complete!");
    console.log("\n💡 Next Steps:");
    console.log("  1. Try filters in the UI: http://localhost:3000");
    console.log("  2. Go to 'Vector Search' and expand 'Advanced Filters'");
    console.log("  3. Use the dropdown options to filter results");
    console.log("\n" + "=".repeat(80));

  } catch (error) {
    console.error("\n❌ Error:", error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

testVectorFilters();

