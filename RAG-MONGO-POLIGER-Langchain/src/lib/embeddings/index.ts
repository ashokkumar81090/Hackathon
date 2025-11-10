import { Embeddings } from "@langchain/core/embeddings";
import { config } from "../../config/index.js";
import { IncidentEmbeddings as OpenAIIncidentEmbeddings } from "./openaiEmbeddings.js";
import { MistralIncidentEmbeddings } from "./mistralEmbeddings.js";

export { IncidentEmbeddings } from "./openaiEmbeddings.js";
export { MistralIncidentEmbeddings } from "./mistralEmbeddings.js";

/**
 * Factory function to create embeddings instance based on configuration
 */
export function createEmbeddings(): Embeddings {
  const provider = config.embeddings.provider;
  
  switch (provider) {
    case "openai":
      console.log(`[Embeddings] Using OpenAI provider`);
      return new OpenAIIncidentEmbeddings();
    
    case "mistral":
      console.log(`[Embeddings] Using Mistral AI provider`);
      return new MistralIncidentEmbeddings();
    
    default:
      throw new Error(
        `Unsupported embeddings provider: ${provider}. Use 'openai' or 'mistral'`
      );
  }
}

