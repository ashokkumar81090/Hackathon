/**
 * Configuration for hybrid search
 */
export interface HybridSearchConfig {
  vectorWeight: number;
  keywordWeight: number;
}

/**
 * Search metadata for tracing
 */
export interface SearchMetadata {
  traceId: string;
  startTime: number;
  searchType: string;
}

export interface SearchFilters {
  incidentId?: string;
  category?: string;
  status?: string;
  priority?: string;
}

/**
 * Search result item
 */
export interface SearchResultItem {
  incidentId: string;
  summary: string;
  description: string;
  content: string;
  score: number;
  matchType: "vector" | "keyword" | "hybrid";
  metadata?: {
    status?: string;
    priority?: string;
    category?: string;
    rootCause?: string;
    resolutionSteps?: string;
    [key: string]: unknown;
  };
}

