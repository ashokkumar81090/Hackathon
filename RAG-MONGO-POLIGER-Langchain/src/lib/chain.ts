import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { RetrievalPipeline, SearchFilters } from "../pipelines/retrieval/index.js";
import { createIncidentQAPrompt, createRecommendationsPrompt, formatIncidentsAsContext, formatIncidentsForRecommendations } from "./prompts/index.js";
import { RAGQueryResult, ITRecommendations } from "../types/index.js";
import { config } from "../config/index.js";
import { preprocessQuery } from "./preprocessing/index.js";

/**
 * RAG Chain for Incident Q&A using LangChain
 */
export class IncidentRAGChain {
  private qaChain: RunnableSequence;
  private recommendationsChain: RunnableSequence;
  private retrievalPipeline: RetrievalPipeline;
  private chatModel: BaseChatModel;

  constructor(
    chatModel: BaseChatModel,
    retrievalPipeline: RetrievalPipeline
  ) {
    this.chatModel = chatModel;
    this.retrievalPipeline = retrievalPipeline;

    // Create the LangChain RAG chain for Q&A
    const qaPrompt = createIncidentQAPrompt();
    const qaOutputParser = new StringOutputParser();
    this.qaChain = RunnableSequence.from([qaPrompt, chatModel, qaOutputParser]);

    // Create the recommendations chain (using string parser for better error handling)
    const recommendationsPrompt = createRecommendationsPrompt();
    const recommendationsOutputParser = new StringOutputParser();
    this.recommendationsChain = RunnableSequence.from([recommendationsPrompt, chatModel, recommendationsOutputParser]);

    console.log("[RAG Chain] Initialized successfully");
  }

