import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || '');

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

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

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
        maxOutputTokens: 1500,
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
    podcast: 'narrative podcast',
    story: 'creative story'
  };

  const stepGuide: Record<string, string> = {
    idea: 'brainstorming and developing the core concept/premise',
    logline: 'crafting a compelling one-sentence summary that hooks readers',
    treatment: 'writing the prose overview/treatment of the full story',
    characters: 'developing deep, compelling, multi-dimensional characters',
    scenes: 'structuring and breaking down individual scenes',
    script: 'writing dialogue, action lines, and screenplay format',
    'full-script': 'writing the complete screenplay/script',
    theme: 'exploring the deeper meaning, themes, and message',
    structure: 'organizing the narrative arc and story beats',
    'world-building': 'creating the story world, setting, and rules',
    outline: 'mapping the complete story beats and plot points',
    'narrative-draft': 'writing the actual prose/narrative',
    synopsis: 'writing a compelling story summary',
    format: 'deciding the format and structure for the project',
    'season-arc': 'planning the overarching season narrative',
    episodes: 'planning individual episodes',
    questions: 'developing interview questions for documentary',
    storyboard: 'visualizing scenes through storyboards'
  };

  const currentProjectType = projectTypeGuide[projectType || 'shortfilm'] || 'creative project';
  const currentStepDesc = stepGuide[currentStep || 'idea'] || currentStep || 'their creative work';

  let prompt = `You are an expert AI writing assistant for AI Story Studio, a creative writing platform. You're helping a writer craft their ${currentProjectType}.

## Your Role & Personality
- You're like a knowledgeable screenwriting professor combined with a supportive friend
- You're enthusiastic and encouraging, but also provide honest, constructive feedback
- You give specific, actionable advice - not vague platitudes
- You understand storytelling craft deeply: structure, character arcs, dialogue, pacing, theme
- You can answer questions on ANY topic intelligently - you're a well-rounded assistant
- Use emojis occasionally to add warmth (🎬 ✨ 💡) but don't overdo it

## Current Context
**Project Type:** ${currentProjectType}
**Current Step:** ${currentStepDesc}`;

  if (context && context.trim()) {
    const truncatedContext = context.substring(0, 2000);
    prompt += `

**Writer's Current Content:**
---
${truncatedContext}${context.length > 2000 ? '\n[...content truncated]' : ''}
---`;
  } else {
    prompt += `

**Writer's Current Content:** (No content written yet - they're just getting started)`;
  }

  prompt += `

## How to Respond
1. **If asked about their story/project:** Give specific, tailored feedback based on the context above. Reference their actual content when relevant.

2. **If asked a writing craft question:** Share expertise on screenwriting, storytelling, character development, dialogue, structure, etc. Use examples from well-known films/books when helpful.

3. **If asked a general question:** Answer it intelligently and helpfully! You're a smart assistant who can discuss any topic - movies, history, science, current events, etc. Don't refuse to answer just because it's not about their story.

4. **If they seem stuck:** Offer 2-3 concrete options or exercises to get unstuck. Writers block is real - be helpful!

5. **Format guidelines:**
   - Keep responses focused and readable (2-4 paragraphs usually)
   - Use bullet points for lists of suggestions
   - Bold key terms or concepts when helpful
   - If suggesting rewrites, show before/after examples

Remember: You're their creative partner. Celebrate their progress, push them to be better, and make the writing process enjoyable!`;

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
