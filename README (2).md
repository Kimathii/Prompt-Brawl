# Prompt Brawl

**Make your prompt throw hands.**

A hackathon submission for the brief: *make waiting for AI fun.*

Prompt Brawl turns the dead air while an AI response streams in into a
two-fighter battle pulled straight out of your prompt. Ask "Batman vs
Superman — who wins?" and BATMAN and SUPERMAN throw down. Ask something
without an obvious rivalry and it still finds two things worth pitting
against each other — the arena is never empty.

The fight **is** the waiting experience, not a distraction next to it: every
chunk of the AI's response as it streams in lands as an attack. Fast
generation means a flurry of hits. A pause means the fighters size each
other up. When the response finishes, the battle ends and the answer is
revealed.

## How it works

1. You submit a prompt.
2. A fast model call turns it into two fighters + a matchup title (e.g.
   "CAFFEINE CLASH" for coffee vs tea). If no API key is configured, this
   happens locally with a small set of heuristics instead.
3. The real response streams from the model. Each text chunk becomes an
   attack: short chunks are light hits, longer chunks are heavy hits, and a
   burst of several chunks in quick succession triggers a combo. Attacks are
   throttled so the animation stays readable even during a very fast stream.
4. When the stream ends, the fighter with more health left wins, the K.O.
   sequence plays, and the full response is revealed with a copy button.
5. "Brawl Again" or one of the suggested next matchups starts a new fight
   immediately — no trip back to a landing page.

## Tech stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** for styling
- **Framer Motion** for the fight choreography
- **lucide-react** for icons
- A single Route Handler (`app/api/brawl/route.ts`) that streams a small
  newline-delimited JSON protocol to the client — no separate backend needed

No state-management library, no animation library beyond Framer Motion, no
UI kit. The battle logic lives in one hook (`lib/useBrawl.ts`) so it's easy
to read end to end.

## Local setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). It works immediately in
**demo mode** with no configuration — see below.

## Environment variables

Copy `.env.example` to `.env.local` and fill in a key to enable real AI
generation:

```bash
cp .env.example .env.local
```

| Variable | Required | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | No | Enables real fighter extraction + real streaming responses. Without it, the app runs entirely in demo mode. |
| `ANTHROPIC_MODEL` | No | Overrides the model used for the main generated response (defaults to `claude-sonnet-5`). Fighter extraction always uses a fast, cheap model regardless of this setting. |

No key is ever sent to or read by the browser — all model calls happen in
the Route Handler, server-side only.

## Demo mode

If `ANTHROPIC_API_KEY` isn't set, the server tells the client to run demo
mode instead of erroring out. The client then:

- extracts fighters locally using the same rule-based fallback the server
  would use if a real extraction call ever failed
- simulates a streamed response, word-chunk by word-chunk, at a natural
  irregular pace

This means the entire experience — landing, transition, battle, combos,
K.O., response reveal, rematch — can be demoed reliably with zero setup,
which matters most for a live hackathon demo.

## Deploying to Vercel

This is a standard Next.js App Router project — push it to a Git repo,
import it in Vercel, and add `ANTHROPIC_API_KEY` (and optionally
`ANTHROPIC_MODEL`) as environment variables in the Vercel project settings.
No other configuration is required.

## Architecture notes

- `lib/types.ts` — shared types, including the small NDJSON event protocol
  used between the server and client.
- `lib/extractFighters.ts` — pure, isomorphic heuristic fighter extraction
  (explicit "X vs Y" patterns → keyword fallback → "PROMPT vs ITS OPPOSITE"
  as a last resort). Used server-side as a fallback and client-side for
  demo mode.
- `lib/aiClient.ts` — server-only. Two calls: a cheap one-shot extraction
  call, and the main streaming generation call.
- `app/api/brawl/route.ts` — the only API route. Streams NDJSON events:
  `mode`, `meta`, `delta`, `done`, `error`.
- `lib/useBrawl.ts` — the battle engine. Owns phase state, health, the
  attack queue/cooldown, and both the live and demo code paths.
- `components/` — presentation only. `Fighter` and `HealthBar` are purely
  reactive to props; `BattleArena`, `TransitionSequence`, `PromptLanding`,
  and `ResponsePanel` compose them per phase.

## Future possibilities

- Real sprite/illustration art per fighter instead of the abstract
  geometric shapes (kept intentionally simple for build time).
- Sound design with a visible mute toggle.
- Letting the model's own structured output pick a thematically-justified
  winner instead of "whoever has more health left."
- Persisting past matchups so "what should fight next" can be
  crowd-sourced from real prompts other users have tried.
