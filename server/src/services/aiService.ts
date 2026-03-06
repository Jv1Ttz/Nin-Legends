import Groq from 'groq-sdk';
import { GoogleGenerativeAI, Content } from '@google/generative-ai';
import { InferenceClient } from '@huggingface/inference';

type Provider = 'groq' | 'gemini';

function getProvider(): Provider {
  const forced = process.env.AI_PROVIDER?.toLowerCase();
  if (forced === 'gemini') return 'gemini';
  if (forced === 'groq') return 'groq';

  if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your-groq-api-key-here') {
    return 'groq';
  }
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your-gemini-api-key-here') {
    return 'gemini';
  }
  throw new Error('Nenhuma API key configurada. Adicione GROQ_API_KEY ou GEMINI_API_KEY no .env');
}

// --- GROQ ---
let groqClient: Groq | null = null;
function getGroq() {
  if (!groqClient) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
}

async function groqNarrative(
  systemPrompt: string,
  messageHistory: { role: string; content: string }[],
  userMessage: string
): Promise<string> {
  const groq = getGroq();

  const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
    { role: 'system', content: systemPrompt },
    ...messageHistory.map((m) => ({
      role: (m.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user', content: userMessage },
  ];

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages,
    temperature: 0.9,
    max_tokens: 2048,
  });

  return response.choices[0]?.message?.content || 'O mestre ficou em silêncio...';
}

// --- GEMINI ---
let genAI: GoogleGenerativeAI | null = null;
function getGemini() {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  }
  return genAI;
}

function sanitizeHistory(messageHistory: { role: string; content: string }[]): Content[] {
  const mapped = messageHistory.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const sanitized: Content[] = [];
  for (const msg of mapped) {
    const last = sanitized[sanitized.length - 1];
    if (last && last.role === msg.role) {
      last.parts.push({ text: msg.parts[0].text });
    } else {
      sanitized.push({ role: msg.role as 'user' | 'model', parts: [...msg.parts] });
    }
  }

  if (sanitized.length > 0 && sanitized[0].role !== 'user') {
    sanitized.unshift({ role: 'user', parts: [{ text: '[Início da sessão]' }] });
  }
  if (sanitized.length > 0 && sanitized[sanitized.length - 1].role !== 'model') {
    sanitized.pop();
  }

  return sanitized;
}

async function geminiNarrative(
  systemPrompt: string,
  messageHistory: { role: string; content: string }[],
  userMessage: string
): Promise<string> {
  const client = getGemini();
  const model = client.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: { role: 'user', parts: [{ text: systemPrompt }] },
  });

  const history = sanitizeHistory(messageHistory);
  const chat = model.startChat({ history });
  const result = await chat.sendMessage(userMessage);
  return result.response.text();
}

// --- PUBLIC API ---
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      const status = (err as { status?: number }).status;
      if (status === 429 && attempt < maxRetries) {
        const waitSec = Math.pow(2, attempt + 1) * 3;
        console.log(`[AI] Rate limited. Aguardando ${waitSec}s...`);
        await new Promise((r) => setTimeout(r, waitSec * 1000));
        continue;
      }
      if (status === 429) {
        throw new Error('Limite da API de IA atingido. Aguarde ~1 minuto e tente novamente.');
      }
      throw err;
    }
  }
  throw new Error('Falha após múltiplas tentativas');
}

export async function generateNarrative(
  systemPrompt: string,
  messageHistory: { role: string; content: string }[],
  userMessage: string
): Promise<string> {
  const provider = getProvider();
  console.log(`[AI] Usando provedor: ${provider}`);

  return withRetry(async () => {
    if (provider === 'groq') {
      return groqNarrative(systemPrompt, messageHistory, userMessage);
    } else {
      return geminiNarrative(systemPrompt, messageHistory, userMessage);
    }
  });
}

export async function generateImage(prompt: string): Promise<string | null> {
  const hfKey = process.env.HUGGINGFACE_API_KEY;
  if (!hfKey || hfKey === 'your-huggingface-api-key-here') {
    return null;
  }

  try {
    const client = new InferenceClient(hfKey);
    const image = await client.textToImage(
      {
        // SDXL base oficial da Stability AI, com suporte em Inference Providers.
        model: 'stabilityai/stable-diffusion-xl-base-1.0',
        inputs: `anime style, original ninja RPG character (not Naruto, not an existing anime character), ${prompt}, high quality, detailed, vibrant colors`,
      },
      { outputType: 'blob' }
    );

    const buffer = Buffer.from(await image.arrayBuffer());
    const base64 = buffer.toString('base64');
    return `data:image/png;base64,${base64}`;
  } catch (err) {
    console.error('Image generation error:', err);
    return null;
  }
}
