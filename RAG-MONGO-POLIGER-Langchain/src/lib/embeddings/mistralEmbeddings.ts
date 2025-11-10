import { Embeddings, EmbeddingsParams } from "@langchain/core/embeddings";
import { MistralAIEmbeddings } from "@langchain/mistralai";
import { config } from "../../config/index.js";

/**
 * Mistral AI Embeddings wrapper with configuration
 * Model: mistral-embed
 * Dimensions: 1024
 */
export class MistralIncidentEmbeddings extends Embeddings {
  private embeddings: MistralAIEmbeddings;
  private dimensions: number;

  constructor(params?: EmbeddingsParams) {
    super(params || {});
    
    const apiKey = config.embeddings.mistral?.apiKey;
    if (!apiKey) {
      throw new Error("MISTRAL_API_KEY is required for Mistral embeddings");
    }

    this.dimensions = config.embeddings.mistral?.dimensions || 1024;
    
    this.embeddings = new MistralAIEmbeddings({
      apiKey: apiKey,
      model: config.embeddings.mistral?.model || "mistral-embed",
    });

    console.log(`[Embeddings] Initialized Mistral embeddings: ${config.embeddings.mistral?.model} (${this.dimensions}D)`);
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

