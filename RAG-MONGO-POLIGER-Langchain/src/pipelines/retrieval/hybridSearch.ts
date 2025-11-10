import { KeywordSearchEngine } from "./keywordSearch.js";
import { VectorSearchEngine } from "./vectorSearch.js";
import { SearchResultItem, SearchMetadata, HybridSearchConfig, SearchFilters } from "./types.js";

/**
 * Hybrid search engine combining vector and keyword search
 * Uses weighted score fusion
 */
export class HybridSearchEngine {
  private keywordEngine: KeywordSearchEngine;
  private vectorEngine: VectorSearchEngine;
  private config: HybridSearchConfig;

  constructor(
    keywordEngine: KeywordSearchEngine,
    vectorEngine: VectorSearchEngine,
    config: HybridSearchConfig
  ) {
    this.keywordEngine = keywordEngine;
    this.vectorEngine = vectorEngine;
    this.config = config;

    // Validate weights sum to 1.0
    const totalWeight = this.config.vectorWeight + this.config.keywordWeight;
    if (Math.abs(totalWeight - 1.0) > 0.01) {
      console.warn(
        `[Hybrid Search] Weights don't sum to 1.0 (got ${totalWeight}). ` +
          `Using: vector=${this.config.vectorWeight}, keyword=${this.config.keywordWeight}`
      );
    }
  }

  /**
   * Perform hybrid search combining vector and keyword results
   */
  async search(
    query: string,
    topK: number,
    metadata: SearchMetadata,
    filters?: SearchFilters
  ): Promise<SearchResultItem[]> {
    console.log(`[${metadata.traceId}] [Hybrid Search] Query: "${query}", TopK: ${topK}`);
    console.log(
      `[${metadata.traceId}] [Hybrid Search] Weights: Vector=${this.config.vectorWeight}, ` +
        `Keyword=${this.config.keywordWeight}`
    );
    
    if (filters && Object.keys(filters).length > 0) {
      console.log(`[${metadata.traceId}] [Hybrid Search] Applying filters:`, JSON.stringify(filters));
    }

    const startTime = Date.now();

    try {
      // Fetch more results from each engine for better merging
      const fetchSize = topK * 3;

      // Perform both searches in parallel
      // Note: Filters are only applied to vector search (BM25 doesn't support MongoDB filters)
      const [vectorResults, keywordResults] = await Promise.all([
        this.vectorEngine.search(query, fetchSize, metadata, filters),
        this.keywordEngine.search(query, fetchSize, metadata),
      ]);

      console.log(
        `[${metadata.traceId}] [Hybrid Search] Retrieved: ` +
          `${vectorResults.length} vector, ${keywordResults.length} keyword`
      );

      // Normalize scores before merging
      const normalizedVectorResults = this.normalizeScores(vectorResults);
      const normalizedKeywordResults = this.normalizeScores(keywordResults);

      // Merge and score results
      let mergedResults = this.mergeResults(
        normalizedVectorResults,
        normalizedKeywordResults
      );

      // Apply status filtering to final results
      // For hybrid search, ALWAYS filter to show only Resolved and Closed incidents
      mergedResults = mergedResults.filter(result =>
        result.metadata?.status === 'Resolved' || result.metadata?.status === 'Closed'
      );
      console.log(
        `[${metadata.traceId}] [Hybrid Search] Applied automatic Resolved/Closed filter, ` +
          `remaining results: ${mergedResults.length}`
      );

      // Sort by hybrid score and return topK
      const topResults = mergedResults
        .sort((a, b) => b.score - a.score)
        .slice(0, topK);

      const duration = Date.now() - startTime;
      console.log(
        `[${metadata.traceId}] [Hybrid Search] Completed in ${duration}ms, ` +
          `returning ${topResults.length} results`
      );

      if (topResults.length > 0) {
        console.log(
          `[${metadata.traceId}] [Hybrid Search] Top result: ` +
            `"${topResults[0].incidentId}" (score: ${topResults[0].score.toFixed(3)})`
        );
      }

      return topResults;
    } catch (error) {
      console.error(`[${metadata.traceId}] [Hybrid Search] Error:`, error);
      throw new Error(
        `Hybrid search failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Normalize scores to 0-1 range
   */
  private normalizeScores(results: SearchResultItem[]): SearchResultItem[] {
    if (results.length === 0) return [];

    const scores = results.map((r) => r.score);
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);
    const range = maxScore - minScore;

    if (range === 0) {
      // All scores are the same
      return results.map((r) => ({ ...r, score: 1.0 }));
    }

    return results.map((r) => ({
      ...r,
      score: (r.score - minScore) / range,
    }));
  }

  /**
   * Merge vector and keyword results with weighted scoring
   */
  private mergeResults(
    vectorResults: SearchResultItem[],
    keywordResults: SearchResultItem[]
  ): SearchResultItem[] {
    // Create a map to merge results by incidentId
    const mergedMap = new Map<string, SearchResultItem>();

    // Add vector results with weighted scores
    vectorResults.forEach((result) => {
      const weightedScore = result.score * this.config.vectorWeight;

      mergedMap.set(result.incidentId, {
        ...result,
        score: weightedScore,
        matchType: "hybrid",
      });
    });

    // Merge keyword results
    keywordResults.forEach((result) => {
      const weightedScore = result.score * this.config.keywordWeight;

      if (mergedMap.has(result.incidentId)) {
        // Document found in both searches - combine scores
        const existing = mergedMap.get(result.incidentId)!;
        existing.score = existing.score + weightedScore;

        // Use the longer content snippet (more context)
        if (result.content.length > existing.content.length) {
          existing.content = result.content;
        }
      } else {
        // Document only in keyword search
        mergedMap.set(result.incidentId, {
          ...result,
          score: weightedScore,
          matchType: "hybrid",
        });
      }
    });

    return Array.from(mergedMap.values());
  }

  /**
   * Update hybrid search weights
   */
  updateWeights(vectorWeight: number, keywordWeight: number): void {
    this.config.vectorWeight = vectorWeight;
    this.config.keywordWeight = keywordWeight;

    console.log(
      `[Hybrid Search] Weights updated: vector=${vectorWeight}, keyword=${keywordWeight}`
    );
  }

  /**
   * Get current weights
   */
  getWeights(): HybridSearchConfig {
    return { ...this.config };
  }
}