  /**
   * Query the RAG system
   */
  async query(
    query: string,
    searchType: "vector" | "keyword" | "hybrid" = "hybrid",
    topK: number = config.search.defaultTopK,
    filters?: SearchFilters
  ): Promise<RAGQueryResult> {
    const startTime = Date.now();
    const traceId = `rag-${Date.now()}`;

    console.log(`[${traceId}] [RAG Chain] Processing query: "${query}"`);
    console.log(`[${traceId}] [RAG Chain] Search type: ${searchType}, TopK: ${topK}`);
    
    if (filters && Object.keys(filters).length > 0) {
      console.log(`[${traceId}] [RAG Chain] Filters:`, JSON.stringify(filters));
    }

    try {
      // Step 1: Preprocess query (expand abbreviations)
      console.log(`[${traceId}] [RAG Chain] Step 1: Preprocessing query...`);
      const preprocessed = preprocessQuery(query, {
        expandAbbrevs: true,
        normalize: true,
      });

      if (preprocessed.abbreviationsFound.length > 0) {
        console.log(`[${traceId}] [RAG Chain] Expanded ${preprocessed.abbreviationsFound.length} abbreviations:`);
        preprocessed.abbreviationsFound.forEach(abbrev => {
          console.log(`[${traceId}]   • ${abbrev.original} → ${abbrev.expanded}`);
        });
      }

      // Use the search-optimized query for retrieval
      const searchQuery = preprocessed.searchOptimized;
      console.log(`[${traceId}] [RAG Chain] Search query: "${searchQuery}"`);

      // Step 2: Retrieve relevant incidents
      console.log(`[${traceId}] [RAG Chain] Step 2: Retrieving incidents...`);
      const searchResults = await this.retrievalPipeline.search(
        searchQuery,
        searchType,
        topK,
        traceId,
        filters
      );

      if (searchResults.length === 0) {
        console.log(`[${traceId}] [RAG Chain] No incidents found`);
        return {
          query,
          answer: "I couldn't find any relevant incidents in the database to answer your question. Please try rephrasing your query or check if incidents have been ingested.",
          relevantIncidents: [],
          metadata: {
            searchMethod: searchType,
            processingTime: Date.now() - startTime,
            model: this.getModelName(),
            timestamp: new Date().toISOString(),
          },
        };
      }

      console.log(`[${traceId}] [RAG Chain] Found ${searchResults.length} relevant incidents`);

      // Step 3: Format context
      const context = formatIncidentsAsContext(
        searchResults.map((result) => ({
          incidentId: result.incidentId,
          summary: result.summary,
          description: result.description,
          rootCause: result.metadata?.rootCause as string,
          resolutionSteps: result.metadata?.resolutionSteps as string,
          status: result.metadata?.status as string,
          priority: result.metadata?.priority as string,
          category: result.metadata?.category as string,
        }))
      );

      // Step 4: Generate answer using LLM
      console.log(`[${traceId}] [RAG Chain] Step 3: Generating answer with LLM...`);
      const answer = await this.qaChain.invoke({
        query,
        context,
      });

      // Step 5: Generate recommendations for IT team (only for hybrid search with resolved incidents)
      let recommendations: ITRecommendations | undefined;
      if (searchType === 'hybrid' && searchResults.some(r => r.metadata?.status === 'Resolved' || r.metadata?.status === 'Closed')) {
        console.log(`[${traceId}] [RAG Chain] Step 4: Generating IT team recommendations...`);

        // Filter to only resolved/closed incidents for recommendations
        const resolvedIncidents = searchResults
          .filter(r => r.metadata?.status === 'Resolved' || r.metadata?.status === 'Closed')
          .map(result => ({
            incidentId: result.incidentId,
            summary: result.summary,
            description: result.description,
            rootCause: result.metadata?.rootCause as string,
            resolutionSteps: result.metadata?.resolutionSteps as string,
            status: result.metadata?.status as string,
            priority: result.metadata?.priority as string,
            category: result.metadata?.category as string,
            resolvedDate: result.metadata?.resolvedDate as string,
            createdDate: result.metadata?.createdDate as string,
          }));

        if (resolvedIncidents.length > 0) {
          const recommendationsContext = formatIncidentsForRecommendations(resolvedIncidents);

          try {
            const rawResponse = await this.recommendationsChain.invoke({
              query,
              context: recommendationsContext,
            });

            // Parse the JSON response manually
            let parsedRecommendations;
            try {
              // Clean the response by removing markdown formatting if present
              const cleanedResponse = rawResponse.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
              parsedRecommendations = JSON.parse(cleanedResponse);
            } catch (parseError) {
              console.warn(`[${traceId}] [RAG Chain] Failed to parse JSON response:`, parseError);
              console.warn(`[${traceId}] [RAG Chain] Raw response:`, rawResponse);
              throw parseError;
            }

            // Validate and clean the parsed response
            recommendations = {
              summary: parsedRecommendations.summary || "Analysis of resolved incidents",
              keySteps: Array.isArray(parsedRecommendations.keySteps) ? parsedRecommendations.keySteps : [],
              bestPractices: Array.isArray(parsedRecommendations.bestPractices) ? parsedRecommendations.bestPractices : [],
              preventiveMeasures: Array.isArray(parsedRecommendations.preventiveMeasures) ? parsedRecommendations.preventiveMeasures : [],
              priority: ['High', 'Medium', 'Low'].includes(parsedRecommendations.priority) ? parsedRecommendations.priority : 'Medium',
            };

            console.log(`[${traceId}] [RAG Chain] ✓ Generated recommendations with ${recommendations.keySteps.length} steps`);
          } catch (error) {
            console.warn(`[${traceId}] [RAG Chain] Failed to generate recommendations:`, error);
            recommendations = undefined;
          }
        }
      }

      const processingTime = Date.now() - startTime;
      console.log(`[${traceId}] [RAG Chain] ✓ Query completed in ${processingTime}ms`);

      return {
        query,
        answer,
        relevantIncidents: searchResults.map((result) => ({
          incident: {
            incidentId: result.incidentId,
            summary: result.summary,
            description: result.description,
            status: result.metadata?.status as string,
            priority: result.metadata?.priority as string,
            category: result.metadata?.category as string,
            rootCause: result.metadata?.rootCause as string,
            resolutionSteps: result.metadata?.resolutionSteps as string,
            createdDate: result.metadata?.createdDate as string,
            resolvedDate: result.metadata?.resolvedDate as string,
          },
          score: result.score,
          matchType: result.matchType,
          content: result.content,
        })),
        recommendations,
        metadata: {
          searchMethod: searchType,
          processingTime,
          model: this.getModelName(),
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error(`[${traceId}] [RAG Chain] Error:`, error);
      throw new Error(
        `RAG query failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get the model name being used
   */
  private getModelName(): string {
    const provider = config.llm.provider;
    switch (provider) {
      case "openai":
        return config.llm.openai.model;
      case "groq":
        return config.llm.groq.model;
      case "anthropic":
        return config.llm.anthropic.model;
      default:
        return "unknown";
    }
  }
}

