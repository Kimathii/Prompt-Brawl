"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { AttackEvent } from "@/lib/types";

interface FighterProps {
  side: "A" | "B";
  lastAttack: (AttackEvent & { id: number }) | null;
  isKnockedOut: boolean;
  isWinner: boolean;
}

type Pose = "idle" | "punch" | "hit";

export default function Fighter({ side, lastAttack, isKnockedOut, isWinner }: FighterProps) {
  const [pose, setPose] = useState<Pose>("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!lastAttack) return;
    const nextPose: Pose = lastAttack.attacker === side ? "punch" : "hit";
    setPose(nextPose);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setPose("idle"), 180);
    return () => clearTimeout(timeoutRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastAttack?.id]);

  const isA = side === "A";
  const facing = isA ? 1 : -1;

  const bodyVariants = {
    idle: { x: 0, rotate: 0, y: [0, -6, 0] },
    punch: { x: 18 * facing, rotate: 6 * facing, y: 0 },
    hit: { x: -10 * facing, rotate: -4 * facing, y: 0 },
  };

  if (isKnockedOut && !isWinner) {
    return (
      <motion.div
        className="relative w-28 h-28 sm:w-36 sm:h-36"
        initial={{ rotate: 0, opacity: 1, y: 0 }}
        animate={{ rotate: 80 * facing, opacity: 0.35, y: 24 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <FighterShape isA={isA} />
      </motion.div>
    );
  }

  return (
    <motion.div
      className="relative w-28 h-28 sm:w-36 sm:h-36"
      animate={
        isKnockedOut && isWinner
          ? { y: [0, -14, 0] }
          : bodyVariants[pose]
      }
      transition={
        isKnockedOut && isWinner
          ? { duration: 0.5, repeat: Infinity, ease: "easeInOut" }
          : pose === "idle"
          ? { duration: 2.2, repeat: Infinity, ease: "easeInOut" }
          : { duration: 0.16, ease: "easeOut" }
      }
    >
      <FighterShape isA={isA} bright={pose !== "idle"} />
    </motion.div>
  );
}

function FighterShape({ isA, bright }: { isA: boolean; bright?: boolean }) {
  return (
    <div className={`relative w-full h-full ${isA ? "shadow-glowA" : "shadow-glowB"}`}>
      <div
        className={`absolute inset-0 rounded-[38%] ${isA ? "bg-fighterA" : "bg-fighterB"} ${
          bright ? "opacity-100" : "opacity-90"
        }`}
        style={{
          clipPath:
            "polygon(50% 0%, 80% 15%, 100% 50%, 80% 85%, 50% 100%, 20% 85%, 0% 50%, 20% 15%)",
        }}
      />
      <div className="absolute inset-[22%] rounded-full bg-void/40 backdrop-blur-[1px]" />
    </div>
  );
}
