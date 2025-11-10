// Test the vector store search method
import { createEmbeddings } from './src/lib/embeddings/index.ts';
import { IncidentVectorStore } from './src/lib/vectorstore/index.ts';

async function testVectorStore() {
  console.log('Testing IncidentVectorStore...');

  try {
    // Initialize embeddings
    const embeddings = createEmbeddings();
    console.log('✅ Embeddings initialized');

    // Initialize vector store
    const vectorStore = new IncidentVectorStore(embeddings);
    await vectorStore.initialize();
    console.log('✅ Vector store initialized');

    // Test search
    const query = 'Salesforce application not responding';
    console.log(`\nSearching for: "${query}"`);

    const results = await vectorStore.searchWithScores(query, 5);
    console.log(`Results found: ${results.length}`);

    if (results.length > 0) {
      console.log('✅ Vector store search working!');
      results.forEach(([doc, score], i) => {
        console.log(`${i+1}. ${doc.metadata.incidentId}: ${doc.metadata.summary} (score: ${score.toFixed(3)})`);
      });
    } else {
      console.log('❌ Vector store returned 0 results');
    }

  } catch (error) {
    console.error('❌ Vector store test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testVectorStore();
