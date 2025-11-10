#!/usr/bin/env node
import { MongoClient } from "mongodb";
import { config } from "../config/index.js";

/**
 * Check if embeddings are present in MongoDB documents
 */
async function main() {
  const client = new MongoClient(config.mongodb.uri);
  
  try {
    console.log(`\n${"=".repeat(80)}`);
    console.log(`📊 CHECKING EMBEDDINGS IN MONGODB`);
    console.log(`${"=".repeat(80)}\n`);

    await client.connect();
    console.log(`✅ Connected to MongoDB\n`);

    const collection = client
      .db(config.mongodb.dbName)
      .collection(config.mongodb.collectionName);

    // Get total count
    const totalCount = await collection.countDocuments();
    console.log(`📈 Total documents in collection: ${totalCount}\n`);

    // Get a sample document
    const sampleDoc = await collection.findOne({});
    
    if (!sampleDoc) {
      console.log(`⚠️  No documents found in collection`);
      return;
    }

    console.log(`📄 Sample Document Structure:`);
    console.log(`${"=".repeat(80)}`);
    
    // Show document structure
    console.log(`\n🔑 Document Keys:`);
    console.log(Object.keys(sampleDoc).join(", "));
    
    // Check for embedding field
    console.log(`\n🎯 Embedding Field Check:`);
    if (sampleDoc.embedding) {
      console.log(`✅ Embedding field exists!`);
      console.log(`   - Type: ${Array.isArray(sampleDoc.embedding) ? 'Array' : typeof sampleDoc.embedding}`);
      if (Array.isArray(sampleDoc.embedding)) {
        console.log(`   - Dimensions: ${sampleDoc.embedding.length}`);
        console.log(`   - First 5 values: [${sampleDoc.embedding.slice(0, 5).join(", ")}...]`);
      }
    } else {
      console.log(`❌ Embedding field NOT found`);
    }

    // Check for other important fields
    console.log(`\n📋 Other Important Fields:`);
    console.log(`   - _id: ${sampleDoc._id ? '✅' : '❌'}`);
    console.log(`   - searchableText: ${sampleDoc.searchableText ? '✅' : '❌'} ${sampleDoc.searchableText ? `(${sampleDoc.searchableText.length} chars)` : ''}`);
    console.log(`   - pageContent: ${sampleDoc.pageContent ? '✅' : '❌'} ${sampleDoc.pageContent ? `(${sampleDoc.pageContent.length} chars)` : ''}`);
    console.log(`   - text: ${sampleDoc.text ? '✅' : '❌'}`);
    console.log(`   - metadata: ${sampleDoc.metadata ? '✅' : '❌'}`);

    // Check documents with embeddings
    const docsWithEmbeddings = await collection.countDocuments({ 
      embedding: { $exists: true, $ne: null } 
    });
    console.log(`\n📊 Documents with embeddings: ${docsWithEmbeddings} / ${totalCount}`);

    if (docsWithEmbeddings === 0) {
      console.log(`\n⚠️  WARNING: No embeddings found in any documents!`);
      console.log(`\n🔍 Sample document (first 1000 chars):`);
      console.log(JSON.stringify(sampleDoc, null, 2).substring(0, 1000));
    }

    // Check a few more documents
    console.log(`\n🔍 Checking first 3 documents for embedding field...`);
    const sampleDocs = await collection.find({}).limit(3).toArray();
    sampleDocs.forEach((doc, idx) => {
      const hasEmbedding = doc.embedding && Array.isArray(doc.embedding);
      const embeddingDim = hasEmbedding ? doc.embedding.length : 0;
      console.log(`   ${idx + 1}. ${doc.incidentId || doc._id}: ${hasEmbedding ? `✅ ${embeddingDim}D` : '❌ No embedding'}`);
    });

    console.log(`\n${"=".repeat(80)}\n`);

  } catch (error) {
    console.error(`\n❌ Error:`, error);
  } finally {
    await client.close();
    console.log(`✅ MongoDB connection closed\n`);
  }
}

main();

