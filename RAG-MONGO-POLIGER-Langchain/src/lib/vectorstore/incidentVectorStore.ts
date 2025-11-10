import { Document } from "@langchain/core/documents";
import { Embeddings } from "@langchain/core/embeddings";
import { MongoClient } from "mongodb";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { Incident, IncidentDocument } from "../../types/index.js";
import { config } from "../../config/index.js";

/**
 * LangChain MongoDB Vector Store for Incident Management
 * Supports multiple embedding providers (Mistral AI, OpenAI)
 */
export class IncidentVectorStore {
  private client: MongoClient;
  private vectorStore: MongoDBAtlasVectorSearch | null = null;
  private embeddings: Embeddings;
  private isConnected = false;

  constructor(embeddings: Embeddings) {
    this.embeddings = embeddings;
    this.client = new MongoClient(config.mongodb.uri);
  }

  /**
   * Initialize the vector store connection
   */
  async initialize(): Promise<void> {
    try {
      console.log(`[Vector Store] Connecting to MongoDB...`);
      await this.client.connect();
      
      const collection = this.client
        .db(config.mongodb.dbName)
        .collection(config.mongodb.collectionName);

      // Initialize LangChain MongoDB Atlas Vector Search
      this.vectorStore = new MongoDBAtlasVectorSearch(this.embeddings, {
        collection,
        indexName: config.mongodb.vectorIndexName,
        textKey: "searchableText",
        embeddingKey: "embedding",
      });

      this.isConnected = true;
      console.log(
        `[Vector Store] Connected to ${config.mongodb.dbName}.${config.mongodb.collectionName}`
      );
      console.log(`[Vector Store] Using index: ${config.mongodb.vectorIndexName}`);
    } catch (error) {
      throw new Error(
        `Failed to initialize vector store: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Create searchable text from incident data
   */
  private createSearchableText(incident: Incident): string {
    return `
Incident ID: ${incident.incidentId}
Summary: ${incident.summary}
Description: ${incident.description}
Status: ${incident.status}
Priority: ${incident.priority}
Category: ${incident.category}
Assignee: ${incident.assignee || "N/A"}
Reporter: ${incident.reporter || "N/A"}
Created Date: ${incident.createdDate}
Resolved Date: ${incident.resolvedDate || "N/A"}
Resolution Steps: ${incident.resolutionSteps || "N/A"}
Root Cause: ${incident.rootCause || "N/A"}
Impact: ${incident.impact || "N/A"}
Urgency: ${incident.urgency || "N/A"}
Environment: ${incident.environment || "N/A"}
Component: ${incident.component || "N/A"}
Team: ${incident.team || "N/A"}
    `.trim();
  }

  /**
   * Add incidents with automatic embedding generation
   */
  async addIncidents(incidents: Incident[]): Promise<void> {
    if (!this.vectorStore) {
      throw new Error("Vector store not initialized. Call initialize() first.");
    }

    if (incidents.length === 0) {
      console.log("[Vector Store] No incidents to add");
      return;
    }

    try {
      console.log(`[Vector Store] Processing ${incidents.length} incidents...`);
      const startTime = Date.now();

      // Convert to LangChain Documents
      const documents = incidents.map((incident) => {
        const searchableText = this.createSearchableText(incident);
        
        return new Document({
          pageContent: searchableText,
          metadata: {
            ...incident,
            processedAt: new Date().toISOString(),
          },
        });
      });

      // LangChain automatically generates embeddings
      await this.vectorStore.addDocuments(documents);

      const duration = Date.now() - startTime;
      console.log(
        `[Vector Store] ✓ Added ${incidents.length} incidents with embeddings (${duration}ms)`
      );
    } catch (error) {
      throw new Error(
        `Failed to add incidents: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Add incidents in batches for better performance
   */
  async addIncidentsBatch(
    incidents: Incident[],
    batchSize: number = 10
  ): Promise<void> {
    if (!this.vectorStore) {
      throw new Error("Vector store not initialized. Call initialize() first.");
    }

    if (incidents.length === 0) {
      console.log("[Vector Store] No incidents to add");
      return;
    }

    console.log(
      `[Vector Store] Processing ${incidents.length} incidents in batches of ${batchSize}...`
    );
    const startTime = Date.now();

    let successCount = 0;
    let failureCount = 0;

    // Process in batches
    for (let i = 0; i < incidents.length; i += batchSize) {
      const batch = incidents.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(incidents.length / batchSize);

      try {
        await this.addIncidents(batch);
        console.log(
          `[Vector Store] ✓ Batch ${batchNum}/${totalBatches} completed (${batch.length} incidents)`
        );
        successCount += batch.length;
      } catch (error) {
        console.error(
          `[Vector Store] ✗ Batch ${batchNum} failed:`,
          error instanceof Error ? error.message : String(error)
        );
        failureCount += batch.length;
      }
    }

    const duration = Date.now() - startTime;
    console.log(`\n[Vector Store] ✓ Batch processing complete:`);
    console.log(`  - Successful: ${successCount} incidents`);
    console.log(`  - Failed: ${failureCount} incidents`);
    console.log(`  - Duration: ${duration}ms`);

    if (failureCount > 0) {
      throw new Error(`${failureCount} incidents failed during processing`);
    }
  }

  /**
   * Semantic search across incidents
   */
  async searchIncidents(query: string, topK: number = 5): Promise<Document[]> {
    if (!this.vectorStore) {
      throw new Error("Vector store not initialized. Call initialize() first.");
    }

    try {
      const results = await this.vectorStore.similaritySearch(query, topK);
      return results;
    } catch (error) {
      throw new Error(
        `Search failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Semantic search with relevance scores
   */
  async searchWithScores(
    query: string,
    topK: number = 5,
    filters?: Record<string, string>
  ): Promise<Array<[Document, number]>> {
    if (!this.vectorStore) {
      throw new Error("Vector store not initialized. Call initialize() first.");
    }

    try {
      // If filters are provided, use filtered search
      if (filters && Object.keys(filters).length > 0) {
        const results = await this.vectorStore.similaritySearchWithScore(
          query,
          topK,
          filters
        );
        return results;
      }
      
      // Otherwise, use regular search
      const results = await this.vectorStore.similaritySearchWithScore(
        query,
        topK
      );
      return results;
    } catch (error) {
      throw new Error(
        `Search failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Clear all documents from the collection
   */
  async clearCollection(): Promise<void> {
    try {
      const collection = this.client
        .db(config.mongodb.dbName)
        .collection(config.mongodb.collectionName);

      const result = await collection.deleteMany({});
      console.log(
        `[Vector Store] Cleared ${result.deletedCount} documents from collection`
      );
    } catch (error) {
      throw new Error(
        `Failed to clear collection: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Get collection statistics
   */
  async getStats(): Promise<{ count: number; dbSize: string }> {
    try {
      const collection = this.client
        .db(config.mongodb.dbName)
        .collection(config.mongodb.collectionName);

      const count = await collection.countDocuments();
      const stats = await this.client.db(config.mongodb.dbName).stats();

      return {
        count,
        dbSize: `${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`,
      };
    } catch (error) {
      throw new Error(
        `Failed to get stats: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Get the underlying vector store for advanced operations
   */
  getVectorStore(): MongoDBAtlasVectorSearch {
    if (!this.vectorStore) {
      throw new Error("Vector store not initialized. Call initialize() first.");
    }
    return this.vectorStore;
  }

  /**
   * Get MongoDB collection for direct access
   */
  getCollection() {
    return this.client
      .db(config.mongodb.dbName)
      .collection(config.mongodb.collectionName);
  }

  /**
   * Check if vector store is connected
   */
  isReady(): boolean {
    return this.isConnected && this.vectorStore !== null;
  }

  /**
   * Close the MongoDB connection
   */
  async close(): Promise<void> {
    await this.client.close();
    this.isConnected = false;
    console.log("[Vector Store] MongoDB connection closed");
  }
}

