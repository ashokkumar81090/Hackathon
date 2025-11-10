#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { config, validateConfig } from "../config/index.js";
import { createEmbeddings } from "../lib/embeddings/index.js";
import { IncidentVectorStore } from "../lib/vectorstore/index.js";
import { IngestionPipeline } from "../pipelines/ingestion/index.js";
import { Incident } from "../types/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Load incidents from JSON file
 */
function loadIncidentsFromJSON(filePath: string): Incident[] {
  console.log(`📂 Loading incidents from: ${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`Incidents file not found: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const incidents = JSON.parse(content);

  if (!Array.isArray(incidents)) {
    throw new Error("Incidents file must contain an array of incidents");
  }

  console.log(`✓ Loaded ${incidents.length} incidents from file\n`);
  return incidents;
}

/**
 * Main ingestion script
 */
async function main() {
  try {
    // Validate configuration (skip LLM validation for ingestion)
    console.log(`⚙️  Validating configuration...`);
    validateConfig({ skipLLM: true });
    console.log(`✓ Configuration valid\n`);

    // Parse command line arguments
    const args = process.argv.slice(2);
    const clearExisting = args.includes("--clear");
    const batchSize = 10;

    // Default incidents file path (use transformed incidents.json)
    const incidentsFilePath = path.join(__dirname, "../data/incidents.json");

    // Check if file exists
    if (!fs.existsSync(incidentsFilePath)) {
      console.error(`\n❌ Error: incidents.json not found at ${incidentsFilePath}`);
      console.log(`\n💡 To create the incidents file:`);
      console.log(`   1. Run: npm run fetch:servicenow (to fetch real data)`);
      console.log(`   2. Run: npm run generate:incidents (to generate additional data)`);
      console.log(`   3. Run: npm run transform:incidents (to flatten the structure)`);
      console.log(`   4. Then run this script again\n`);
      process.exit(1);
    }

    // Load incidents
    const incidents = loadIncidentsFromJSON(incidentsFilePath);

    if (incidents.length === 0) {
      console.log(`⚠️  No incidents to ingest`);
      process.exit(0);
    }

    // Initialize embeddings
    const embeddingsProvider = config.embeddings.provider;
    const modelName = embeddingsProvider === "openai" 
      ? config.embeddings.openai.model 
      : config.embeddings.mistral.model;
    console.log(`🔧 Initializing ${embeddingsProvider.toUpperCase()} embeddings (${modelName})...`);
    const embeddings = createEmbeddings();
    console.log(`✓ Embeddings initialized\n`);

    // Initialize vector store
    console.log(`🔧 Initializing vector store...`);
    const vectorStore = new IncidentVectorStore(embeddings);
    await vectorStore.initialize();
    console.log(`✓ Vector store connected\n`);

    // Create ingestion pipeline
    const ingestionPipeline = new IngestionPipeline(vectorStore);

    // Ingest incidents
    await ingestionPipeline.ingest(incidents, {
      clearExisting,
      batchSize,
    });

    // Cleanup
    await vectorStore.close();

    console.log(`\n💡 Next steps:`);
    console.log(`   1. Ensure MongoDB Atlas vector index is created`);
    console.log(`   2. Start the server: npm run dev`);
    console.log(`   3. Test the search: npm run test:search\n`);

    process.exit(0);
  } catch (error) {
    console.error(`\n❌ Ingestion failed:`, error);
    process.exit(1);
  }
}

main();

