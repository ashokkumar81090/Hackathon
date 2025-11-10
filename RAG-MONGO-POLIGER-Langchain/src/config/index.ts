import * as dotenv from "dotenv";

dotenv.config();

/**
 * Centralized configuration for the RAG Incidents application
 */
export const config = {
  // MongoDB Configuration
  mongodb: {
    uri: process.env.MONGODB_URI || "",
    dbName: process.env.DB_NAME || "incidents_db",
    collectionName: process.env.COLLECTION_NAME || "incidents",
    vectorIndexName: process.env.VECTOR_INDEX_NAME || "vector_index_incidents",
    bm25IndexName: process.env.BM25_INDEX_NAME || "BM25_incidents",
  },

  // Embeddings Configuration
  embeddings: {
    provider: (process.env.EMBEDDINGS_PROVIDER || "mistral").toLowerCase() as "openai" | "mistral",
    
    // OpenAI Embeddings (3072D for text-embedding-3-large)
    openai: {
      apiKey: process.env.OPENAI_API_KEY || "",
      model: process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-large",
      dimensions: Number(process.env.OPENAI_EMBEDDING_DIMENSIONS) || 3072,
    },
    
    // Mistral Embeddings (1024D for mistral-embed)
    mistral: {
      apiKey: process.env.MISTRAL_API_KEY || "",
      model: process.env.MISTRAL_EMBEDDING_MODEL || "mistral-embed",
      dimensions: Number(process.env.MISTRAL_EMBEDDING_DIMENSIONS) || 1024,
    },
  },

  // LLM Model Configuration
  llm: {
    provider: (process.env.MODEL_PROVIDER || "groq").toLowerCase(),
    temperature: Number(process.env.TEMPERATURE) || 0.1,
    maxTokens: Number(process.env.MAX_TOKENS) || 4096,
    
    // Provider-specific configs
    openai: {
      apiKey: process.env.OPENAI_API_KEY || "",
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    },
    groq: {
      apiKey: process.env.GROQ_API_KEY || "",
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY || "",
      model: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022",
    },
  },

  // Server Configuration
  server: {
    port: Number(process.env.PORT) || 3001,
  },

  // Search Configuration
  search: {
    defaultTopK: Number(process.env.DEFAULT_TOP_K) || 5,
    hybridVectorWeight: Number(process.env.HYBRID_VECTOR_WEIGHT) || 0.6,
    hybridKeywordWeight: Number(process.env.HYBRID_KEYWORD_WEIGHT) || 0.4,
  },
};

/**
 * Validate required configuration
 * @param options - Validation options
 *   - skipLLM: Skip LLM provider validation (useful for ingestion-only tasks)
 */
export function validateConfig(options: { skipLLM?: boolean } = {}): void {
  const errors: string[] = [];

  if (!config.mongodb.uri) {
    errors.push("MONGODB_URI is required");
  }

  // Validate embeddings provider
  const embeddingsProvider = config.embeddings.provider;
  if (embeddingsProvider === "openai") {
    if (!config.embeddings.openai.apiKey) {
      errors.push("OPENAI_API_KEY is required when EMBEDDINGS_PROVIDER=openai");
    }
  } else if (embeddingsProvider === "mistral") {
    if (!config.embeddings.mistral.apiKey) {
      errors.push("MISTRAL_API_KEY is required when EMBEDDINGS_PROVIDER=mistral");
    }
  } else {
    errors.push(`Invalid EMBEDDINGS_PROVIDER: ${embeddingsProvider}. Must be 'openai' or 'mistral'`);
  }

  // Validate LLM provider configuration (unless skipped)
  if (!options.skipLLM) {
    const provider = config.llm.provider;
    if (provider === "openai" && !config.llm.openai.apiKey) {
      errors.push("OPENAI_API_KEY is required when MODEL_PROVIDER=openai");
    } else if (provider === "groq" && !config.llm.groq.apiKey) {
      errors.push("GROQ_API_KEY is required when MODEL_PROVIDER=groq");
    } else if (provider === "anthropic" && !config.llm.anthropic.apiKey) {
      errors.push("ANTHROPIC_API_KEY is required when MODEL_PROVIDER=anthropic");
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `Configuration validation failed:\n${errors.map((e) => `  - ${e}`).join("\n")}`
    );
  }
}

