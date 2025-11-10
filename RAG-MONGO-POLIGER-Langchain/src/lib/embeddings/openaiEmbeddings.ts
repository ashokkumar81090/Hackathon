import { Embeddings, EmbeddingsParams } from "@langchain/core/embeddings";
import { OpenAIEmbeddings } from "@langchain/openai";
import { config } from "../../config/index.js";

/**
 * OpenAI Embeddings wrapper with configuration
 * Model: text-embedding-3-large
 * Dimensions: 3072
 */
export class IncidentEmbeddings extends Embeddings {
  private embeddings: OpenAIEmbeddings;
  private dimensions: number;

  constructor(params?: EmbeddingsParams) {
    super(params || {});
    
    const apiKey = config.embeddings.openai.apiKey;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is required for embeddings");
    }

    this.dimensions = config.embeddings.openai.dimensions;
    
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: apiKey,
      modelName: config.embeddings.openai.model,
      dimensions: this.dimensions,
    });

    console.log(`[Embeddings] Initialized OpenAI embeddings: ${config.embeddings.openai.model} (${this.dimensions}D)`);
  }

  /**
   * Embed a single query text
   */
  async embedQuery(text: string): Promise<number[]> {
    try {
      const embedding = await this.embeddings.embedQuery(text);
      
      // Validate dimension
      if (embedding.length !== this.dimensions) {
        throw new Error(
          `Expected embedding dimension ${this.dimensions}, got ${embedding.length}`
        );
      }
      
      return embedding;
    } catch (error) {
      throw new Error(
        `Failed to embed query: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Embed multiple documents with batch processing
   */
  async embedDocuments(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) {
      return [];
    }

    try {
      const embeddings = await this.embeddings.embedDocuments(texts);
      
      // Validate all dimensions
      for (const embedding of embeddings) {
        if (embedding.length !== this.dimensions) {
          throw new Error(
            `Expected embedding dimension ${this.dimensions}, got ${embedding.length}`
          );
        }
      }
      
      return embeddings;
    } catch (error) {
      throw new Error(
        `Failed to embed documents: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get embedding dimensions
   */
  getDimensions(): number {
    return this.dimensions;
  }
}

/**
 * Factory function to create embeddings instance
 */
export function createEmbeddings(): IncidentEmbeddings {
  return new IncidentEmbeddings();
}

