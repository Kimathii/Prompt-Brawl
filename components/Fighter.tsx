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
  const color = isA ? "bg-fighterA" : "bg-fighterB";
  const glow = isA ? "shadow-glowA" : "shadow-glowB";
  
  return (
    <div className={`relative w-full h-full flex flex-col items-center justify-start pt-2 ${bright ? "opacity-100" : "opacity-90"}`}>
      {/* Head */}
      <div className={`w-8 h-8 rounded-full ${color} ${glow} z-10`} />
      
      {/* Torso & Arms */}
      <div className="relative flex justify-center w-full -mt-1 z-0">
        {/* Left Arm */}
        <div className={`absolute top-1 right-[50%] w-12 h-2.5 origin-right -rotate-[35deg] rounded-full ${color} ${glow}`}>
          {!isA && <Sword isA={false} />}
        </div>
        
        {/* Torso */}
        <div className={`w-2.5 h-16 rounded-full ${color} ${glow}`} />
        
        {/* Right Arm */}
        <div className={`absolute top-1 left-[50%] w-12 h-2.5 origin-left rotate-[35deg] rounded-full ${color} ${glow}`}>
          {isA && <Sword isA={true} />}
        </div>
      </div>
      
      {/* Legs */}
      <div className="relative flex justify-center w-full -mt-2 z-0">
        {/* Left Leg */}
        <div className={`absolute top-0 right-[49%] w-2.5 h-14 origin-top -rotate-[25deg] rounded-full ${color} ${glow}`} />
        {/* Right Leg */}
        <div className={`absolute top-0 left-[49%] w-2.5 h-14 origin-top rotate-[25deg] rounded-full ${color} ${glow}`} />
      </div>
    </div>
  );
}

function Sword({ isA }: { isA: boolean }) {
  return (
    <div 
      className={`absolute top-1/2 -mt-[2px] ${
        isA ? 'left-[85%] origin-left -rotate-[65deg]' : 'right-[85%] origin-right rotate-[65deg]'
      } w-16 h-1.5 bg-slate-100 shadow-[0_0_10px_rgba(255,255,255,0.8)] rounded-sm z-20`}
    >
      {/* Crossguard */}
      <div className={`absolute top-1/2 -mt-2 ${isA ? 'left-2' : 'right-2'} w-1.5 h-4 bg-zinc-400 rounded-sm`} />
      {/* Handle */}
      <div className={`absolute top-1/2 -mt-[3px] ${isA ? 'right-[calc(100%-10px)]' : 'left-[calc(100%-10px)]'} w-4 h-1.5 bg-zinc-600 rounded-sm`} />
    </div>
  );
}


