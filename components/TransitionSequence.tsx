"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { BattlePhase, MatchAnalysis } from "@/lib/types";

const LABELS: Partial<Record<BattlePhase, string>> = {
  locked: "PROMPT LOCKED",
  analyzing: "ANALYZING...",
  matchFound: "MATCH FOUND",
  entering: "FIGHTERS ENTER",
  round: "ROUND 1",
};

interface TransitionSequenceProps {
  phase: BattlePhase;
  analysis: MatchAnalysis | null;
}

export default function TransitionSequence({ phase, analysis }: TransitionSequenceProps) {
  const label = LABELS[phase];
  if (!label) return null;

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-void/90 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          initial={{ opacity: 0, y: 12, letterSpacing: "0.1em" }}
          animate={{ opacity: 1, y: 0, letterSpacing: "0.25em" }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="font-display text-2xl sm:text-4xl text-ink uppercase text-center px-6"
        >
          {label}
        </motion.div>
      </AnimatePresence>

      {(phase === "matchFound" || phase === "entering" || phase === "round") && analysis && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mt-4 font-display text-xs sm:text-sm text-muted uppercase tracking-widest text-center px-6"
        >
          {analysis.fighterA.name}
          <span className="text-fighterA"> vs </span>
          {analysis.fighterB.name}
        </motion.p>
      )}
    </div>
  );
}
