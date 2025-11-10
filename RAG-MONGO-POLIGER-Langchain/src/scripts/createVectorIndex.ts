#!/usr/bin/env node
import { config } from "../config/index.js";

/**
 * Display instructions for creating MongoDB Atlas Vector Search Index
 */
function main() {
  const provider = config.embeddings.provider;
  const dimensions = provider === "openai" 
    ? config.embeddings.openai.dimensions 
    : config.embeddings.mistral.dimensions;
  const model = provider === "openai" 
    ? config.embeddings.openai.model 
    : config.embeddings.mistral.model;

  console.log(`\n${"=".repeat(80)}`);
  console.log(`📋 MONGODB ATLAS VECTOR SEARCH INDEX SETUP`);
  console.log(`${"=".repeat(80)}\n`);

  console.log(`Embeddings Provider: ${provider.toUpperCase()}`);
  console.log(`Model: ${model}`);
  console.log(`Dimensions: ${dimensions}\n`);
  console.log(`Database: ${config.mongodb.dbName}`);
  console.log(`Collection: ${config.mongodb.collectionName}`);
  console.log(`Index Name: ${config.mongodb.vectorIndexName}\n`);

  console.log(`📝 Steps to create the vector index:\n`);
  console.log(`1. Go to MongoDB Atlas → Your Cluster → "Atlas Search"`);
  console.log(`2. Click "Create Search Index" → "Atlas Vector Search"`);
  console.log(`3. Choose "JSON Editor" and use this configuration:\n`);

  const vectorIndexConfig = {
    fields: [
      {
        type: "vector",
        path: "embedding",
        numDimensions: dimensions,
        similarity: "cosine",
      },
      {
        type: "filter",
        path: "status",
      },
      {
        type: "filter",
        path: "priority",
      },
      {
        type: "filter",
        path: "category",
      },
      {
        type: "filter",
        path: "team",
      },
      {
        type: "filter",
        path: "environment",
      },
      {
        type: "filter",
        path: "component",
      },
      {
        type: "filter",
        path: "urgency",
      },
      {
        type: "filter",
        path: "impact",
      },
    ],
  };

  console.log(JSON.stringify(vectorIndexConfig, null, 2));

  console.log(`\n4. Index Name: ${config.mongodb.vectorIndexName}`);
  console.log(`5. Database: ${config.mongodb.dbName}`);
  console.log(`6. Collection: ${config.mongodb.collectionName}`);
  console.log(`7. Click "Create Search Index"\n`);
  
  console.log(`💡 Tip: You can also copy the configuration from:`);
  console.log(`   - mongodb-vector-index-${provider}.json\n`);

  console.log(`${"=".repeat(80)}`);
  console.log(`📋 MONGODB ATLAS SEARCH INDEX (BM25 KEYWORD SEARCH) SETUP`);
  console.log(`${"=".repeat(80)}\n`);

  console.log(`Index Name: incidents_bm25_index\n`);
  console.log(`For BM25 keyword search, create an Atlas Search index:\n`);
  console.log(`1. Go to MongoDB Atlas → Your Cluster → "Atlas Search"`);
  console.log(`2. Click "Create Search Index" → "Atlas Search" (NOT Vector Search)`);
  console.log(`3. Choose "JSON Editor" and use this configuration:\n`);

  const bm25IndexConfig = {
    mappings: {
      dynamic: false,
      fields: {
        searchableText: {
          type: "string",
          analyzer: "lucene.standard",
        },
        summary: {
          type: "string",
          analyzer: "lucene.standard",
        },
        description: {
          type: "string",
          analyzer: "lucene.standard",
        },
        resolutionSteps: {
          type: "string",
          analyzer: "lucene.standard",
        },
        rootCause: {
          type: "string",
          analyzer: "lucene.standard",
        },
        incidentId: {
          type: "string",
          analyzer: "lucene.keyword",
        },
        status: {
          type: "string",
          analyzer: "lucene.keyword",
        },
        priority: {
          type: "string",
          analyzer: "lucene.keyword",
        },
        category: {
          type: "string",
          analyzer: "lucene.keyword",
        },
        team: {
          type: "string",
          analyzer: "lucene.keyword",
        },
        assignee: {
          type: "string",
          analyzer: "lucene.keyword",
        },
        reporter: {
          type: "string",
          analyzer: "lucene.keyword",
        },
        environment: {
          type: "string",
          analyzer: "lucene.keyword",
        },
        component: {
          type: "string",
          analyzer: "lucene.keyword",
        },
        urgency: {
          type: "string",
          analyzer: "lucene.keyword",
        },
        impact: {
          type: "string",
          analyzer: "lucene.keyword",
        },
        createdDate: {
          type: "date",
        },
        resolvedDate: {
          type: "date",
        },
      },
    },
  };

  console.log(JSON.stringify(bm25IndexConfig, null, 2));

  console.log(`\n4. Index Name: incidents_bm25_index`);
  console.log(`5. Database: ${config.mongodb.dbName}`);
  console.log(`6. Collection: ${config.mongodb.collectionName}`);
  console.log(`7. Click "Create Search Index"\n`);
  
  console.log(`💡 Tip: You can also copy the configuration from:`);
  console.log(`   - mongodb-bm25-search-index.json\n`);

  console.log(`${"=".repeat(80)}`);
  console.log(`⏳ Note: Index creation may take a few minutes.`);
  console.log(`💡 After indexes are created, run: npm run ingest\n`);
}

main();

