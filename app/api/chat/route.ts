import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

// Initialize the Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // 1. Get context from Perplexity API
    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'sonar-pro', // Updated to the correct sonar-pro model
        messages: [
          { role: 'system', content: 'You are an assistant that provides concise, factual context for a given query. Focus on providing relevant information that can be used by another AI to generate a detailed answer.' },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!perplexityResponse.ok) {
      const errorText = await perplexityResponse.text();
      console.error('Perplexity API Error:', errorText);
      return NextResponse.json({ error: 'Failed to fetch context from Perplexity' }, { status: 500 });
    }

    const perplexityData = await perplexityResponse.json();
    const context = perplexityData.choices[0]?.message?.content || 'No context found.';

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

    // 3. Get the final answer from Gemini API
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(enhancedPrompt);
    const response = await result.response;
    const geminiAnswer = response.text();

    // 4. Send the final answer back to the client
    return NextResponse.json({ answer: geminiAnswer });

  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}
