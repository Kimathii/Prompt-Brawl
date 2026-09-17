"use client";

import { useState } from "react";
import NextMatchups from "./NextMatchups";

const EXAMPLES = [
  "Batman vs Superman — who wins?",
  "Cats vs dogs",
  "React vs Vue",
  "Coffee vs tea",
];

interface PromptLandingProps {
  onStart: (prompt: string) => void;
}

export default function PromptLanding({ onStart }: PromptLandingProps) {
  const [prompt, setPrompt] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) onStart(prompt);
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-xl text-center">
      <div>
        <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-tight text-ink">
          PROMPT<span className="text-fighterA">BRAWL</span>
        </h1>
        <p className="mt-3 text-lg text-ink/80">Make your prompt throw hands.</p>
        <p className="mt-1 text-sm text-muted">
          Turn the wait for your AI response into a battle.
        </p>
      </div>

      <form onSubmit={submit} className="w-full flex flex-col items-center gap-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask anything. Start a brawl..."
          rows={3}
          className="w-full resize-none rounded-xl border border-line bg-panel px-4 py-3 text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-fighterA/70"
          aria-label="Your prompt"
        />
        <button
          type="submit"
          disabled={!prompt.trim()}
          className="font-display uppercase tracking-widest text-sm px-8 py-3 rounded-lg bg-fighterA text-void font-semibold hover:shadow-glowA transition-shadow disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fighterA"
        >
          Start Brawl
        </button>
      </form>

      <NextMatchups prompts={EXAMPLES} onSelect={setPrompt} />
    </div>
  );
}
