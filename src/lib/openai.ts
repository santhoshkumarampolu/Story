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
  "gpt-3.5-turbo": {
    input: 0.0005,
    output: 0.0015,
  },
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
  inputTokens,
  outputTokens,
}: {
  userId: string;
  projectId: string;
  type: "script" | "storyboard" | "treatment" | "idea" | "character_generation"; // Added "character_generation"
  model: "gpt-4" | "gpt-3.5-turbo";
  inputTokens: number;
  outputTokens: number;
}) {
  const inputCost = (inputTokens / 1000) * TOKEN_COSTS[model].input;
  const outputCost = (outputTokens / 1000) * TOKEN_COSTS[model].output;
  const totalCost = inputCost + outputCost;
  const totalTokens = inputTokens + outputTokens;

  await prisma.tokenUsage.create({
    data: {
      userId,
      projectId,
      type,
      tokens: totalTokens,
      cost: totalCost,
    },
  });

  return {
    tokens: totalTokens,
    cost: totalCost,
  };
}

export async function trackImageGeneration({
  userId,
  projectId,
  type,
  model,
  size,
  imageCount = 1,
}: {
  userId: string;
  projectId: string;
  type: "storyboard";
  model: "dall-e-3" | "dall-e-2";
  size: string;
  imageCount?: number;
}) {
  const costPerImage = DALLE_COSTS[model]?.[size as keyof typeof DALLE_COSTS[typeof model]] || 0;
  const totalCost = costPerImage * imageCount;

  await prisma.tokenUsage.create({
    data: {
      userId,
      projectId,
      type,
      tokens: 0, // DALL-E doesn't use tokens
      cost: totalCost,
    },
  });

  return {
    cost: totalCost,
    images: imageCount,
  };
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