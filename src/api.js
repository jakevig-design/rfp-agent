
// src/api.js
// ─────────────────────────────────────────────────────────────
// Standard Claude API wrapper — drop this into any Vite+React
// project. All components call these functions instead of
// fetching Anthropic directly.
//
// Requirements:
//   1. /api/claude.js proxy exists at repo root (see below)
//   2. ANTHROPIC_API_KEY is set in Vercel environment variables
// ─────────────────────────────────────────────────────────────

const PROXY = '/api/claude';

/**
 * Base call — returns raw text from Claude.
 * @param {string} system  - System prompt
 * @param {string} user    - User message
 * @returns {Promise<string>}
 */
export async function callClaude(system, user) {
  const res = await fetch(PROXY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ system, user }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Claude API error ${res.status}: ${detail}`);
  }

  const data = await res.json();

  if (data.error) {
    throw new Error(`Claude error: ${data.error.message}`);
  }

  return data.content?.find(b => b.type === 'text')?.text ?? '';
}

/**
 * JSON call — parses Claude's response as JSON automatically.
 * Use when you need structured data back (arrays, objects).
 * Your system prompt must instruct Claude to return JSON only.
 * @param {string} system  - System prompt (must request JSON output)
 * @param {string} user    - User message
 * @returns {Promise<any>}
 */
export async function callClaudeJSON(system, user) {
  const text = await callClaude(system, user);
  const clean = text
    .replace(/```json\s*/gi, '')
    .replace(/```/g, '')
    .trim();

  try {
    return JSON.parse(clean);
  } catch (e) {
    console.error('Failed to parse Claude JSON response:', text);
    throw new Error('Claude returned invalid JSON. Check your system prompt.');
  }
}
