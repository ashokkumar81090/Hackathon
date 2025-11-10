import { IncidentSearchResult, RAGQueryResult } from "./incident.js";

/**
 * API Request/Response types
 */

// Health check
export interface HealthResponse {
  status: "ok" | "error";
  timestamp: string;
  version: string;
  services: {
    mongodb: boolean;
    vectorStore: boolean;
  };
}

// Search endpoint
export interface SearchApiRequest {
  query: string;
  searchType?: "vector" | "keyword" | "hybrid";
  topK?: number;
}

export interface SearchApiResponse {
  success: boolean;
  data?: {
    results: IncidentSearchResult[];
    metadata: {
      searchType: string;
      resultsCount: number;
      processingTime: number;
    };
  };
  error?: string;
}

// RAG Query endpoint
export interface RAGQueryApiRequest {
  query: string;
  searchType?: "vector" | "keyword" | "hybrid";
  topK?: number;
  filters?: {
    incidentId?: string;
    category?: string;
    status?: string;
    priority?: string;
  };
}

export interface RAGQueryApiResponse {
  success: boolean;
  data?: RAGQueryResult;
  error?: string;
}

// Stats endpoint
export interface StatsResponse {
  success: boolean;
  data?: {
    totalIncidents: number;
    dbSize: string;
    collectionName: string;
    vectorIndexName: string;
  };
  error?: string;
}

