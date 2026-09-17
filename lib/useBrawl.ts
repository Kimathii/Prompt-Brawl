"use client";

import { useCallback, useRef, useState } from "react";
import { extractFighters } from "@/lib/extractFighters";
import type { AttackEvent, BattlePhase, BrawlServerEvent, MatchAnalysis } from "@/lib/types";

const MIN_ATTACK_INTERVAL_MS = 220;
const COMBO_BACKLOG_THRESHOLD = 3;
const PHASE_STEP_MS = 420;

const DEMO_NOTE =
  "\n\n(This is demo mode — no ANTHROPIC_API_KEY was found. Add one to see a real model drive this fight.)";

function buildDemoText(analysis: MatchAnalysis): string {
  const { fighterA, fighterB } = analysis;
  return (
    `${fighterA.name} and ${fighterB.name} have circled each other since the prompt landed, ` +
    `and the real fight is happening right now, in front of you. Every burst of words is a flurry ` +
    `of blows; every pause is the two of them sizing each other up again. ` +
    `By the time this sentence ends, someone in this arena is going to be on the ground.` +
    DEMO_NOTE
  );
}

function chunkDemoText(text: string): string[] {
  const words = text.split(/(\s+)/).filter(Boolean);
  const chunks: string[] = [];
  let i = 0;
  while (i < words.length) {
    const size = 2 + Math.floor(Math.random() * 4);
    chunks.push(words.slice(i, i + size).join(""));
    i += size;
  }
  return chunks;
}

interface BrawlState {
  phase: BattlePhase;
  analysis: MatchAnalysis | null;
  healthA: number;
  healthB: number;
  lastAttack: (AttackEvent & { id: number }) | null;
  responseText: string;
  errorMessage: string | null;
  winner: "A" | "B" | null;
}

const INITIAL_STATE: BrawlState = {
  phase: "landing",
  analysis: null,
  healthA: 100,
  healthB: 100,
  lastAttack: null,
  responseText: "",
  errorMessage: null,
  winner: null,
};

