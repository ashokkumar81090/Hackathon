import express, { Request, Response } from "express";
import { config, validateConfig } from "./config/index.js";
import { createEmbeddings } from "./lib/embeddings/index.js";
import { createChatModel, getModelInfo } from "./lib/models/index.js";
import { IncidentVectorStore } from "./lib/vectorstore/index.js";
import { IncidentRAGChain } from "./lib/chain.js";
import { RetrievalPipeline, HybridSearchConfig } from "./pipelines/retrieval/index.js";
import {
  SearchApiRequest,
  SearchApiResponse,
  RAGQueryApiRequest,
  RAGQueryApiResponse,
  HealthResponse,
  StatsResponse,
} from "./types/index.js";

/**
 * Initialize the RAG system
 */
async function initializeSystem() {
  console.log(`\n${"=".repeat(80)}`);
  console.log(`🚀 INITIALIZING INCIDENT RAG SYSTEM (LangChain)`);
  console.log(`${"=".repeat(80)}\n`);

  // Validate configuration
  console.log(`⚙️  Validating configuration...`);
  validateConfig();
  console.log(`✓ Configuration valid\n`);

  // Initialize embeddings
  const embeddingsProvider = config.embeddings.provider;
  const embeddingsModel = embeddingsProvider === "openai" 
    ? config.embeddings.openai.model 
    : config.embeddings.mistral.model;
  const embeddingsDim = embeddingsProvider === "openai" 
    ? config.embeddings.openai.dimensions 
    : config.embeddings.mistral.dimensions;
  console.log(
    `🔧 Initializing ${embeddingsProvider.toUpperCase()} embeddings (${embeddingsModel}, ${embeddingsDim}D)...`
  );
  const embeddings = createEmbeddings();
  console.log(`✓ Embeddings initialized\n`);

  // Initialize vector store
  console.log(`🔧 Initializing vector store...`);
  const vectorStore = new IncidentVectorStore(embeddings);
  await vectorStore.initialize();
  console.log(`✓ Vector store connected\n`);

  // Initialize LLM
  console.log(`🤖 Initializing LLM...`);
  const chatModel = createChatModel();
  const modelInfo = getModelInfo();
  console.log(
    `✓ LLM initialized: ${modelInfo.provider}/${modelInfo.model} (temp: ${modelInfo.temperature})\n`
  );

  // Initialize retrieval pipeline
  console.log(`🔍 Initializing retrieval pipeline...`);
  const hybridConfig: HybridSearchConfig = {
    vectorWeight: config.search.hybridVectorWeight,
    keywordWeight: config.search.hybridKeywordWeight,
  };
  const retrievalPipeline = new RetrievalPipeline(
    vectorStore.getCollection(),
    vectorStore,
    hybridConfig
  );
  console.log(`✓ Retrieval pipeline ready\n`);

  // Initialize RAG chain
  console.log(`⛓️  Initializing RAG chain...`);
  const ragChain = new IncidentRAGChain(chatModel, retrievalPipeline);
  console.log(`✓ RAG chain ready\n`);

  console.log(`${"=".repeat(80)}`);
  console.log(`✅ SYSTEM INITIALIZATION COMPLETE`);
  console.log(`${"=".repeat(80)}\n`);

  return { vectorStore, retrievalPipeline, ragChain };
}

/**
 * Main server setup
 */
