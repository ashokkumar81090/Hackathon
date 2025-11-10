#!/usr/bin/env node
import { config } from "../config/index.js";

console.log("\n" + "=".repeat(80));
console.log("🔍 ENVIRONMENT CONFIGURATION CHECK");
console.log("=".repeat(80) + "\n");

// Check MongoDB
console.log("📊 MongoDB Configuration:");
console.log(`   URI: ${config.mongodb.uri ? '✅ Set' : '❌ Missing'}`);
console.log(`   Database: ${config.mongodb.dbName}`);
console.log(`   Collection: ${config.mongodb.collectionName}`);
console.log(`   Vector Index: ${config.mongodb.vectorIndexName}\n`);

// Check Embeddings
console.log("🎯 Embeddings Configuration:");
console.log(`   Provider: ${config.embeddings.provider}`);
if (config.embeddings.provider === "mistral") {
  console.log(`   Mistral API Key: ${config.embeddings.mistral.apiKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`   Model: ${config.embeddings.mistral.model}`);
  console.log(`   Dimensions: ${config.embeddings.mistral.dimensions}`);
} else {
  console.log(`   OpenAI API Key: ${config.embeddings.openai.apiKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`   Model: ${config.embeddings.openai.model}`);
  console.log(`   Dimensions: ${config.embeddings.openai.dimensions}`);
}
console.log();

// Check LLM
console.log("🤖 LLM Configuration:");
console.log(`   Provider: ${config.llm.provider}`);
if (config.llm.provider === "groq") {
  console.log(`   Groq API Key: ${config.llm.groq.apiKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`   Model: ${config.llm.groq.model}`);
} else if (config.llm.provider === "openai") {
  console.log(`   OpenAI API Key: ${config.llm.openai.apiKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`   Model: ${config.llm.openai.model}`);
} else if (config.llm.provider === "anthropic") {
  console.log(`   Anthropic API Key: ${config.llm.anthropic.apiKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`   Model: ${config.llm.anthropic.model}`);
}
console.log();

// Check Server
console.log("🌐 Server Configuration:");
console.log(`   Port: ${config.server.port}`);
console.log();

// Check for missing required values
const errors: string[] = [];

if (!config.mongodb.uri) {
  errors.push("❌ MONGODB_URI is missing");
}

if (config.embeddings.provider === "mistral" && !config.embeddings.mistral.apiKey) {
  errors.push("❌ MISTRAL_API_KEY is missing");
}

if (config.embeddings.provider === "openai" && !config.embeddings.openai.apiKey) {
  errors.push("❌ OPENAI_API_KEY is missing");
}

if (config.llm.provider === "groq" && !config.llm.groq.apiKey) {
  errors.push("❌ GROQ_API_KEY is missing");
}

if (config.llm.provider === "openai" && !config.llm.openai.apiKey) {
  errors.push("❌ OPENAI_API_KEY is missing for LLM");
}

if (config.llm.provider === "anthropic" && !config.llm.anthropic.apiKey) {
  errors.push("❌ ANTHROPIC_API_KEY is missing");
}

console.log("=".repeat(80));
if (errors.length > 0) {
  console.log("❌ CONFIGURATION ERRORS:\n");
  errors.forEach(err => console.log(`   ${err}`));
  console.log("\n💡 Add missing variables to your .env file");
} else {
  console.log("✅ ALL REQUIRED CONFIGURATION IS SET!");
}
console.log("=".repeat(80) + "\n");

