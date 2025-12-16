"use client";

export default function NeonLoader({ text = "LOADING" }: { text?: string }) {
  return (
    <div className="text-cyan-400 font-black text-xl animate-pulse">
      {text}
    </div>
  );
}
