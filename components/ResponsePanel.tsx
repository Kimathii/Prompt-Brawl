"use client";

import { useState } from "react";
import { Copy, Check, Swords } from "lucide-react";
import NextMatchups from "./NextMatchups";
import type { MatchAnalysis } from "@/lib/types";

const NEXT_PROMPTS = [
  "Tabs vs spaces",
  "Morning vs night",
  "Frontend vs backend",
  "Books vs movies",
  "Summer vs winter",
];

interface ResponsePanelProps {
  analysis: MatchAnalysis;
  winner: "A" | "B";
  responseText: string;
  onBrawlAgain: () => void;
  onNextPrompt: (prompt: string) => void;
}

function renderResponse(text: string) {
  const parts = text.split(/```/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <pre
        key={i}
        className="my-3 overflow-x-auto rounded-lg bg-void border border-line px-4 py-3 text-sm text-fighterA font-mono"
      >
        <code>{part.trim()}</code>
      </pre>
    ) : (
      part
        .split(/\n{2,}/)
        .filter(Boolean)
        .map((para, j) => (
          <p key={`${i}-${j}`} className="mb-3 last:mb-0 whitespace-pre-wrap">
            {para}
          </p>
        ))
    )
  );
}

export default function ResponsePanel({
  analysis,
  winner,
  responseText,
  onBrawlAgain,
  onNextPrompt,
}: ResponsePanelProps) {
  const [copied, setCopied] = useState(false);
  const winnerInfo = winner === "A" ? analysis.fighterA : analysis.fighterB;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(responseText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable — silently ignore */
    }
  };

  return (
    <div className="w-full max-w-2xl flex flex-col items-center gap-6 mt-6">
      <div className="flex items-center gap-2 font-display text-lg sm:text-xl uppercase tracking-widest">
        <Swords className={winner === "A" ? "text-fighterA" : "text-fighterB"} aria-hidden="true" />
        <span className={winner === "A" ? "text-fighterA" : "text-fighterB"}>
          {winnerInfo.name} wins
        </span>
      </div>

      <div className="w-full rounded-2xl border border-line bg-panel px-5 py-5 sm:px-7 sm:py-6">
        <div className="flex items-center justify-between mb-3">
          <span className="font-display text-xs text-muted uppercase tracking-[0.25em]">
            Response Unlocked
          </span>
          <button
            type="button"
            onClick={copy}
            className="flex items-center gap-1.5 text-xs text-muted hover:text-ink transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-fighterA rounded px-2 py-1"
            aria-label="Copy response"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto text-ink/90 text-[15px] leading-relaxed pr-1">
          {renderResponse(responseText)}
        </div>
      </div>

      <button
        type="button"
        onClick={onBrawlAgain}
        className="font-display uppercase tracking-widest text-sm px-8 py-3 rounded-lg bg-fighterA text-void font-semibold hover:shadow-glowA transition-shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fighterA"
      >
        Brawl Again
      </button>

      <NextMatchups
        title="What should fight next?"
        prompts={NEXT_PROMPTS}
        onSelect={onNextPrompt}
      />
    </div>
  );
}
