/* ================================================
   InterviewForge — Vercel Serverless Function
   /api/generate.js
   ================================================

   Environment Variable required:
     GROQ_API_KEY  — your Groq API key
                     Get it FREE at: https://console.groq.com/keys

   Model: llama-3.3-70b-versatile
   (Ultra-fast inference via Groq LPU — free tier available)
   ================================================ */

export default async function handler(req, res) {
  // ── Method guard ───────────────────────────────
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  // ── Parse body ─────────────────────────────────
  const { role, difficulty } = req.body || {};

  if (!role || typeof role !== 'string' || role.trim().length === 0) {
    return res.status(400).json({ error: 'Missing or invalid "role" field.' });
  }
  if (!difficulty) {
    return res.status(400).json({ error: 'Missing "difficulty" field.' });
  }

  // ── Call Groq ──────────────────────────────────
  try {
    const result = await callGroq(role.trim(), difficulty);
    return res.status(200).json({ result });
  } catch (err) {
    console.error('[InterviewForge API Error]', err.message);
    return res.status(500).json({
      error: err.message || 'Failed to generate questions. Please try again.',
    });
  }
}

// ── Groq API Call ──────────────────────────────
async function callGroq(role, difficulty) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error(
      'Groq API key not configured. Add GROQ_API_KEY to your Vercel environment variables. Get a free key at https://console.groq.com/keys'
    );
  }

  const prompt = buildPrompt(role, difficulty);

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',   // Best free Groq model — fast & smart
      max_tokens: 2048,
      temperature: 0.75,
      messages: [
        {
          role: 'system',
          content:
            'You are an expert technical interviewer with 15+ years of experience. Always follow the exact output format given by the user. Do not add any preamble, commentary, markdown code fences, or extra text outside the required format.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const msg = error?.error?.message || `Groq API error: ${response.status} ${response.statusText}`;
    throw new Error(msg);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;

  if (!text) throw new Error('Empty response from Groq. Please try again.');
  return text;
}

// ── Prompt Builder ─────────────────────────────
function buildPrompt(role, difficulty) {
  return `Generate interview questions for the following role:
Role: ${role}
Difficulty Level: ${difficulty}

Instructions:
- Provide exactly 5 Technical Questions with detailed answers
- Provide exactly 3 HR Questions with sample answers
- Keep answers clear, concise, and helpful for candidates
- Technical answers should cover key concepts, best practices, and real examples
- HR answers should follow the STAR method where applicable

Use EXACTLY this format. Do not deviate or add any text outside it:

=== Technical Questions ===

1. [Technical question here]
Answer: [Detailed answer here]

2. [Technical question here]
Answer: [Detailed answer here]

3. [Technical question here]
Answer: [Detailed answer here]

4. [Technical question here]
Answer: [Detailed answer here]

5. [Technical question here]
Answer: [Detailed answer here]

=== HR Questions ===

1. [HR question here]
Answer: [Sample answer here]

2. [HR question here]
Answer: [Sample answer here]

3. [HR question here]
Answer: [Sample answer here]`;
}