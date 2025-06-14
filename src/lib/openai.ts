import { OpenAI } from "openai";
import { prisma } from "@/lib/prisma";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Token costs per 1K tokens (as of 2024)
const TOKEN_COSTS = {
  "gpt-4": {
    input: 0.01,
    output: 0.03,
  },
  "gpt-3.5-turbo": { // Covers variants like gpt-3.5-turbo-1106, gpt-3.5-turbo-0125
    input: 0.0005,
    output: 0.0015,
  },
  // Add other models and their costs as needed
};

// DALL-E pricing (as of 2024)
const DALLE_COSTS = {
  "dall-e-3": {
    "1024x1024": 0.04,
    "1792x1024": 0.08,
    "1024x1792": 0.08,
    "1024x1024_hd": 0.08,
    "1792x1024_hd": 0.12,
    "1024x1792_hd": 0.12,
  },
  "dall-e-2": {
    "1024x1024": 0.020,
    "512x512": 0.018,
    "256x256": 0.016,
  },
};

export async function trackTokenUsage({
  userId,
  projectId,
  type,
  model,
  promptTokens,
  completionTokens,
  totalTokens,
  operationName,
  cost
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
  if (typeof calculatedCost !== 'number') { 
    let modelKeyForCost = "gpt-3.5-turbo"; 
    if (model.includes("gpt-4")) {
      modelKeyForCost = "gpt-4";
    }
    
    const costs = TOKEN_COSTS[modelKeyForCost as keyof typeof TOKEN_COSTS];
    if (costs) {
      const inputCost = (promptTokens / 1000) * costs.input;
      const outputCost = (completionTokens / 1000) * costs.output;
      calculatedCost = inputCost + outputCost;
    } else {
      console.warn(`Cost calculation skipped: Pricing not found for model key derived from '${model}'. Using 0.`);
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
      error: "Failed to save token usage to database."
    };
  }
}

export async function trackImageGeneration({
  userId,
  projectId,
  type,
  model,
  size,
  quality,
  style,
  imageCount = 1,
  operationName,
  cost
}: {
  userId: string;
  projectId: string;
  type: "storyboard" | "image_generation";
  model: "dall-e-3" | "dall-e-2";
  size: string;
  quality?: "standard" | "hd";
  style?: "vivid" | "natural";
  imageCount?: number;
  operationName?: string;
  cost?: number;
}) {
  let calculatedCost = cost;
  if (typeof calculatedCost !== 'number') {
    const dalleModelKey = model as keyof typeof DALLE_COSTS;
    let sizeKey = size;
    if (model === 'dall-e-3' && quality === 'hd') {
      sizeKey = `${size}_hd`;
    }
    const costPerImage = DALLE_COSTS[dalleModelKey]?.[sizeKey as keyof typeof DALLE_COSTS[typeof dalleModelKey]] || 0;
    calculatedCost = costPerImage * imageCount;
  }
  
  const opName = operationName || `${type} (${model}, ${size}${quality === 'hd' ? '_hd' : ''}${style ? `_${style}` : ''}, count: ${imageCount})`;

  try {
    await prisma.tokenUsage.create({
      data: {
        userId,
        projectId,
        type,
        tokens: 0, 
        cost: calculatedCost,
        modelUsed: model,
        operationName: opName,
        // Storing image-specific details if the schema is extended for them
        // e.g., imageSize: size, imageQuality: quality, imageStyle: style, imageCount
      }
    });
    return {
      cost: calculatedCost,
      operationName: opName
    };
  } catch (error) {
    console.error("Failed to track image generation usage in DB:", error);
    return {
      cost: calculatedCost,
      operationName: opName,
      error: "Failed to save image generation usage to database."
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

export { openai };