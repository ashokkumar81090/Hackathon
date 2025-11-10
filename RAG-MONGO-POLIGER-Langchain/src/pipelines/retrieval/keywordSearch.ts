import { Collection } from "mongodb";
import { SearchResultItem, SearchMetadata } from "./types.js";
import { config } from "../../config/index.js";

/**
 * Keyword search engine using MongoDB Atlas Search (BM25)
 */
export class KeywordSearchEngine {
  constructor(private collection: Collection) {}

  async search(
    query: string,
    topK: number,
    metadata: SearchMetadata
  ): Promise<SearchResultItem[]> {
    const { traceId } = metadata;
    console.log(`[${traceId}] [Keyword Search] Searching for: "${query}"`);

    try {
      // MongoDB Atlas Search with BM25 scoring
      // Use compound query to handle both exact matches (incidentId) and fuzzy text search
      const pipeline = [
        {
          $search: {
            index: config.mongodb.bm25IndexName,
            compound: {
              should: [
                // Exact match for incidentId (keyword analyzer)
                {
                  text: {
                    query: query,
                    path: "incidentId",
                  },
                },
                // Exact matches for other keyword fields
                {
                  text: {
                    query: query,
                    path: [
                      "status",
                      "priority",
                      "category",
                      "subcategory",
                      "urgency",
                      "impact",
                      "assignee",
                      "reporter",
                      "team",
                    ],
                  },
                },
                // Fuzzy text search for content fields
                {
                  text: {
                    query: query,
                    path: [
                      "summary",
                      "description",
                      "rootCause",
                      "resolutionSteps",
                      "workNotes",
                      "searchableText",
                    ],
                    fuzzy: {
                      maxEdits: 1,
                    },
                  },
                },
              ],
              minimumShouldMatch: 1,
            },
          },
        },
        {
          $addFields: {
            score: { $meta: "searchScore" },
          },
        },
        {
          $limit: topK,
        },
        {
          $project: {
            _id: 0,
            incidentId: 1,
            summary: 1,
            description: 1,
            status: 1,
            priority: 1,
            category: 1,
            rootCause: 1,
            resolutionSteps: 1,
            createdDate: 1,
            resolvedDate: 1,
            searchableText: 1,
            score: 1,
          },
        },
      ];

      const results = await this.collection.aggregate(pipeline).toArray();

      const searchResults: SearchResultItem[] = results.map((doc: any) => {
        return {
          incidentId: doc.incidentId,
          summary: doc.summary,
          description: doc.description,
          content: doc.searchableText || doc.description,
          score: doc.score,
          matchType: "keyword",
          metadata: {
            status: doc.status,
            priority: doc.priority,
            category: doc.category,
            rootCause: doc.rootCause,
            resolutionSteps: doc.resolutionSteps,
            createdDate: doc.createdDate,
            resolvedDate: doc.resolvedDate,
          },
        };
      });

      console.log(
        `[${traceId}] [Keyword Search] Found ${searchResults.length} results`
      );

      if (searchResults.length > 0) {
        console.log(
          `[${traceId}] [Keyword Search] Top result: "${searchResults[0].incidentId}" (score: ${searchResults[0].score.toFixed(3)})`
        );
      }

      return searchResults;
    } catch (error) {
      console.error(`[${traceId}] [Keyword Search] Error:`, error);
      throw new Error(
        `Keyword search failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}

