import type { MatchAnalysis } from "./types";
import { extractFighters } from "./extractFighters";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";

// Fast/cheap model for the one-shot fighter extraction call.
const EXTRACTION_MODEL = "claude-haiku-4-5-20251001";
// Main generation model — overridable via env so this can be swapped without a code change.
const RESPONSE_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

function apiKey(): string | undefined {
  return process.env.ANTHROPIC_API_KEY;
}

export function hasApiKey(): boolean {
  return Boolean(apiKey());
}

const EXTRACTION_SYSTEM_PROMPT = `You turn a user's message into two opposing "fighters" for a playful battle visualization.
Respond with ONLY a JSON object, no prose, no markdown fences, matching exactly:
{"fighterA":{"name":"...","description":"...","visualConcept":"..."},"fighterB":{"name":"...","description":"...","visualConcept":"..."},"matchupTitle":"..."}

Rules:
- If the message names two things that could compete or contrast, use those as fighterA and fighterB.
- If it doesn't, invent two meaningful, playful concepts related to the message's main subject — never leave a fighter blank or generic like "Unknown".
- name: 1-3 words, ALL CAPS friendly (you provide normal case, the UI will style it).
- description: under 8 words, playful.
- visualConcept: a short phrase describing a simple visual motif for this fighter (e.g. "sleek chrome bat-shape", "warm ceramic mug with steam").
- matchupTitle: a punchy 2-5 word title for the whole matchup, ALL CAPS, e.g. "CAFFEINE CLASH".
Keep it fun and concise. Never include anything except the JSON object.`;

/**
 * One quick, non-streaming call to turn the prompt into two fighters.
 * Falls back to local heuristics on any failure (network, bad JSON, no key).
 */
export async function analyzeMatch(prompt: string): Promise<MatchAnalysis> {
  const key = apiKey();
  if (!key) return extractFighters(prompt);

  try {
    const resp = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: EXTRACTION_MODEL,
        max_tokens: 300,
        system: EXTRACTION_SYSTEM_PROMPT,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!resp.ok) return extractFighters(prompt);

    const data = await resp.json();
    const text: string | undefined = data?.content?.find(
      (b: { type: string }) => b.type === "text"
    )?.text;
    if (!text) return extractFighters(prompt);

    const cleaned = text.trim().replace(/^```json\s*|```$/g, "");
    const parsed = JSON.parse(cleaned);

    if (parsed?.fighterA?.name && parsed?.fighterB?.name) {
      return {
        fighterA: {
          name: parsed.fighterA.name,
          description: parsed.fighterA.description ?? "",
          visualConcept: parsed.fighterA.visualConcept ?? "",
        },
        fighterB: {
          name: parsed.fighterB.name,
          description: parsed.fighterB.description ?? "",
          visualConcept: parsed.fighterB.visualConcept ?? "",
        },
        matchupTitle: parsed.matchupTitle ?? `${parsed.fighterA.name} vs ${parsed.fighterB.name}`,
      };
    }
    return extractFighters(prompt);
  } catch {
    return extractFighters(prompt);
  }
}

/**
 * Streams the real response as raw text deltas via the callback.
 * Resolves with the full accumulated text once the stream ends.
 * Throws on a hard failure (bad key, network error, non-OK response).
 */
export async function streamResponse(
  prompt: string,
  onChunk: (text: string) => void
): Promise<string> {
  const key = apiKey();
  if (!key) throw new Error("No API key configured");

  const resp = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": ANTHROPIC_VERSION,
    },
    body: JSON.stringify({
      model: RESPONSE_MODEL,
      max_tokens: 1024,
      stream: true,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!resp.ok || !resp.body) {
    const errBody = await resp.text().catch(() => "");
    throw new Error(`Anthropic API error ${resp.status}: ${errBody.slice(0, 200)}`);
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let fullText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (!data) continue;

      let evt: { type?: string; delta?: { text?: string } };
      try {
        evt = JSON.parse(data);
      } catch {
        continue;
      }

      if (evt.type === "content_block_delta" && evt.delta?.text) {
        fullText += evt.delta.text;
        onChunk(evt.delta.text);
      }
    }
  }

  return fullText;
}
