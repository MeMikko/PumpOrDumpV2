"use client";

import { useEffect, useState } from "react";

export default function Typewriter({
  text = "Vote on Base. Earn XP. Claim Rewards.",
  speed = 40,
}: {
  text?: string;
  speed?: number;
}) {
  const [out, setOut] = useState("");

  useEffect(() => {
    let i = 0;
    setOut("");

    const id = setInterval(() => {
      setOut(text.slice(0, i + 1));
      i++;

      if (i >= text.length) {
        clearInterval(id);
      }
    }, speed);

    return () => clearInterval(id);
  }, [text, speed]);

  return (
    <div className="pixel-text text-center text-zinc-300 text-sm mt-6">
      {out}
      <span className="animate-pulse">▌</span>
    </div>
  );
}
