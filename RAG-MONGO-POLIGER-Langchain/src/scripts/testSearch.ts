#!/usr/bin/env node
import { config, validateConfig } from "../config/index.js";
import { createEmbeddings } from "../lib/embeddings/index.js";
import { IncidentVectorStore } from "../lib/vectorstore/index.js";
import { RetrievalPipeline, HybridSearchConfig } from "../pipelines/retrieval/index.js";

/**
 * Test search functionality
 */
async function main() {
  try {
    console.log(`\n${"=".repeat(80)}`);
    console.log(`🔍 TEST SEARCH`);
    console.log(`${"=".repeat(80)}\n`);

    // Validate configuration
    console.log(`⚙️  Validating configuration...`);
    validateConfig();
    console.log(`✓ Configuration valid\n`);

    // Initialize embeddings
    console.log(`🔧 Initializing embeddings...`);
    const embeddings = createEmbeddings();
    console.log(`✓ Embeddings initialized\n`);

    // Initialize vector store
    console.log(`🔧 Initializing vector store...`);
    const vectorStore = new IncidentVectorStore(embeddings);
    await vectorStore.initialize();
    console.log(`✓ Vector store connected\n`);

    // Check if data exists
    const stats = await vectorStore.getStats();
    if (stats.count === 0) {
      console.log(`⚠️  No incidents found in database`);
      console.log(`💡 Run: npm run ingest\n`);
      await vectorStore.close();
      process.exit(1);
    }

    console.log(`📊 Database contains ${stats.count} incidents\n`);

    // Initialize retrieval pipeline
    const hybridConfig: HybridSearchConfig = {
      vectorWeight: config.search.hybridVectorWeight,
      keywordWeight: config.search.hybridKeywordWeight,
    };
    const retrievalPipeline = new RetrievalPipeline(
      vectorStore.getCollection(),
      vectorStore,
      hybridConfig
    );

    // Test queries
    const testQueries = [
      "Application crashes on startup",
      "Network connectivity issues",
      "Database connection timeout",
    ];

    for (const query of testQueries) {
      console.log(`${"=".repeat(80)}`);
      console.log(`Query: "${query}"`);
      console.log(`${"=".repeat(80)}\n`);

      const traceId = `test-${Date.now()}`;
      const results = await retrievalPipeline.hybridSearch(query, 3, traceId);

      if (results.length === 0) {
        console.log(`No results found\n`);
        continue;
      }

      results.forEach((result, index) => {
        console.log(`${index + 1}. [${result.incidentId}] ${result.summary}`);
        console.log(`   Score: ${result.score.toFixed(4)}`);
        console.log(`   Match Type: ${result.matchType}`);
        console.log(`   Status: ${result.metadata?.status} | Priority: ${result.metadata?.priority}`);
        console.log(``);
      });
    }

    // Cleanup
    await vectorStore.close();

    console.log(`${"=".repeat(80)}`);
    console.log(`✅ TEST COMPLETE`);
    console.log(`${"=".repeat(80)}\n`);

    process.exit(0);
  } catch (error) {
    console.error(`\n❌ Test failed:`, error);
    process.exit(1);
  }
}

main();

