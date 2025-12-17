"use client";

import { useEffect, useState } from "react";

type Props = {
  words?: string[];
  speed?: number;
  pause?: number;
};

export default function Typewriter({
  words = ["Predict", "Earn", "Dominate"],
  speed = 60,
  pause = 900,
}: Props) {
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [out, setOut] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIndex];

    const tick = setTimeout(() => {
      if (!deleting) {
        const next = current.slice(0, charIndex + 1);
        setOut(next);
        setCharIndex((c) => c + 1);

        if (charIndex + 1 === current.length) {
          setTimeout(() => setDeleting(true), pause);
        }
      } else {
        const next = current.slice(0, Math.max(0, charIndex - 1));
        setOut(next);
        setCharIndex((c) => c - 1);

        if (charIndex - 1 <= 0) {
          setDeleting(false);
          setWordIndex((i) => (i + 1) % words.length);
        }
      }
    }, deleting ? speed / 2 : speed);

    return () => clearTimeout(tick);
  }, [words, wordIndex, charIndex, deleting, speed, pause]);

  return (
    <div className="pixel-text text-center text-zinc-300 text-sm mt-6">
      {out}
      <span className="animate-pulse">▌</span>
    </div>
  );
}
