import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Model mapping - Gemini equivalents (2.x models available)
export const GEMINI_MODELS = {
  // Fast, cost-effective model
  flash: "models/gemini-2.0-flash",
  // Pro model for complex tasks
  pro: "models/gemini-2.5-pro",
  // Latest 2.5 flash
  flash25: "models/gemini-2.5-flash",
} as const;

// Token costs per 1K tokens (Gemini pricing)
const TOKEN_COSTS = {
  "models/gemini-2.0-flash": {
    input: 0.000075,
    output: 0.0003,
  },
  "models/gemini-2.5-pro": {
    input: 0.00125,
    output: 0.005,
  },
  "models/gemini-2.5-flash": {
    input: 0.000075,
    output: 0.0003,
  },
};

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_DELAY_MS = 1000;

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function getGeminiModel(modelType: keyof typeof GEMINI_MODELS = "flash"): GenerativeModel {
  const modelName = GEMINI_MODELS[modelType];
  return genAI.getGenerativeModel({ model: modelName });
}

interface GenerateContentOptions {
  model?: keyof typeof GEMINI_MODELS;
  systemPrompt?: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
}

interface GenerateContentResult {
  text: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
}

export async function generateContent({
  model = "flash",
  systemPrompt,
  userPrompt,
  temperature = 0.7,
  maxTokens = 8192,
}: GenerateContentOptions): Promise<GenerateContentResult> {
  const geminiModel = getGeminiModel(model);
  const modelName = GEMINI_MODELS[model];
  
  // Combine system prompt with user prompt (Gemini handles this differently)
  const fullPrompt = systemPrompt 
    ? `${systemPrompt}\n\n---\n\n${userPrompt}`
    : userPrompt;

  // Retry logic with exponential backoff for rate limiting
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const result = await geminiModel.generateContent({
        contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
        },
      });

      const response = result.response;
      const text = response.text();
      
      // Get token usage from response metadata
      const usageMetadata = response.usageMetadata;
      const promptTokens = usageMetadata?.promptTokenCount || 0;
      const completionTokens = usageMetadata?.candidatesTokenCount || 0;
      const totalTokens = usageMetadata?.totalTokenCount || promptTokens + completionTokens;

      return {
        text,
        usage: {
          promptTokens,
          completionTokens,
          totalTokens,
        },
        model: modelName,
      };
    } catch (error: any) {
      lastError = error;
      
      // Check if it's a rate limit error (429)
      if (error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('Resource exhausted')) {
        const delay = INITIAL_DELAY_MS * Math.pow(2, attempt);
        console.warn(`[Gemini] Rate limited. Retrying in ${delay}ms... (attempt ${attempt + 1}/${MAX_RETRIES})`);
        await sleep(delay);
        continue;
      }
      
      // For other errors, throw immediately
      throw error;
    }
  }
  
  // If all retries failed
  throw new Error(`Gemini API rate limited after ${MAX_RETRIES} retries. Please try again in a few minutes. ${lastError?.message || ''}`);
}

// Chat-style generation (for multi-turn conversations)
export async function generateChatContent({
  model = "flash",
  systemPrompt,
  messages,
  temperature = 0.7,
  maxTokens = 8192,
}: {
  model?: keyof typeof GEMINI_MODELS;
  systemPrompt?: string;
  messages: Array<{ role: "user" | "model"; content: string }>;
  temperature?: number;
  maxTokens?: number;
}): Promise<GenerateContentResult> {
  const geminiModel = getGeminiModel(model);
  const modelName = GEMINI_MODELS[model];

  // Convert messages to Gemini format
  const contents = messages.map((msg) => ({
    role: msg.role === "user" ? "user" : "model",
    parts: [{ text: msg.content }],
  }));

  // Prepend system prompt to first user message if provided
  if (systemPrompt && contents.length > 0 && contents[0].role === "user") {
    contents[0].parts[0].text = `${systemPrompt}\n\n---\n\n${contents[0].parts[0].text}`;
  }

  const result = await geminiModel.generateContent({
    contents,
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
    },
  });

  const response = result.response;
  const text = response.text();
  
  const usageMetadata = response.usageMetadata;
  const promptTokens = usageMetadata?.promptTokenCount || 0;
  const completionTokens = usageMetadata?.candidatesTokenCount || 0;
  const totalTokens = usageMetadata?.totalTokenCount || promptTokens + completionTokens;

  return {
    text,
    usage: {
      promptTokens,
      completionTokens,
      totalTokens,
    },
    model: modelName,
  };
}

export async function trackTokenUsage({
  userId,
  projectId,
  type,
  model,
  promptTokens,
  completionTokens,
  totalTokens,
  operationName,
  cost,
}: {
  userId: string;
  projectId: string;
  type: "script" | "storyboard" | "treatment" | "idea" | "character_generation" | "logline" | "scenes";
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  operationName?: string;
  cost?: number;
}) {
  let calculatedCost = cost;
  
  if (typeof calculatedCost !== "number") {
    // Find matching model for cost calculation
    let modelKey = "gemini-2.0-flash";
    for (const key of Object.keys(TOKEN_COSTS)) {
      if (model.includes(key)) {
        modelKey = key;
        break;
      }
    }

    const costs = TOKEN_COSTS[modelKey as keyof typeof TOKEN_COSTS];
    if (costs) {
      const inputCost = (promptTokens / 1000) * costs.input;
      const outputCost = (completionTokens / 1000) * costs.output;
      calculatedCost = inputCost + outputCost;
    } else {
      console.warn(`Cost calculation skipped: Pricing not found for model '${model}'. Using 0.`);
      calculatedCost = 0;
    }
  }

  try {
    await prisma.tokenUsage.create({
      data: {
        userId,
        projectId,
        type,
        tokens: totalTokens,
        cost: calculatedCost,
        promptTokens,
        completionTokens,
        operationName: operationName || type,
      },
    });

    return {
      tokens: totalTokens,
      cost: calculatedCost,
    };
  } catch (error) {
    console.error("Failed to track token usage in DB:", error);
    return {
      tokens: totalTokens,
      cost: calculatedCost,
      error: "Failed to save token usage to database.",
    };
  }
}

export async function getUserTokenUsage(userId: string) {
  const usage = await prisma.tokenUsage.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  const totalTokens = usage.reduce((sum, record) => sum + record.tokens, 0);
  const totalCost = usage.reduce((sum, record) => sum + record.cost, 0);

  return {
    usage,
    totalTokens,
    totalCost,
  };
}

export async function getProjectTokenUsage(projectId: string) {
  const usage = await prisma.tokenUsage.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });

  const totalTokens = usage.reduce((sum, record) => sum + record.tokens, 0);
  const totalCost = usage.reduce((sum, record) => sum + record.cost, 0);

  return {
    usage,
    totalTokens,
    totalCost,
  };
}

export { genAI };
