import { ChatPromptTemplate } from "@langchain/core/prompts";

/**
 * System prompt for incident Q&A
 */
const INCIDENT_QA_SYSTEM_PROMPT = `You are an expert IT support assistant helping users find solutions to technical incidents.

Your role is to:
1. Analyze the user's question about IT incidents
2. Review the provided relevant incident records
3. Provide accurate, helpful answers based on the incident data
4. Include specific incident IDs, root causes, and resolution steps when relevant
5. If the provided incidents don't fully answer the question, acknowledge this

Guidelines:
- Be concise but thorough
- Reference specific incident IDs when citing information
- Prioritize resolved incidents with clear resolution steps
- If multiple similar incidents exist, mention patterns or common causes
- Suggest preventive measures when applicable`;

/**
 * Human prompt template for incident Q&A
 */
const INCIDENT_QA_USER_TEMPLATE = `User Question: {query}

Relevant Incidents:
{context}

Based on the incidents above, please answer the user's question. Be specific and cite incident IDs when referencing information.`;

/**
 * Create the incident Q&A prompt template
 */
export function createIncidentQAPrompt(): ChatPromptTemplate {
  return ChatPromptTemplate.fromMessages([
    ["system", INCIDENT_QA_SYSTEM_PROMPT],
    ["human", INCIDENT_QA_USER_TEMPLATE],
  ]);
}

/**
 * Format incidents as context for the prompt
 */
export function formatIncidentsAsContext(
  incidents: Array<{
    incidentId: string;
    summary: string;
    description?: string;
    rootCause?: string;
    resolutionSteps?: string;
    status?: string;
    priority?: string;
    category?: string;
  }>
): string {
  if (incidents.length === 0) {
    return "No relevant incidents found.";
  }

  return incidents
    .map((incident, index) => {
      let context = `\n--- Incident ${index + 1} ---
Incident ID: ${incident.incidentId}
Summary: ${incident.summary}
Status: ${incident.status || "N/A"}
Priority: ${incident.priority || "N/A"}
Category: ${incident.category || "N/A"}`;

      if (incident.description) {
        context += `\nDescription: ${incident.description}`;
      }

      if (incident.rootCause) {
        context += `\nRoot Cause: ${incident.rootCause}`;
      }

      if (incident.resolutionSteps) {
        context += `\nResolution Steps: ${incident.resolutionSteps}`;
      }

      return context;
    })
    .join("\n");
}

/**
 * System prompt for generating IT team recommendations
 */
const RECOMMENDATIONS_SYSTEM_PROMPT = `You are an expert IT operations analyst providing actionable recommendations for resolving technical incidents.

Your role is to:
1. Analyze the resolution patterns from provided resolved incidents
2. Identify common causes, solutions, and best practices
3. Provide structured recommendations for IT teams to resolve similar issues
4. Suggest preventive measures to avoid future occurrences

Guidelines:
- Focus on practical, actionable steps
- Identify patterns across multiple incidents when available
- Prioritize proven solutions that have worked before
- Suggest monitoring and preventive measures
- Be specific about tools, commands, or procedures to follow

Always return your response as a valid JSON object with keys: summary, keySteps (array), bestPractices (array), preventiveMeasures (array), and priority.

Important: Return ONLY the JSON object, no markdown formatting, no explanations, just pure JSON.`;

/**
 * Human prompt template for generating recommendations
 */
const RECOMMENDATIONS_USER_TEMPLATE = `User Query: {query}

Resolved Incidents for Analysis:
{context}

Based on these resolved incidents, provide structured recommendations for IT teams to resolve similar issues. Focus on practical steps, best practices, and preventive measures.`;

/**
 * Create the recommendations prompt template
 */
export function createRecommendationsPrompt(): ChatPromptTemplate {
  return ChatPromptTemplate.fromMessages([
    ["system", RECOMMENDATIONS_SYSTEM_PROMPT],
    ["human", RECOMMENDATIONS_USER_TEMPLATE],
  ]);
}

/**
 * Format incidents as context for recommendations
 */
export function formatIncidentsForRecommendations(
  incidents: Array<{
    incidentId: string;
    summary: string;
    description?: string;
    rootCause?: string;
    resolutionSteps?: string;
    status?: string;
    priority?: string;
    category?: string;
    resolvedDate?: string;
    createdDate?: string;
  }>
): string {
  if (incidents.length === 0) {
    return "No resolved incidents available for analysis.";
  }

  return incidents
    .map((incident, index) => {
      const parts = [
        `Resolved Incident ${index + 1}: ${incident.incidentId}`,
        `Summary: ${incident.summary}`,
        `Priority: ${incident.priority || "Unknown"}`,
        `Category: ${incident.category || "Unknown"}`,
      ];

      if (incident.description) {
        parts.push(`Description: ${incident.description}`);
      }

      if (incident.rootCause) {
        parts.push(`Root Cause: ${incident.rootCause}`);
      }

      if (incident.resolutionSteps) {
        parts.push(`Resolution Steps: ${incident.resolutionSteps}`);
      }

      if (incident.createdDate && incident.resolvedDate) {
        const created = new Date(incident.createdDate);
        const resolved = new Date(incident.resolvedDate);
        const duration = resolved.getTime() - created.getTime();
        const hours = Math.round(duration / (1000 * 60 * 60));
        parts.push(`Resolution Time: ${hours} hours`);
      }

      return parts.join("\n");
    })
    .join("\n\n---\n\n");
}

