import type { FighterInfo, MatchAnalysis } from "./types";

const STOPWORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "do", "does", "did",
  "which", "what", "who", "why", "how", "should", "would", "could",
  "i", "you", "we", "they", "it", "my", "your", "our", "their",
  "for", "to", "of", "in", "on", "at", "and", "or", "but", "vs",
  "versus", "better", "best", "than", "please", "explain", "tell",
  "me", "about", "use", "using", "pick", "choose", "think", "that",
  "this", "one", "will", "can", "win", "wins", "winner",
]);

const THEMED_TITLES: Record<string, string> = {
  "batman|superman": "THE DARK KNIGHT vs THE MAN OF STEEL",
  "cats|dogs": "PAWS OF FURY",
  "coffee|tea": "CAFFEINE CLASH",
  "react|vue": "FRAMEWORK FEUD",
  "iphone|android": "OS WARFARE",
  "tabs|spaces": "THE INDENTATION WAR",
  "summer|winter": "SEASON SHOWDOWN",
  "books|movies": "MEDIUM MATCHUP",
};

function cleanEntity(raw: string): string {
  return raw
    .replace(/[?.!,]/g, "")
    .replace(/^(a|an|the)\s+/i, "")
    .trim();
}

function titleCase(s: string): string {
  return s.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase());
}

function themedTitle(a: string, b: string, fallback: string): string {
  const key1 = `${a.toLowerCase()}|${b.toLowerCase()}`;
  const key2 = `${b.toLowerCase()}|${a.toLowerCase()}`;
  return THEMED_TITLES[key1] ?? THEMED_TITLES[key2] ?? fallback;
}

function buildFighter(name: string): FighterInfo {
  return {
    name: titleCase(name),
    description: name,
    visualConcept: name.toLowerCase(),
  };
}

/**
 * Level 1/2: explicit "X vs Y" / "X versus Y" / "X or Y" patterns.
 */
function extractExplicit(prompt: string): [string, string] | null {
  const patterns = [
    /(.+?)\s+(?:vs\.?|versus)\s+(.+)/i,
    /(.+?)\s+or\s+(.+?)(?:\s+for\s+.+)?$/i,
  ];
  for (const pattern of patterns) {
    const match = prompt.match(pattern);
    if (match) {
      const a = cleanEntity(match[1]);
      const b = cleanEntity(match[2]);
      if (a && b && a.length <= 40 && b.length <= 40) {
        return [a, b];
      }
    }
  }
  return null;
}

/**
 * Level 3: no explicit contrast — pull the two most "meaningful" words
 * (longest non-stopwords) out of the sentence as a playful stand-in.
 */
function extractFromKeywords(prompt: string): [string, string] | null {
  const words = prompt
    .replace(/[?.!,]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w.toLowerCase()));

  const unique = Array.from(new Set(words.map((w) => w.toLowerCase())));
  if (unique.length >= 2) {
    const sorted = [...unique].sort((x, y) => y.length - x.length);
    return [sorted[0], sorted[1]];
  }
  if (unique.length === 1) {
    return [unique[0], "the unknown"];
  }
  return null;
}

export function extractFighters(prompt: string): MatchAnalysis {
  const trimmed = prompt.trim();

  const explicit = extractExplicit(trimmed);
  const pair = explicit ?? extractFromKeywords(trimmed);

  if (!pair) {
    const short = trimmed.length > 24 ? trimmed.slice(0, 24) + "…" : trimmed || "YOUR PROMPT";
    return {
      fighterA: buildFighter(short),
      fighterB: buildFighter("its opposite"),
      matchupTitle: "PROMPT vs ITS OPPOSITE",
    };
  }

  const [a, b] = pair;
  return {
    fighterA: buildFighter(a),
    fighterB: buildFighter(b),
    matchupTitle: themedTitle(a, b, `${a.toUpperCase()} vs ${b.toUpperCase()}`),
  };
}
