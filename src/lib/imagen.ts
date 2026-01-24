import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Project types that support storyboard image generation
export const STORYBOARD_ENABLED_TYPES = ['shortfilm', 'screenplay', 'webseries', 'documentary'] as const;

export type StoryboardEnabledType = typeof STORYBOARD_ENABLED_TYPES[number];

export function isStoryboardEnabled(projectType: string): boolean {
  return STORYBOARD_ENABLED_TYPES.includes(projectType as StoryboardEnabledType);
}

// Image style presets for different project types
export const IMAGE_STYLES = {
  shortfilm: {
    style: "cinematic film still, professional cinematography, dramatic lighting",
    aspectRatio: "16:9",
    quality: "high"
  },
  screenplay: {
    style: "cinematic widescreen shot, Hollywood production quality, professional film lighting",
    aspectRatio: "2.39:1",
    quality: "high"
  },
  webseries: {
    style: "modern digital cinema look, streaming quality, vibrant colors",
    aspectRatio: "16:9",
    quality: "high"
  },
  documentary: {
    style: "documentary style, natural lighting, realistic, photojournalistic",
    aspectRatio: "16:9",
    quality: "high"
  }
} as const;

interface GenerateStoryboardImageOptions {
  sceneDescription: string;
  sceneScript?: string;
  projectType: string;
  characters?: Array<{ name: string; description: string }>;
  location?: string;
  timeOfDay?: string;
  mood?: string;
}

interface GenerateImageResult {
  imageUrl: string;
  prompt: string;
  model: string;
}

/**
 * Generate a storyboard image using Gemini's image generation capabilities
 * Note: As of 2024, Gemini uses Imagen 3 for image generation
 */
export async function generateStoryboardImage({
  sceneDescription,
  sceneScript,
  projectType,
  characters,
  location,
  timeOfDay,
  mood
}: GenerateStoryboardImageOptions): Promise<GenerateImageResult> {
  const style = IMAGE_STYLES[projectType as keyof typeof IMAGE_STYLES] || IMAGE_STYLES.shortfilm;
  
  // Build a detailed prompt for image generation
  let imagePrompt = `${style.style}, `;
  
  // Add scene context
  imagePrompt += sceneDescription;
  
  // Add location and time
  if (location) {
    imagePrompt += `, set in ${location}`;
  }
  if (timeOfDay) {
    imagePrompt += `, ${timeOfDay} lighting`;
  }
  
  // Add mood/atmosphere
  if (mood) {
    imagePrompt += `, ${mood} atmosphere`;
  }
  
  // Add character descriptions if available
  if (characters && characters.length > 0) {
    const charDescriptions = characters
      .slice(0, 2) // Limit to 2 main characters for cleaner image
      .map(c => c.description || c.name)
      .join(' and ');
    imagePrompt += `, featuring ${charDescriptions}`;
  }
  
  // Add technical specifications
  imagePrompt += `, ${style.aspectRatio} aspect ratio, professional storyboard frame, no text or watermarks`;
  
  // Clean up the prompt
  imagePrompt = imagePrompt.replace(/\s+/g, ' ').trim();
  
  try {
    // Use Gemini with Imagen 3 for image generation
    // Note: This requires the appropriate API access
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp", // Model with image generation capability
    });

    // First, refine the prompt using Gemini's text capabilities
    const refinedPromptResult = await model.generateContent({
      contents: [{
        role: "user",
        parts: [{
          text: `You are an expert at creating image generation prompts for cinematic storyboards. 
          
Given this scene description: "${sceneDescription}"
${sceneScript ? `And this script excerpt: "${sceneScript.slice(0, 500)}"` : ''}

Create a concise, vivid image prompt (max 200 words) that would generate a professional storyboard frame. 
Focus on:
- Camera angle and framing
- Character positioning and actions
- Lighting and atmosphere
- Key visual elements

Style: ${style.style}
Output ONLY the image prompt, nothing else.`
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 300,
      },
    });

    const refinedPrompt = refinedPromptResult.response.text().trim();
    
    // For now, we'll use a text-to-image service
    // Gemini's native image generation (Imagen) may require specific API setup
    // Here we'll integrate with a fallback approach
    
    // Option 1: Use Gemini's multimodal generation with image output (when available)
    // Option 2: Use external service like Stability AI, DALL-E, or Cloudinary AI
    
    // For demonstration, we'll create a prompt-ready response
    // In production, you'd call the actual image generation API here
    
    return {
      imageUrl: "", // Will be populated by actual image generation
      prompt: refinedPrompt || imagePrompt,
      model: "gemini-2.0-flash-exp"
    };

  } catch (error: any) {
    console.error("[IMAGEN_GENERATION_ERROR]", error);
    throw new Error(`Failed to generate storyboard image: ${error.message}`);
  }
}

/**
 * Generate storyboard image using Stability AI (alternative)
 * This is a fallback when Gemini image generation is not available
 */
export async function generateWithStabilityAI(prompt: string): Promise<string> {
  const STABILITY_API_KEY = process.env.STABILITY_API_KEY;
  
  if (!STABILITY_API_KEY) {
    throw new Error("Stability AI API key not configured");
  }

  const response = await fetch(
    "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${STABILITY_API_KEY}`,
      },
      body: JSON.stringify({
        text_prompts: [
          {
            text: prompt,
            weight: 1,
          },
          {
            text: "blurry, bad quality, distorted, text, watermark, logo",
            weight: -1,
          },
        ],
        cfg_scale: 7,
        width: 1344,
        height: 768,
        steps: 30,
        samples: 1,
        style_preset: "cinematic",
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Stability AI error: ${error.message || 'Unknown error'}`);
  }

  const result = await response.json();
  
  // Result contains base64 image
  if (result.artifacts && result.artifacts.length > 0) {
    return `data:image/png;base64,${result.artifacts[0].base64}`;
  }

  throw new Error("No image generated");
}

/**
 * Track image generation usage
 */
export async function trackImageUsage({
  userId,
  projectId,
  sceneId,
  model,
  prompt,
  success,
}: {
  userId: string;
  projectId: string;
  sceneId?: string;
  model: string;
  prompt: string;
  success: boolean;
}) {
  try {
    // Update user's monthly image usage
    await prisma.user.update({
      where: { id: userId },
      data: {
        imageUsageThisMonth: { increment: 1 },
      },
    });

    // Log the usage
    await prisma.tokenUsage.create({
      data: {
        userId,
        projectId,
        type: "storyboard",
        tokens: 0, // Images don't use tokens
        cost: 0.02, // Approximate cost per image
        promptTokens: 0,
        completionTokens: 0,
        operationName: `Storyboard Image: Scene ${sceneId || 'Unknown'}`,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to track image usage:", error);
    return { success: false, error };
  }
}

/**
 * Check if user has remaining image quota
 */
export async function checkImageQuota(userId: string): Promise<{
  hasQuota: boolean;
  used: number;
  limit: number;
  remaining: number;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      imageUsageThisMonth: true,
      subscriptionStatus: true,
    },
  });

  if (!user) {
    return { hasQuota: false, used: 0, limit: 0, remaining: 0 };
  }

  // Get limits based on subscription
  let limit = 5; // Free tier
  if (user.subscriptionStatus === 'hobby') {
    limit = 25;
  } else if (user.subscriptionStatus === 'pro' || user.subscriptionStatus === 'admin') {
    limit = 100;
  }

  const used = user.imageUsageThisMonth || 0;
  const remaining = Math.max(0, limit - used);

  return {
    hasQuota: remaining > 0,
    used,
    limit,
    remaining,
  };
}
