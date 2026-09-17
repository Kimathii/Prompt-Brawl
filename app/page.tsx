"use client";

import { useBrawl } from "@/lib/useBrawl";
import PromptLanding from "@/components/PromptLanding";
import TransitionSequence from "@/components/TransitionSequence";
import BattleArena from "@/components/BattleArena";
import ResponsePanel from "@/components/ResponsePanel";

const TRANSITION_PHASES = ["locked", "analyzing", "matchFound", "entering", "round"];
const ARENA_PHASES = ["fighting", "finishing", "knockout"];

export default function Home() {
  const { state, startBrawl, retry, brawlAgain } = useBrawl();
  const { phase, analysis, healthA, healthB, lastAttack, responseText, errorMessage, winner } = state;

  const showTransition = TRANSITION_PHASES.includes(phase);
  const showArena = ARENA_PHASES.includes(phase) && analysis !== null;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-10 gap-8">
      {phase === "landing" && <PromptLanding onStart={startBrawl} />}

      {showTransition && <TransitionSequence phase={phase} analysis={analysis} />}

      {showArena && analysis && (
        <BattleArena
          analysis={analysis}
          healthA={healthA}
          healthB={healthB}
          lastAttack={lastAttack}
          phase={phase}
          responseLength={responseText.length}
          winner={winner}
        />
      )}

      {phase === "knockout" && analysis && winner && (
        <ResponsePanel
          analysis={analysis}
          winner={winner}
          responseText={responseText}
          onBrawlAgain={brawlAgain}
          onNextPrompt={startBrawl}
        />
      )}

      {phase === "error" && (
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <p className="font-display text-lg uppercase tracking-widest text-fighterB">
            Something interrupted the brawl.
          </p>
          <p className="text-muted text-sm">{errorMessage}</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={retry}
              className="rounded-lg bg-fighterA text-void px-6 py-2.5 font-display uppercase text-sm tracking-widest hover:shadow-glowA transition-shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fighterA"
            >
              Try Again
            </button>
            <button
              type="button"
              onClick={brawlAgain}
              className="rounded-lg border border-line px-6 py-2.5 font-display uppercase text-sm tracking-widest text-ink/80 hover:text-ink transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-fighterA"
            >
              Back
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
