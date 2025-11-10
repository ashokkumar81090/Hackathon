/**
 * Core Incident interface representing an IT incident
 */
export interface Incident {
  incidentId: string;
  summary: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  assignee?: string;
  reporter?: string;
  createdDate: string;
  resolvedDate?: string;
  resolutionSteps?: string;
  rootCause?: string;
  impact?: string;
  urgency?: string;
  environment?: string;
  component?: string;
  team?: string;
}

/**
 * Incident document stored in MongoDB with embeddings and metadata
 */
export interface IncidentDocument extends Incident {
  embedding?: number[];
  searchableText: string;
  embeddingMetadata?: {
    model: string;
    dimensions: number;
    provider: string;
    generatedAt: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Search result item with relevance score
 */
export interface IncidentSearchResult {
  incident: Incident;
  score: number;
  matchType: "vector" | "keyword" | "hybrid";
  content: string;
}

/**
 * Recommendations for IT team based on resolution analysis
 */
export interface ITRecommendations {
  summary: string;
  keySteps: string[];
  bestPractices: string[];
  preventiveMeasures: string[];
  priority: "High" | "Medium" | "Low";
}

/**
 * RAG query result with context
 */
export interface RAGQueryResult {
  query: string;
  answer: string;
  relevantIncidents: IncidentSearchResult[];
  recommendations?: ITRecommendations;
  metadata: {
    searchMethod: "vector" | "keyword" | "hybrid";
    processingTime: number;
    model: string;
    timestamp: string;
  };
}

