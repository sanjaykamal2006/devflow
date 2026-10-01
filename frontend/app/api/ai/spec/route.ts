import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

interface SpecRequestBody {
  title: string;
  description: string;
  issueType?: 'TASK' | 'BUG' | 'FEATURE';
  mode?: 'PRD' | 'BUG_REPORT' | 'CHECKLIST' | 'ARCHITECTURE' | 'SUBTASKS';
  customInstructions?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: SpecRequestBody = await req.json();
    const { title, description, issueType = 'FEATURE', mode = 'PRD', customInstructions } = body;

    const providerHeader = req.headers.get('X-DevFlow-AI-Provider') || 'gemini';
    const apiKeyHeader = req.headers.get('X-DevFlow-AI-Key') || '';

    // Check if external key exists in header or env
    const apiKey =
      apiKeyHeader ||
      (providerHeader === 'gemini' ? process.env.GEMINI_API_KEY : '') ||
      (providerHeader === 'groq' ? process.env.GROQ_API_KEY : '') ||
      (providerHeader === 'openai' ? process.env.OPENAI_API_KEY : '') ||
      (providerHeader === 'anthropic' ? process.env.ANTHROPIC_API_KEY : '');

    if (!apiKey) {
      return NextResponse.json({ error: 'No API key provided' }, { status: 400 });
    }

    const systemPrompt = `You are DevFlow AI Spec Doctor, an elite Principal Software Architect and Staff Engineer at a hyper-growth tech company.
Your role is to transform raw, messy developer notes and bug reports into crisp, crystal-clear, actionable, production-grade GitHub/Linear Markdown specifications.
Never return conversational fluff or conversational intros/outros like "Sure, here is your PRD:". Output ONLY the Markdown specification.

Rules:
1. Ground every acceptance criteria and reproduction step directly in the user's specific text, technologies, endpoints, and components.
2. If it's a bug, identify concrete root causes, reproduction steps, and regression test cases.
3. If it's a feature, define clear functional scope, UI/API invariants, edge cases, and telemetry.
4. Format using clean GitHub-flavored Markdown with bold labels, code backticks, and checkboxes (- [ ]).`;

    const userPrompt = `Title: ${title}
Type: ${issueType}
Mode: ${mode}
Raw Notes & Context:
${description || '(No additional description provided - extrapolate from title)'}

${customInstructions ? `Special Directives: ${customInstructions}` : ''}

Generate the specification in mode: ${mode}.`;

    let specText = '';

    // 1. Google Gemini API (Supports free-tier keys e.g. gemini-1.5-flash)
    if (providerHeader === 'gemini') {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const res = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        return NextResponse.json({ error: `Gemini API Error: ${err}` }, { status: 502 });
      }

      const data = await res.json();
      specText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }

    // 2. Groq (Llama 3.3 70B Versatile - Ultra-fast)
    else if (providerHeader === 'groq') {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.3,
          max_tokens: 2048,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        return NextResponse.json({ error: `Groq API Error: ${err}` }, { status: 502 });
      }

      const data = await res.json();
      specText = data?.choices?.[0]?.message?.content || '';
    }

    // 3. OpenAI (GPT-4o mini)
    else if (providerHeader === 'openai') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.3,
          max_tokens: 2048,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        return NextResponse.json({ error: `OpenAI API Error: ${err}` }, { status: 502 });
      }

      const data = await res.json();
      specText = data?.choices?.[0]?.message?.content || '';
    }

    // 4. Anthropic Claude (Claude 3.5 Sonnet)
    else if (providerHeader === 'anthropic') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
          max_tokens: 2048,
          temperature: 0.3,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        return NextResponse.json({ error: `Anthropic API Error: ${err}` }, { status: 502 });
      }

      const data = await res.json();
      specText = data?.content?.[0]?.text || '';
    }

    // 5. OpenRouter
    else if (providerHeader === 'openrouter') {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://devflow.io',
          'X-Title': 'DevFlow AI Spec Doctor',
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.3-70b-instruct:free',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.3,
          max_tokens: 2048,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        return NextResponse.json({ error: `OpenRouter API Error: ${err}` }, { status: 502 });
      }

      const data = await res.json();
      specText = data?.choices?.[0]?.message?.content || '';
    }

    return NextResponse.json({ spec: specText });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error in AI Spec route' },
      { status: 500 }
    );
  }
}