export function useBrawl() {
  const [state, setState] = useState<BrawlState>(INITIAL_STATE);

  const queueRef = useRef<string[]>([]);
  const processingRef = useRef(false);
  const attackIdRef = useRef(0);
  const attackerTurnRef = useRef<"A" | "B">("A");
  const streamDoneRef = useRef(false);
  const promptRef = useRef("");

  const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

  const runIntroSequence = useCallback(async (analysis: MatchAnalysis) => {
    setState((s) => ({ ...s, analysis, phase: "matchFound" }));
    await wait(PHASE_STEP_MS);
    setState((s) => ({ ...s, phase: "entering" }));
    await wait(PHASE_STEP_MS);
    setState((s) => ({ ...s, phase: "round" }));
    await wait(PHASE_STEP_MS);
    setState((s) => ({ ...s, phase: "fighting" }));
  }, []);

  const isFinishedRef = useRef(false);

  const finish = useCallback(async () => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;
    setState((s) => ({ ...s, phase: "finishing" }));
    await wait(400);

    // Determine winner and drain the loser's health to 0 first
    let finalWinner: "A" | "B" = "A";
    setState((s) => {
      finalWinner = s.healthA === s.healthB ? (Math.random() < 0.5 ? "A" : "B") : s.healthA > s.healthB ? "A" : "B";
      return { 
        ...s, 
        healthA: finalWinner === "B" ? 0 : s.healthA,
        healthB: finalWinner === "A" ? 0 : s.healthB,
        winner: finalWinner 
      };
    });

    // Wait for the health bar animation to visually reach 0
    await wait(400);

    // Now trigger the knockout animation so it matches the empty bar
    setState((s) => ({ ...s, phase: "knockout" }));
  }, []);

  const processQueue = useCallback(() => {
    if (processingRef.current || isFinishedRef.current) return;
    processingRef.current = true;

    const step = () => {
      if (isFinishedRef.current) {
        processingRef.current = false;
        return;
      }
      
      const next = queueRef.current.shift();

      if (next === undefined) {
        processingRef.current = false;
        if (streamDoneRef.current) finish();
        return;
      }

      const backlog = queueRef.current.length;
      const isCombo = backlog >= COMBO_BACKLOG_THRESHOLD;
      const isHeavy = next.trim().length >= 15;
      const strength = isCombo ? "combo" : isHeavy ? "heavy" : "light";
      const baseDamage = isCombo ? 9 : isHeavy ? 14 : 7;

      const attacker = attackerTurnRef.current;
      attackerTurnRef.current = attacker === "A" ? "B" : "A";
      const id = ++attackIdRef.current;

      setState((s) => {
        // Drain health logarithmically so it never actually hits 0 during the stream
        const damageA = attacker === "B" ? Math.min(baseDamage, s.healthA * 0.15) : 0;
        const damageB = attacker === "A" ? Math.min(baseDamage, s.healthB * 0.15) : 0;
        
        return {
          ...s,
          healthA: Math.max(1, s.healthA - damageA),
          healthB: Math.max(1, s.healthB - damageB),
          responseText: s.responseText + next,
          lastAttack: { id, attacker, strength, damage: baseDamage },
        };
      });

      setTimeout(step, MIN_ATTACK_INTERVAL_MS);
    };

    step();
  }, [finish]);

  const enqueueDelta = useCallback(
    (text: string) => {
      queueRef.current.push(text);
      processQueue();
    },
    [processQueue]
  );

  const runDemo = useCallback(
    async (prompt: string) => {
      const analysis = extractFighters(prompt);
      await runIntroSequence(analysis);

      const chunks = chunkDemoText(buildDemoText(analysis));
      for (const chunk of chunks) {
        enqueueDelta(chunk);
        await wait(90 + Math.random() * 170);
      }
      streamDoneRef.current = true;
      if (!processingRef.current) finish();
    },
    [enqueueDelta, finish, runIntroSequence]
  );

  const runLive = useCallback(
    async (prompt: string) => {
      const resp = await fetch("/api/brawl", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!resp.body) {
        setState((s) => ({ ...s, phase: "error", errorMessage: "No response from server." }));
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let introStarted = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          let evt: BrawlServerEvent;
          try {
            evt = JSON.parse(line);
          } catch {
            continue;
          }

          if (evt.type === "mode" && evt.mode === "demo") {
            await runDemo(prompt);
            return;
          }

          if (evt.type === "meta") {
            introStarted = true;
            await runIntroSequence(evt.analysis);
          }

          if (evt.type === "delta") {
            enqueueDelta(evt.text);
          }

          if (evt.type === "done") {
            streamDoneRef.current = true;
            if (!processingRef.current) finish();
          }

          if (evt.type === "error") {
            setState((s) => ({ ...s, phase: "error", errorMessage: evt.message }));
            return;
          }
        }
      }

      if (!introStarted) {
        setState((s) => ({
          ...s,
          phase: "error",
          errorMessage: "Something interrupted the brawl before it started.",
        }));
      }
    },
    [enqueueDelta, finish, runDemo, runIntroSequence]
  );

  const startBrawl = useCallback(
    async (prompt: string) => {
      const clean = prompt.trim();
      if (!clean) return;

      promptRef.current = clean;
      queueRef.current = [];
      processingRef.current = false;
      streamDoneRef.current = false;
      attackerTurnRef.current = "A";
      isFinishedRef.current = false;

      setState({ ...INITIAL_STATE, phase: "locked" });
      await wait(PHASE_STEP_MS);
      setState((s) => ({ ...s, phase: "analyzing" }));

      try {
        await runLive(clean);
      } catch (err) {
        setState((s) => ({
          ...s,
          phase: "error",
          errorMessage: err instanceof Error ? err.message : "Something interrupted the brawl.",
        }));
      }
    },
    [runLive]
  );

  const retry = useCallback(() => {
    if (promptRef.current) startBrawl(promptRef.current);
  }, [startBrawl]);

  const brawlAgain = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  return { state, startBrawl, retry, brawlAgain };
}
