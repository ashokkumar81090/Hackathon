// Test the retrieval pipeline
import { createEmbeddings } from './src/lib/embeddings/index.ts';
import { IncidentVectorStore } from './src/lib/vectorstore/index.ts';
import { VectorSearchEngine } from './src/pipelines/retrieval/vectorSearch.ts';
import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
dotenv.config();

async function testRetrieval() {
  console.log('Testing Vector Search Engine...');

  try {
    // Initialize components
    const embeddings = createEmbeddings();
    const vectorStore = new IncidentVectorStore(embeddings);
    await vectorStore.initialize();

    const vectorEngine = new VectorSearchEngine(vectorStore);

    // Initialize MongoDB for traceId
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();

    const traceId = 'test-retrieval';
    const metadata = {
      traceId,
      startTime: Date.now(),
      searchType: 'vector'
    };

    // Test search
    const query = 'Salesforce application not responding';
    console.log(`\nSearching for: "${query}"`);

    const results = await vectorEngine.search(query, 5, metadata);
    console.log(`Results found: ${results.length}`);

    if (results.length > 0) {
      console.log('✅ Vector Search Engine working!');
      results.forEach((result, i) => {
        console.log(`${i+1}. ${result.incidentId}: ${result.summary} (score: ${result.score.toFixed(3)})`);
      });
    } else {
      console.log('❌ Vector Search Engine returned 0 results');
    }

    await client.close();

  } catch (error) {
    console.error('❌ Retrieval test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testRetrieval();
