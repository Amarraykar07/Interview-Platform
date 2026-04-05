module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });

  const { role, difficulty } = req.body || {};
  if (!role) return res.status(400).json({ error: 'Missing role.' });
  if (!difficulty) return res.status(400).json({ error: 'Missing difficulty.' });

  try {
    const result = await callGroq(role.trim(), difficulty);
    return res.status(200).json({ result });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

async function callGroq(role, difficulty) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not set in Vercel environment variables.');

  const prompt = `Generate interview questions for the following role:
Role: ${role}
Difficulty Level: ${difficulty}

Use EXACTLY this format:

=== Technical Questions ===

1. [question]
Answer: [answer]

2. [question]
Answer: [answer]

3. [question]
Answer: [answer]

4. [question]
Answer: [answer]

5. [question]
Answer: [answer]

=== HR Questions ===

1. [question]
Answer: [answer]

2. [question]
Answer: [answer]

3. [question]
Answer: [answer]`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 2048,
      temperature: 0.75,
      messages: [
        {
          role: 'system',
          content: 'You are an expert technical interviewer. Follow the exact output format. No extra text.',
        },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Groq error: ${response.status}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response from Groq.');
  return text;
}