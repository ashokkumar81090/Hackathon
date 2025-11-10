import { IncidentVectorStore } from "../../lib/vectorstore/index.js";
import { Incident } from "../../types/index.js";

/**
 * Ingestion pipeline for loading incidents into the vector store
 */
export class IngestionPipeline {
  constructor(private vectorStore: IncidentVectorStore) {}

  /**
   * Ingest incidents with optional clearing
   */
  async ingest(
    incidents: Incident[],
    options: {
      clearExisting?: boolean;
      batchSize?: number;
    } = {}
  ): Promise<void> {
    const { clearExisting = false, batchSize = 10 } = options;

    console.log(`\n${"=".repeat(80)}`);
    console.log(`📥 INGESTION PIPELINE`);
    console.log(`${"=".repeat(80)}\n`);

    try {
      // Step 1: Clear existing data if requested
      if (clearExisting) {
        console.log(`🗑️  Step 1: Clearing existing incidents...`);
        await this.vectorStore.clearCollection();
        console.log(`✓ Collection cleared\n`);
      }

      // Step 2: Validate incidents
      console.log(`✅ Step 2: Validating ${incidents.length} incidents...`);
      const validIncidents = this.validateIncidents(incidents);
      console.log(`✓ ${validIncidents.length} valid incidents\n`);

      if (validIncidents.length === 0) {
        console.log(`⚠️  No valid incidents to ingest`);
        return;
      }

      // Step 3: Ingest incidents
      console.log(`📤 Step 3: Ingesting incidents with embeddings...`);
      await this.vectorStore.addIncidentsBatch(validIncidents, batchSize);

      // Step 4: Show statistics
      const stats = await this.vectorStore.getStats();
      console.log(`\n✅ INGESTION COMPLETE`);
      console.log(`${"=".repeat(80)}`);
      console.log(`📊 Statistics:`);
      console.log(`   - Total incidents in DB: ${stats.count}`);
      console.log(`   - Database size: ${stats.dbSize}`);
      console.log(`${"=".repeat(80)}\n`);
    } catch (error) {
      console.error(`❌ Ingestion failed:`, error);
      throw error;
    }
  }

  /**
   * Validate incidents data
   */
  private validateIncidents(incidents: Incident[]): Incident[] {
    return incidents.filter((incident, index) => {
      // Check required fields
      if (!incident.incidentId || !incident.summary || !incident.description) {
        console.warn(
          `⚠️  Skipping incident at index ${index}: missing required fields`
        );
        return false;
      }

      return true;
    });
  }
}

