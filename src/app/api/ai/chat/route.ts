import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

// Rate limiting - simple in-memory store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const limit = rateLimitStore.get(userId);
  
  if (!limit || now > limit.resetTime) {
    rateLimitStore.set(userId, { count: 1, resetTime: now + 60000 }); // 1 minute window
    return true;
  }
  
  if (limit.count >= 20) { // 20 requests per minute
    return false;
  }
  
  limit.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check rate limit
    if (!checkRateLimit(session.user.id)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a moment.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { message, context, projectType, currentStep } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Build a contextual system prompt
    const systemPrompt = buildSystemPrompt(projectType, currentStep, context);

    const model = genAI.getGenerativeModel({ model: 'gemini-3.0-flash' });

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: systemPrompt },
            { text: `\n\nUser's question: ${message}` }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 1000,
      }
    });

    const response = result.response.text();

    return NextResponse.json({
      success: true,
      response: response
    });

  } catch (error) {
    console.error('AI Chat error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get AI response',
        fallback: generateFallbackResponse()
      },
      { status: 500 }
    );
  }
}

function buildSystemPrompt(projectType?: string, currentStep?: string, context?: string): string {
  const projectTypeGuide: Record<string, string> = {
    shortfilm: 'short film (5-30 minutes)',
    screenplay: 'feature film screenplay (90-120 pages)',
    shortstory: 'short story (1,500-7,500 words)',
    novel: 'novel (50,000-100,000 words)',
    webseries: 'web series (5-15 minute episodes)',
    documentary: 'documentary film',
    podcast: 'narrative podcast'
  };

  const stepGuide: Record<string, string> = {
    idea: 'brainstorming and developing the core concept',
    logline: 'crafting a compelling one-sentence summary',
    treatment: 'writing the prose overview of the story',
    characters: 'developing deep, compelling characters',
    scenes: 'structuring and breaking down scenes',
    script: 'writing dialogue and screenplay format',
    theme: 'exploring the deeper meaning and themes',
    structure: 'organizing the narrative arc',
    'world-building': 'creating the story world',
    outline: 'mapping the story beats',
    'narrative-draft': 'writing the actual prose'
  };

  let prompt = `You are a friendly, encouraging writing assistant helping a storyteller craft their ${projectTypeGuide[projectType || 'shortfilm'] || 'creative project'}.

Your personality:
- Warm and supportive, like a knowledgeable friend
- Enthusiastic about their ideas without being sycophantic
- Practical with actionable suggestions
- Ask clarifying questions when helpful
- Use emojis sparingly to add warmth

Current context:`;

  if (currentStep) {
    prompt += `\nThe writer is currently working on: ${stepGuide[currentStep] || currentStep}`;
  }

  if (context) {
    prompt += `\n\nTheir current content:\n"${context.substring(0, 1000)}${context.length > 1000 ? '...' : ''}"`;
  }

  prompt += `\n\nGuidelines for your response:
- Keep responses concise (2-4 short paragraphs max)
- Give specific, actionable advice
- When suggesting improvements, explain WHY
- If they're stuck, offer 2-3 concrete options
- Celebrate progress and good ideas
- Reference screenwriting/storytelling craft where relevant`;

  return prompt;
}

function generateFallbackResponse(): string {
  const fallbacks = [
    "I'm having trouble connecting right now, but here's a tip: When you're stuck, try writing the scene from a different character's perspective. It often reveals hidden motivations!",
    "My connection is spotty, but don't let that stop you! Try the 'What if the opposite happened?' technique - it's great for breaking through blocks.",
    "I can't quite reach my brain right now 😅 But here's something to try: Write the worst possible version of this scene. Seriously! It often frees up your creativity.",
    "Technical difficulties on my end! Meanwhile, try this: Read your last paragraph out loud. Your ear will catch things your eyes miss.",
    "I'm having connection issues, but keep writing! Remember: You can't edit a blank page. Get something down, and we'll polish it later."
  ];
  
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}
