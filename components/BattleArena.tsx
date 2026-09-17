"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Swords } from "lucide-react";
import Fighter from "./Fighter";
import HealthBar from "./HealthBar";
import type { AttackEvent, BattlePhase, MatchAnalysis } from "@/lib/types";

interface BattleArenaProps {
  analysis: MatchAnalysis;
  healthA: number;
  healthB: number;
  lastAttack: (AttackEvent & { id: number }) | null;
  phase: BattlePhase;
  responseLength: number;
  winner: "A" | "B" | null;
}

function statusText(phase: BattlePhase, responseLength: number): string {
  if (phase === "finishing") return "FINAL ATTACK...";
  if (phase === "knockout") return "K.O.";
  if (responseLength === 0) return "AI IS THINKING...";
  return `GENERATING RESPONSE... ${responseLength} CHARS`;
}

export default function BattleArena({
  analysis,
  healthA,
  healthB,
  lastAttack,
  phase,
  responseLength,
  winner,
}: BattleArenaProps) {
  const isKnockedOut = phase === "knockout";

  return (
    <div className="relative w-full max-w-3xl rounded-2xl border border-line bg-panel/60 overflow-hidden px-5 py-6 sm:px-8 sm:py-8">
      {/* ambient background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(94,230,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(94,230,255,0.06) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-fighterA/10 blur-3xl animate-pulse-slow" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-fighterB/10 blur-3xl animate-pulse-slow" />

      <div className="relative">
        <p className="text-center font-display text-xs sm:text-sm text-muted uppercase tracking-[0.3em] mb-4">
          {analysis.matchupTitle}
        </p>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 mb-8">
          <HealthBar value={healthA} side="A" label={analysis.fighterA.name} />
          <Swords className="text-muted w-5 h-5 sm:w-6 sm:h-6 shrink-0" aria-hidden="true" />
          <HealthBar value={healthB} side="B" label={analysis.fighterB.name} />
        </div>

        <div className="flex items-end justify-between px-2 sm:px-8 h-36 sm:h-44 mb-6">
          <Fighter side="A" lastAttack={lastAttack} isKnockedOut={isKnockedOut} isWinner={winner === "A"} />
          <Fighter side="B" lastAttack={lastAttack} isKnockedOut={isKnockedOut} isWinner={winner === "B"} />
        </div>

        <div className="relative h-6 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={statusText(phase, responseLength)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-display text-[10px] sm:text-xs text-muted uppercase tracking-[0.25em] text-center"
              aria-live="polite"
            >
              {statusText(phase, responseLength)}
            </motion.p>
          </AnimatePresence>

          <AnimatePresence>
            {lastAttack?.strength === "combo" && (
              <motion.span
                key={lastAttack.id}
                initial={{ opacity: 0, scale: 0.6, y: 0 }}
                animate={{ opacity: 1, scale: 1, y: -18 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute font-display text-sm text-fighterB uppercase tracking-widest"
              >
                Combo!
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
