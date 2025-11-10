import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { ChatOpenAI } from "@langchain/openai";
import { ChatGroq } from "@langchain/groq";
import { ChatAnthropic } from "@langchain/anthropic";
import { config } from "../../config/index.js";

/**
 * Create a chat model based on configuration
 */
export function createChatModel(): BaseChatModel {
  const provider = config.llm.provider;
  const temperature = config.llm.temperature;
  const maxTokens = config.llm.maxTokens;

  console.log(`[Model Factory] Creating chat model: ${provider}`);

  switch (provider) {
    case "openai": {
      const apiKey = config.llm.openai.apiKey;
      const model = config.llm.openai.model;

      if (!apiKey) {
        throw new Error("OPENAI_API_KEY is required when MODEL_PROVIDER=openai");
      }

      return new ChatOpenAI({
        apiKey,
        model,
        temperature,
        maxTokens,
      }) as unknown as BaseChatModel;
    }

    case "groq": {
      const apiKey = config.llm.groq.apiKey;
      const model = config.llm.groq.model;

      if (!apiKey) {
        throw new Error("GROQ_API_KEY is required when MODEL_PROVIDER=groq");
      }

      return new ChatGroq({
        apiKey,
        model,
        temperature,
        maxTokens,
      }) as unknown as BaseChatModel;
    }

    case "anthropic": {
      const apiKey = config.llm.anthropic.apiKey;
      const model = config.llm.anthropic.model;

      if (!apiKey) {
        throw new Error("ANTHROPIC_API_KEY is required when MODEL_PROVIDER=anthropic");
      }

      return new ChatAnthropic({
        apiKey,
        model,
        temperature,
        maxTokens,
      }) as unknown as BaseChatModel;
    }

    default:
      throw new Error(
        `Unsupported MODEL_PROVIDER: "${provider}". ` +
        `Supported providers: openai, groq, anthropic`
      );
  }
}

/**
 * Get information about the current model configuration
 */
export function getModelInfo(): {
  provider: string;
  model: string;
  temperature: number;
} {
  const provider = config.llm.provider;
  const temperature = config.llm.temperature;

  let model = "unknown";
  switch (provider) {
    case "openai":
      model = config.llm.openai.model;
      break;
    case "groq":
      model = config.llm.groq.model;
      break;
    case "anthropic":
      model = config.llm.anthropic.model;
      break;
  }

  return { provider, model, temperature };
}

