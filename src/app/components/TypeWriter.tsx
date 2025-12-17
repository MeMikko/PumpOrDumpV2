"use client";

import { useEffect, useState } from "react";

export default function Typewriter({ text }: { text: string }) {
  const [out, setOut] = useState("");

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      setOut(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(id);
    }, 40);

    return () => clearInterval(id);
  }, [text]);

  return (
    <div className="pixel-text text-center text-zinc-300 text-sm mt-6">
      {out}
      <span className="animate-pulse">▌</span>
    </div>
  );
}
