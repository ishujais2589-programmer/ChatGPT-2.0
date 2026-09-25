import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI server-side with telemetry header
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    model: 'gemini-3.8-flash',
  });
});

// Server-sent events streaming chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, systemPrompt } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured in the server environment.',
      });
    }

    // Format chat contents for @google/genai
    // Note: each message must have role 'user' or 'model' and parts array
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content || '' }],
    }));

    // SSE headers setup
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const defaultSystemInstruction =
      'You are ChatGPT, an advanced, omni-capable, and highly knowledgeable AI assistant. ' +
      'You have expertise across ALL fields and domains, and you answer all types of questions with precision, depth, and clarity: ' +
      '1. Coding & Software Development: Write clean, modern, idiomatic code in any language (Python, JavaScript, TypeScript, C++, Java, Rust, Go, SQL, HTML/CSS, etc.) with explanations, architecture advice, bug fixing, and complexity analysis. ' +
      '2. Mathematics & Logic: Provide rigorous, step-by-step mathematical solutions, proofs, algebraic steps, statistics, calculus, and logical puzzle solutions. ' +
      '3. Science, Engineering & Medicine: Explain physics, chemistry, biology, mechanics, medicine concepts, and astronomy accurately at any level of depth. ' +
      '4. Writing & Humanities: Draft essays, speeches, emails, stories, poems, philosophical arguments, historical summaries, and language translations with stylistic finesse. ' +
      '5. Business, Finance & Law: Provide financial formulas, market analysis, business models, SWOT analysis, and strategic plans. ' +
      '6. Everyday Advice & Trivia: Answer general knowledge questions, recipes, productivity tips, travel ideas, and life recommendations. ' +
      'Always format responses cleanly using Markdown with headings, bullet points, bold key terms, tables where helpful, and tagged code blocks. ' +
      'Maintain an articulate, encouraging, and respectful tone.';

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: systemPrompt || defaultSystemInstruction,
      },
    });

    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error: any) {
    console.error('Chat error:', error);
    const errorMessage = error?.message || 'An error occurred while generating a response.';
    if (!res.headersSent) {
      res.status(500).json({ error: errorMessage });
    } else {
      res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
      res.end();
    }
  }
});

// Setup dev server with Vite or serve static production build
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ChatGPT AI Server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
