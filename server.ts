import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// MANDATORY: Top-Level Request Deserialization (Ordering Guarantee)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Lazy Google GenAI Client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY environment variable is missing.');
    }
    genAIClient = new GoogleGenAI({ apiKey: apiKey || '' });
  }
  return genAIClient;
}

// Resilient Model Fallback Ladder
const MODEL_FALLBACK_LADDER = [
  'gemini-3.6-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
  'gemini-3.7-flash',
];

interface FallbackResult {
  text: string;
  modelUsed: string;
}

/**
 * Resilient helper executing generateContent with an automated fallback ladder
 */
async function generateContentWithFallback(
  contents: any,
  systemInstruction?: string,
  config?: any
): Promise<FallbackResult> {
  const ai = getGenAI();
  let lastError: any = null;

  for (const model of MODEL_FALLBACK_LADDER) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction,
          ...config,
        },
      });

      const responseText = response.text || '';
      return {
        text: responseText,
        modelUsed: model,
      };
    } catch (err: any) {
      lastError = err;
      const status = err?.status || err?.statusCode || (err?.message?.includes('429') ? 429 : 500);
      console.warn(`Model ${model} failed with status ${status}. Attempting next fallback... Error:`, err?.message);
    }
  }

  throw new Error(
    `All models in fallback ladder exhausted. Last error: ${lastError?.message || 'Unknown error'}`
  );
}

// -------------------------------------------------------------
// API Routes
// -------------------------------------------------------------

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    aiConfigured: !!process.env.GEMINI_API_KEY,
  });
});

// Multi-turn Journal Chat Endpoint
app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  try {
    const body = (req.body && typeof req.body === 'object') ? req.body : {};
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const currentEntryTitle = typeof body.title === 'string' ? body.title : 'Journal Reflection';
    const userPrompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';

    if (!userPrompt && messages.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Prompt or conversation messages are required.',
      });
    }

    const systemInstruction = `You are a thoughtful, empathetic, and insight-driven AI Journaling & Reflection Companion powered by Gemini 3.6 Flash.
Your purpose is to help the user introspect, explore thoughts, unpack emotions, discover cognitive clarity, and brainstorm actionable solutions.
Guidelines:
1. Empathy & Active Listening: Validate feelings without being overly sycophantic. Reflect back key insights.
2. Socratic Guidance: Ask 1-2 thoughtful open-ended questions that provoke deeper clarity or novel perspectives.
3. Brainstorming Support: When the user faces decisions, blockers, or ideas, provide creative, structured angles and constructive options.
4. Tone: Warm, clear, grounded, inspiring, respectful of user privacy and autonomy.
5. Formatting: Use neat markdown (bullet points, bold highlights, concise paragraphs) for readability. Keep reflections focused (2-4 paragraphs max).
Never act as a replacement for clinical therapy; maintain a supportive journaling facilitator persona.`;

    // Map conversation history into Gemini format
    const contents: any[] = [];
    for (const msg of messages) {
      if (msg.role === 'user') {
        contents.push({ role: 'user', parts: [{ text: msg.text }] });
      } else if (msg.role === 'model') {
        contents.push({ role: 'model', parts: [{ text: msg.text }] });
      }
    }

    if (userPrompt) {
      contents.push({ role: 'user', parts: [{ text: userPrompt }] });
    }

    const result = await generateContentWithFallback(contents, systemInstruction);

    res.json({
      success: true,
      data: {
        text: result.text,
      },
      modelUsed: result.modelUsed,
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/chat:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to generate reflection response.',
    });
  }
});

// Summarize & Brainstorm Journal Entry Endpoint
app.post('/api/gemini/summarize', async (req: Request, res: Response) => {
  try {
    const body = (req.body && typeof req.body === 'object') ? req.body : {};
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const entryTitle = typeof body.title === 'string' ? body.title : 'Journal Reflection';

    if (messages.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one journal message or reflection is required to summarize.',
      });
    }

    // Build the transcript text
    const transcript = messages
      .map((m) => `${m.role === 'user' ? 'Journaler' : 'Gemini Companion'}: ${m.text}`)
      .join('\n\n');

    const systemInstruction = `You are an expert cognitive reflection analyzer and synthesizer.
Your job is to produce a structured JSON summary and brainstorming breakdown of the user's journal session.
You MUST respond with a valid JSON object matching this exact schema:
{
  "overview": "A concise 2-3 sentence synthesis of the reflection and core theme.",
  "keyThemes": ["Theme 1", "Theme 2", "Theme 3"],
  "emotionalTone": "A 2-4 word descriptor of the emotional climate (e.g., 'Reflective, Hopeful, Slightly Overwhelmed')",
  "mindsetScore": 8, // A number between 1 (highly confused/stressed) and 10 (exceptionally clear/centered)
  "actionableTakeaways": [
    "Concrete step 1",
    "Concrete step 2"
  ],
  "reflectionQuestions": [
    "Thought-provoking question for future journaling 1",
    "Thought-provoking question 2"
  ],
  "brainstormIdeas": [
    "Creative angle or idea to explore further 1",
    "Creative angle 2",
    "Creative angle 3"
  ]
}
Return ONLY valid JSON. Do not include markdown code block backticks.`;

    const promptContent = `Session Title: "${entryTitle}"\n\nFull Reflection Transcript:\n${transcript}\n\nPlease analyze this journal session and return the structured JSON object:`;

    const result = await generateContentWithFallback(
      promptContent,
      systemInstruction,
      { responseMimeType: 'application/json' }
    );

    let parsedSummary;
    try {
      // Clean possible fences
      let cleaned = result.text.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '').trim();
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```/, '').replace(/```$/, '').trim();
      }
      parsedSummary = JSON.parse(cleaned);
    } catch (parseErr) {
      console.warn('JSON parse error from Gemini summary, providing fallback:', parseErr);
      parsedSummary = {
        overview: result.text.slice(0, 300),
        keyThemes: ['Mindfulness', 'Personal Reflection'],
        emotionalTone: 'Reflective & Thoughtful',
        mindsetScore: 7,
        actionableTakeaways: ['Review personal goals', 'Practice daily mindfulness'],
        reflectionQuestions: ['What is one small win you achieved today?'],
        brainstormIdeas: ['Explore deeper habit tracking', 'Schedule dedicated quiet time'],
      };
    }

    res.json({
      success: true,
      data: parsedSummary,
      modelUsed: result.modelUsed,
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/summarize:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to generate session summary.',
    });
  }
});

// -------------------------------------------------------------
// Vite Dev Server / Production Static Serving
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Gemini Journal Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
