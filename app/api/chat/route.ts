import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

async function getPerplexityContext(prompt: string) {
  const apiKey = process.env.PERPLEXITY_API_KEY?.trim();
  if (!apiKey) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.PERPLEXITY_MODEL?.trim() || 'sonar-pro',
        messages: [
          {
            role: 'system',
            content:
              "You are an assistant that provides concise, factual context for a given query. Focus on providing relevant information that can be used by another AI to generate a detailed answer.",
          },
          { role: 'user', content: prompt },
        ],
      }),
      signal: controller.signal,
    });

    if (!perplexityResponse.ok) {
      const errorText = await perplexityResponse.text().catch(() => '');
      console.error('Perplexity API Error:', perplexityResponse.status, errorText);
      return null;
    }

    const perplexityData = await perplexityResponse.json();
    const content =
      perplexityData?.choices?.[0]?.message?.content ??
      perplexityData?.choices?.[0]?.delta?.content ??
      null;

    return typeof content === 'string' && content.trim() ? content : null;
  } catch (error) {
    console.error('Perplexity API Request Failed:', error);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function getPerplexityAnswer(prompt: string) {
  const apiKey = process.env.PERPLEXITY_API_KEY?.trim();
  if (!apiKey) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.PERPLEXITY_MODEL?.trim() || 'sonar-pro',
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful assistant. Answer the user clearly and concisely. If the question involves coding, provide a complete, runnable code snippet.',
          },
          { role: 'user', content: prompt },
        ],
      }),
      signal: controller.signal,
    });

    if (!perplexityResponse.ok) {
      const errorText = await perplexityResponse.text().catch(() => '');
      console.error('Perplexity Answer Error:', perplexityResponse.status, errorText);
      return null;
    }

    const perplexityData = await perplexityResponse.json();
    const content =
      perplexityData?.choices?.[0]?.message?.content ??
      perplexityData?.choices?.[0]?.delta?.content ??
      null;

    return typeof content === 'string' && content.trim() ? content : null;
  } catch (error) {
    console.error('Perplexity Answer Request Failed:', error);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY?.trim();
    let geminiAnswer: string | null = null;

    if (geminiApiKey) {
      // 1. Get optional context from Perplexity (best-effort; chatbot still works if this fails)
      const context = (await getPerplexityContext(prompt)) ?? '';

      // 2. Create an enhanced prompt for Gemini
      const enhancedPrompt = `
        Based on the following context, please provide a comprehensive answer to the user's question.
        If the question involves coding, provide a complete, runnable code snippet.

        --- CONTEXT FROM PERPLEXITY ---
        ${context}
        ---------------------------------

        --- USER'S QUESTION ---
        ${prompt}
        -----------------------
      `;

      try {
        // 3. Get the final answer from Gemini API
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const modelName = process.env.GEMINI_MODEL?.trim() || 'gemini-1.5-flash-002';
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(enhancedPrompt);
        const response = await result.response;
        geminiAnswer = response.text();
      } catch (error) {
        console.error('Gemini API Error:', error);
      }
    }

    if (geminiAnswer) {
      return NextResponse.json({ answer: geminiAnswer, provider: 'gemini' });
    }

    const perplexityAnswer = await getPerplexityAnswer(prompt);
    if (perplexityAnswer) {
      return NextResponse.json({ answer: perplexityAnswer, provider: 'perplexity' });
    }

    if (!geminiApiKey) {
      return NextResponse.json(
        { error: 'Server is missing GEMINI_API_KEY and Perplexity fallback failed.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Both Gemini and Perplexity requests failed. Check server logs for details.' },
      { status: 500 }
    );

  } catch (error) {
    console.error('API Route Error:', error);
    const message = error instanceof Error ? error.message : 'An internal server error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
