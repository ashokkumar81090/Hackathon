/**
 * Search request parameters
 */
export interface SearchRequest {
  query: string;
  searchType: "vector" | "keyword" | "hybrid";
  topK?: number;
  filters?: SearchFilters;
}

/**
 * Filters for search queries
 */
export interface SearchFilters {
  status?: string;
  priority?: string;
  category?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

/**
 * Search metadata for tracing and debugging
 */
export interface SearchMetadata {
  traceId: string;
  startTime: number;
  searchType: string;
}

/**
 * Generic search result item
 */
export interface SearchResultItem {
  fileName: string; // Using fileName for consistency with qa-bot, stores incidentId
  content: string;
  score: number;
  matchType: "vector" | "keyword" | "hybrid";
  metadata?: Record<string, unknown>;
}

