export interface FighterInfo {
  name: string;
  description: string;
  visualConcept: string;
}

export interface MatchAnalysis {
  fighterA: FighterInfo;
  fighterB: FighterInfo;
  matchupTitle: string;
}

/**
 * Line-delimited event protocol streamed from /api/brawl.
 * The client reads the response body as NDJSON: one JSON object per line.
 */
export type BrawlServerEvent =
  | { type: "mode"; mode: "live" }
  | { type: "mode"; mode: "demo" }
  | { type: "meta"; analysis: MatchAnalysis }
  | { type: "delta"; text: string }
  | { type: "done" }
  | { type: "error"; message: string };

export type AttackStrength = "light" | "heavy" | "combo";

export interface AttackEvent {
  attacker: "A" | "B";
  strength: AttackStrength;
  damage: number;
}

export type BattlePhase =
  | "landing"
  | "locked"
  | "analyzing"
  | "matchFound"
  | "entering"
  | "round"
  | "fighting"
  | "finishing"
  | "knockout"
  | "error";
