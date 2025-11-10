/**
 * Query Preprocessing Pipeline for RAG
 * Handles abbreviation expansion, normalization, and query enhancement
 */

import { expandAbbreviations, getSearchExpansion, findAbbreviations, IT_ABBREVIATIONS } from "./abbreviations.js";

export { expandAbbreviations, getSearchExpansion, findAbbreviations, IT_ABBREVIATIONS };

export interface PreprocessedQuery {
  original: string;
  normalized: string;
  withAbbreviations: string;
  searchOptimized: string;
  abbreviationsFound: Array<{
    original: string;
    expanded: string;
    category: string;
  }>;
}

/**
 * Preprocess a query for RAG search
 * @param query - Raw user query
 * @param options - Processing options
 */
export function preprocessQuery(
  query: string,
  options: {
    expandAbbrevs?: boolean;
    normalize?: boolean;
  } = {}
): PreprocessedQuery {
  const { expandAbbrevs = true, normalize = true } = options;

  // Step 1: Normalize (trim, clean)
  let normalized = query.trim();
  if (normalize) {
    // Remove extra spaces
    normalized = normalized.replace(/\s+/g, " ");
  }

  // Step 2: Expand abbreviations
  let withAbbreviations = normalized;
  let searchOptimized = normalized;
  const abbreviationsFound: Array<{
    original: string;
    expanded: string;
    category: string;
  }> = [];

  if (expandAbbrevs) {
    const { expanded, expansions } = expandAbbreviations(normalized);
    withAbbreviations = expanded;
    abbreviationsFound.push(...expansions);

    // For search, use the search-optimized version
    searchOptimized = getSearchExpansion(normalized);
  }

  return {
    original: query,
    normalized,
    withAbbreviations,
    searchOptimized,
    abbreviationsFound,
  };
}

/**
 * Get a human-readable preprocessing summary
 */
export function getPreprocessingSummary(result: PreprocessedQuery): string {
  const parts: string[] = [];

  parts.push(`Original: "${result.original}"`);
  
  if (result.abbreviationsFound.length > 0) {
    parts.push(`\nAbbreviations expanded (${result.abbreviationsFound.length}):`);
    result.abbreviationsFound.forEach(abbrev => {
      parts.push(`  • ${abbrev.original} → ${abbrev.expanded} [${abbrev.category}]`);
    });
  }

  parts.push(`\nSearch-optimized: "${result.searchOptimized}"`);

  return parts.join("\n");
}

