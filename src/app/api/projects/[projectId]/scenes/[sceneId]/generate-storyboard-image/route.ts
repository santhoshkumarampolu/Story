import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateContent } from "@/lib/gemini";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { 
  isStoryboardEnabled, 
  IMAGE_STYLES, 
  checkImageQuota,
  trackImageUsage 
} from "@/lib/imagen";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Cloudinary upload for storing generated images
async function uploadToCloudinary(base64Image: string, folder: string = "storyboards"): Promise<string> {
  const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
  const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary credentials not configured");
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = require('crypto')
    .createHash('sha1')
    .update(`folder=${folder}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`)
    .digest('hex');

  const formData = new FormData();
  formData.append('file', base64Image);
  formData.append('api_key', CLOUDINARY_API_KEY);
  formData.append('timestamp', timestamp.toString());
  formData.append('signature', signature);
  formData.append('folder', folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Cloudinary upload failed: ${error.error?.message || 'Unknown error'}`);
  }

  const result = await response.json();
  return result.secure_url;
}

// Generate image using Gemini Imagen 3 (Primary - uses existing Gemini API)
async function generateImageWithGemini(prompt: string): Promise<string> {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  // Use Imagen 3 through Google AI API
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        instances: [
          {
            prompt: prompt,
          }
        ],
        parameters: {
          sampleCount: 1,
          aspectRatio: "16:9",
          personGeneration: "allow_adult",
          safetySetting: "block_few",
        }
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    console.error("Gemini Imagen error:", error);
    throw new Error(`Gemini Imagen error: ${error.error?.message || JSON.stringify(error)}`);
  }

  const result = await response.json();
  
  if (result.predictions && result.predictions.length > 0 && result.predictions[0].bytesBase64Encoded) {
    return `data:image/png;base64,${result.predictions[0].bytesBase64Encoded}`;
  }

  throw new Error("No image generated from Gemini Imagen");
}

// Fallback: Generate image using Stability AI
async function generateImageWithStability(prompt: string): Promise<string> {
  const STABILITY_API_KEY = process.env.STABILITY_API_KEY;
  
  if (!STABILITY_API_KEY) {
    throw new Error("STABILITY_API_KEY not configured. Add it to your .env file.");
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
            text: "blurry, bad quality, distorted, text, watermark, logo, anime, cartoon",
            weight: -1,
          },
        ],
        cfg_scale: 7,
        width: 1344,  // 16:9 for cinematic
        height: 768,
        steps: 30,
        samples: 1,
        style_preset: "cinematic",
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Stability AI error: ${JSON.stringify(error)}`);
  }

  const result = await response.json();
  
  if (result.artifacts && result.artifacts.length > 0) {
    return `data:image/png;base64,${result.artifacts[0].base64}`;
  }

  throw new Error("No image generated from Stability AI");
}

