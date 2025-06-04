import { OpenAI } from "openai";
import { prisma } from "@/lib/prisma";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Token costs per 1K tokens (as of 2024)
const TOKEN_COSTS = {
  "gpt-4": {
    input: 0.03,
    output: 0.06,
  },
  "gpt-3.5-turbo": {
    input: 0.0015,
    output: 0.002,
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
  type: "script" | "storyboard";
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