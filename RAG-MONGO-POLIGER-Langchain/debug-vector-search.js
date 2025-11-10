// Test vector search directly
import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
dotenv.config();

async function testVectorSearch() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db('incidents_db');
  const collection = db.collection('incidents');

  console.log('Testing vector search...');

  try {
    // Test 1: Basic vector search with a simple vector
    const pipeline = [
      {
        $vectorSearch: {
          index: 'vector_index_incidents',
          path: 'embedding',
          queryVector: new Array(1024).fill(0.1), // Simple test vector
          numCandidates: 100,
          limit: 5
        }
      },
      {
        $project: {
          incidentId: 1,
          summary: 1,
          score: { $meta: 'vectorSearchScore' },
          _id: 0
        }
      }
    ];

    const results = await collection.aggregate(pipeline).toArray();
    console.log('Vector search results:', results.length);
    if (results.length > 0) {
      console.log('Sample result:', results[0]);
      console.log('All results:');
      results.forEach((result, i) => {
        console.log(`${i+1}. ${result.incidentId}: ${result.summary} (score: ${result.score.toFixed(3)})`);
      });
    } else {
      console.log('❌ No results found with basic vector search!');
    }

  } catch (error) {
    console.error('❌ Vector search error:', error.message);
    if (error.message.includes('index')) {
      console.error('This might be an index issue');
    }
  } finally {
    await client.close();
  }
}

testVectorSearch();