// Generate image using Replicate (alternative)
async function generateImageWithReplicate(prompt: string): Promise<string> {
  const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
  
  if (!REPLICATE_API_TOKEN) {
    throw new Error("REPLICATE_API_TOKEN not configured");
  }

  // Using SDXL via Replicate
  const response = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      "Authorization": `Token ${REPLICATE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version: "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b", // SDXL
      input: {
        prompt: prompt,
        negative_prompt: "blurry, bad quality, distorted, text, watermark, logo",
        width: 1344,
        height: 768,
        num_outputs: 1,
        scheduler: "K_EULER",
        num_inference_steps: 30,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Replicate API error: ${response.status}`);
  }

  const prediction = await response.json();
  
  // Poll for result
  let result = prediction;
  while (result.status !== "succeeded" && result.status !== "failed") {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const pollResponse = await fetch(result.urls.get, {
      headers: { Authorization: `Token ${REPLICATE_API_TOKEN}` },
    });
    result = await pollResponse.json();
  }

  if (result.status === "failed") {
    throw new Error("Image generation failed");
  }

  return result.output[0];
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; sceneId: string }> }
) {
  try {
    const { projectId, sceneId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to generate storyboard images" },
        { status: 401 }
      );
    }

    // Check image quota
    const quota = await checkImageQuota(session.user.id);
    if (!quota.hasQuota) {
      return NextResponse.json(
        { 
          error: "You've reached your monthly image generation limit. Upgrade your plan for more.",
          quota 
        },
        { status: 403 }
      );
    }

    // Get project and verify access
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
        userId: session.user.id,
      },
      include: {
        scenes: { where: { id: sceneId } },
        characters: { take: 3 },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or access denied" },
        { status: 404 }
      );
    }

    // Check if project type supports storyboard images
    if (!project.type || !isStoryboardEnabled(project.type)) {
      return NextResponse.json(
        { 
          error: `Storyboard images are not available for ${project.type || 'this'} project type. Available for: Short Film, Screenplay, Web Series, Documentary.` 
        },
        { status: 400 }
      );
    }

    if (!project.scenes || project.scenes.length === 0) {
      return NextResponse.json(
        { error: "Scene not found" },
        { status: 404 }
      );
    }

    const scene = project.scenes[0];

    if (!scene.summary && !scene.script) {
      return NextResponse.json(
        { error: "Scene needs a summary or script before generating a storyboard image" },
        { status: 400 }
      );
    }

    // Get style for this project type
    const style = IMAGE_STYLES[project.type as keyof typeof IMAGE_STYLES] || IMAGE_STYLES.shortfilm;

    // Use Gemini to create an optimized image prompt
    const promptGenerationResult = await generateContent({
      model: 'flash',
      systemPrompt: `You are an expert cinematographer and storyboard artist. Create concise, vivid image generation prompts for professional film storyboards.

Your prompts should describe:
- Specific camera angle and shot type (wide, medium, close-up, over-the-shoulder, etc.)
- Character positions and actions
- Lighting mood and direction
- Key visual elements and composition
- Atmosphere and emotion

Keep prompts under 150 words. Focus on visual elements only, no dialogue or sounds.
Style reference: ${style.style}`,
      userPrompt: `Create an image generation prompt for this scene:

Scene: ${scene.title || 'Untitled'}
Summary: ${scene.summary || ''}
${scene.script ? `Script excerpt: ${scene.script.slice(0, 500)}` : ''}
Location: ${scene.location || 'unspecified'}
Time: ${scene.timeOfDay || 'unspecified'}
${project.characters.length > 0 ? `Characters: ${project.characters.map(c => `${c.name} - ${c.description || 'no description'}`).join('; ')}` : ''}

Generate a cinematic storyboard prompt:`,
      temperature: 0.7,
      maxTokens: 300,
    });

    const imagePrompt = `${style.style}, ${promptGenerationResult.text.trim()}, professional film storyboard, cinematic composition, ${style.aspectRatio} aspect ratio, high quality`;

    // Try to generate image (with fallbacks)
    let imageUrl: string;
    let imageModel = "gemini-imagen-3";

    try {
      // Primary: Gemini Imagen 3 (uses existing GEMINI_API_KEY)
      if (process.env.GEMINI_API_KEY) {
        try {
          const base64Image = await generateImageWithGemini(imagePrompt);
          // Upload to Cloudinary for permanent storage
          imageUrl = await uploadToCloudinary(base64Image, `storyboards/${projectId}`);
          imageModel = "gemini-imagen-3";
        } catch (geminiError: any) {
          console.error("Gemini Imagen failed, trying fallback:", geminiError.message);
          
          // Fallback to Stability AI if Gemini fails
          if (process.env.STABILITY_API_KEY) {
            const base64Image = await generateImageWithStability(imagePrompt);
            imageUrl = await uploadToCloudinary(base64Image, `storyboards/${projectId}`);
            imageModel = "stability-sdxl";
          } else if (process.env.REPLICATE_API_TOKEN) {
            imageUrl = await generateImageWithReplicate(imagePrompt);
            imageModel = "replicate-sdxl";
          } else {
            throw geminiError; // Re-throw if no fallback available
          }
        }
      }
      // Fallback: Stability AI
      else if (process.env.STABILITY_API_KEY) {
        const base64Image = await generateImageWithStability(imagePrompt);
        imageUrl = await uploadToCloudinary(base64Image, `storyboards/${projectId}`);
        imageModel = "stability-sdxl";
      } 
      // Fallback: Replicate
      else if (process.env.REPLICATE_API_TOKEN) {
        imageUrl = await generateImageWithReplicate(imagePrompt);
        imageModel = "replicate-sdxl";
      }
      // No image API configured - return prompt only
      else {
        return NextResponse.json({
          success: true,
          mode: "prompt-only",
          prompt: imagePrompt,
          message: "No image generation API configured. GEMINI_API_KEY is required for image generation.",
          scene: scene,
        });
      }
    } catch (genError: any) {
      console.error("[IMAGE_GENERATION_ERROR]", genError);
      return NextResponse.json(
        { 
          error: `Image generation failed: ${genError.message}`,
          prompt: imagePrompt, // Return prompt so user can try manually
        },
        { status: 500 }
      );
    }

    // Update scene with the generated image
    const updatedScene = await prisma.scene.update({
      where: { id: sceneId },
      data: {
        storyboard: imageUrl,
        version: { increment: 1 },
      },
    });

    // Track usage
    await trackImageUsage({
      userId: session.user.id,
      projectId,
      sceneId,
      model: imageModel,
      prompt: imagePrompt,
      success: true,
    });

    return NextResponse.json({
      success: true,
      storyboard: imageUrl,
      prompt: imagePrompt,
      model: imageModel,
      quota: {
        used: quota.used + 1,
        limit: quota.limit,
        remaining: quota.remaining - 1,
      },
    });

  } catch (error: any) {
    console.error("[GENERATE_STORYBOARD_IMAGE_ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate storyboard image" },
      { status: 500 }
    );
  }
}
