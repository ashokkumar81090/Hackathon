import { IncidentVectorStore } from "../../lib/vectorstore/index.js";
import { SearchResultItem, SearchMetadata, SearchFilters } from "./types.js";

/**
 * Vector search engine using MongoDB Atlas Vector Search via LangChain
 */
export class VectorSearchEngine {
  constructor(private vectorStore: IncidentVectorStore) {}

  async search(
    query: string,
    topK: number,
    metadata: SearchMetadata,
    filters?: SearchFilters
  ): Promise<SearchResultItem[]> {
    const { traceId } = metadata;
    console.log(`[${traceId}] [Vector Search] Searching for: "${query}"`);
    
    if (filters && Object.keys(filters).length > 0) {
      console.log(`[${traceId}] [Vector Search] Applying filters:`, JSON.stringify(filters));
    }

    try {
      // Convert SearchFilters to Record<string, string> format for MongoDB
      const mongoFilters = filters && Object.keys(filters).length > 0
        ? Object.fromEntries(
            Object.entries(filters).filter(([_, value]) => value !== undefined && value !== "")
          )
        : undefined;
      
      const results = await this.vectorStore.searchWithScores(query, topK, mongoFilters);

      const searchResults: SearchResultItem[] = results.map(([doc, score]) => {
        const meta = doc.metadata;
        
        return {
          incidentId: meta.incidentId as string,
          summary: meta.summary as string,
          description: meta.description as string,
          content: doc.pageContent,
          score,
          matchType: "vector",
          metadata: {
            status: meta.status as string,
            priority: meta.priority as string,
            category: meta.category as string,
            rootCause: meta.rootCause as string,
            resolutionSteps: meta.resolutionSteps as string,
            createdDate: meta.createdDate as string,
            resolvedDate: meta.resolvedDate as string,
          },
        };
      });

      console.log(
        `[${traceId}] [Vector Search] Found ${searchResults.length} results`
      );
      
      if (searchResults.length > 0) {
        console.log(
          `[${traceId}] [Vector Search] Top result: "${searchResults[0].incidentId}" (score: ${searchResults[0].score.toFixed(3)})`
        );
      }

      return searchResults;
    } catch (error) {
      console.error(`[${traceId}] [Vector Search] Error:`, error);
      throw new Error(
        `Vector search failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}

