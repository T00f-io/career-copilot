// Calls Claude through the Career Copilot Cloudflare Worker proxy.
// Returns the text of Claude's response, or throws on error.

const WORKER_URL = import.meta.env.VITE_WORKER_URL

export async function askClaude({ system, messages, maxTokens = 2048 }) {
  if (!WORKER_URL) {
    throw new Error('Missing VITE_WORKER_URL. Check your .env file.')
  }

  const response = await fetch(WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ system, messages, max_tokens: maxTokens }),
  })

  const data = await response.json()

  if (!response.ok || data.error) {
    throw new Error(data.error?.message || data.error || `Worker error (${response.status})`)
  }

  // Extract text from Claude's content blocks
  const text = (data.content || [])
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n')

  return text
}