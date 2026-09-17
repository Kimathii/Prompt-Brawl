# Prompt Brawl

A loading-screen replacement: while an AI response is being generated, your
prompt fights "The Wait" in a small arcade-style brawl instead of you staring
at a spinner.

## Run it

No build step. Just open `index.html` in a browser (double-click works, or
serve it with any static server / GitHub Pages).

## Two modes

- **Simulated (default, zero setup):** the fight runs on a timer scaled to
  your prompt length. Works immediately, no API key needed — good for a
  quick demo.
- **Live (optional):** expand "Add an API key for a real fight," paste a
  personal Anthropic API key, and the fight is driven by the real streaming
  response — each punch corresponds to an actual chunk of text arriving, and
  the "response ready" panel shows the real model output.

Live mode calls the Anthropic API directly from the browser using the
`anthropic-dangerous-direct-browser-access` header (Anthropic's documented
bring-your-own-key pattern for client-side apps — no backend needed). The
key lives only in a page variable, is never persisted or sent anywhere but
Anthropic, and clears on refresh.

**Do not commit a real API key into this repo or ship this pattern to public
users as-is** — it's meant for local testing / personal demos, since anyone
with devtools open can read the key out of the request.

## Where to go from here

- Swap the stick-figure fighters for real sprites/art if you have time.
- Add sound on hits/KO.
- Tune the health-decay curve in `runLiveFight` (currently `waitHealth *= 0.75`
  per chunk) if fights feel too short/long with your model of choice.
- Everything is in one file (`index.html`) — no dependencies besides two
  Google Fonts loaded via `<link>`.