async function main() {
  const app = express();
  app.use(express.json());

  // CORS middleware
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // Initialize system
  let vectorStore: IncidentVectorStore;
  let retrievalPipeline: RetrievalPipeline;
  let ragChain: IncidentRAGChain;

  try {
    const system = await initializeSystem();
    vectorStore = system.vectorStore;
    retrievalPipeline = system.retrievalPipeline;
    ragChain = system.ragChain;
  } catch (error) {
    console.error(`\n❌ Failed to initialize system:`, error);
    process.exit(1);
  }

  /**
   * Health check endpoint
   */
  app.get("/health", async (req: Request, res: Response<HealthResponse>) => {
    try {
      const stats = await vectorStore.getStats();
      res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        services: {
          mongodb: vectorStore.isReady(),
          vectorStore: stats.count > 0,
        },
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        services: {
          mongodb: false,
          vectorStore: false,
        },
      });
    }
  });

  /**
   * Search endpoint
   */
  app.post("/api/search", async (req: Request<{}, {}, SearchApiRequest>, res: Response<SearchApiResponse>) => {
    try {
      const { query, searchType = "hybrid", topK = config.search.defaultTopK } = req.body;

      if (!query) {
        return res.status(400).json({
          success: false,
          error: "Query is required",
        });
      }

      const traceId = `search-${Date.now()}`;
      const startTime = Date.now();

      const results = await retrievalPipeline.search(
        query,
        searchType,
        topK,
        traceId
      );

      const processingTime = Date.now() - startTime;

      res.json({
        success: true,
        data: {
          results: results.map((result) => ({
            incident: {
              incidentId: result.incidentId,
              summary: result.summary,
              description: result.description,
              status: result.metadata?.status as string,
              priority: result.metadata?.priority as string,
              category: result.metadata?.category as string,
              rootCause: result.metadata?.rootCause as string,
              resolutionSteps: result.metadata?.resolutionSteps as string,
              createdDate: result.metadata?.createdDate as string,
              resolvedDate: result.metadata?.resolvedDate as string,
            },
            score: result.score,
            matchType: result.matchType,
            content: result.content.substring(0, 500), // Truncate for response
          })),
          metadata: {
            searchType,
            resultsCount: results.length,
            processingTime,
          },
        },
      });
    } catch (error) {
      console.error("[API] Search error:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Search failed",
      });
    }
  });

  /**
   * RAG Query endpoint
   */
  app.post("/api/query", async (req: Request<{}, {}, RAGQueryApiRequest>, res: Response<RAGQueryApiResponse>) => {
    try {
      const { query, searchType = "hybrid", topK = config.search.defaultTopK, filters } = req.body;

      if (!query) {
        return res.status(400).json({
          success: false,
          error: "Query is required",
        });
      }

      const result = await ragChain.query(query, searchType, topK, filters);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("[API] Query error:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Query failed",
      });
    }
  });

  /**
   * Stats endpoint
   */
  app.get("/api/stats", async (req: Request, res: Response<StatsResponse>) => {
    try {
      const stats = await vectorStore.getStats();

      res.json({
        success: true,
        data: {
          totalIncidents: stats.count,
          dbSize: stats.dbSize,
          collectionName: config.mongodb.collectionName,
          vectorIndexName: config.mongodb.vectorIndexName,
        },
      });
    } catch (error) {
      console.error("[API] Stats error:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Failed to get stats",
      });
    }
  });

  // Start server
  const PORT = config.server.port;
  app.listen(PORT, () => {
    console.log(`\n${"=".repeat(80)}`);
    console.log(`🚀 SERVER RUNNING`);
    console.log(`${"=".repeat(80)}`);
    console.log(`\n📍 Endpoints:`);
    console.log(`   - Health:      http://localhost:${PORT}/health`);
    console.log(`   - Search:      POST http://localhost:${PORT}/api/search`);
    console.log(`   - RAG Query:   POST http://localhost:${PORT}/api/query`);
    console.log(`   - Stats:       GET http://localhost:${PORT}/api/stats`);
    const embProvider = config.embeddings.provider;
    const embModel = embProvider === "openai" ? config.embeddings.openai.model : config.embeddings.mistral.model;
    const embDim = embProvider === "openai" ? config.embeddings.openai.dimensions : config.embeddings.mistral.dimensions;
    console.log(`\n⚙️  Configuration:`);
    console.log(`   - Model:       ${getModelInfo().provider}/${getModelInfo().model}`);
    console.log(`   - Embeddings:  ${embProvider}/${embModel} (${embDim}D)`);
    console.log(`   - Database:    ${config.mongodb.dbName}`);
    console.log(`   - Collection:  ${config.mongodb.collectionName}`);
    console.log(`${"=".repeat(80)}\n`);
  });
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n\n🛑 Shutting down gracefully...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n\n🛑 Shutting down gracefully...");
  process.exit(0);
});

main();

