"use client";

import Link from "next/link";
import { useDisplayName } from "@/hooks/useDisplayName";

export default function Header() {
  const { displayName, isConnected } = useDisplayName();

  return (
    <header className="sticky top-0 z-50 bg-black border-b-4 border-neon px-6 py-4">
      <div className="max-w-5xl mx-auto flex justify-between items-center">
        <Link href="/" className="pixel-text text-neon text-xl">
          PUMP ▸ OR ▸ DUMP
        </Link>

        {isConnected && displayName && (
          <div className="pixel-text text-xs border border-zinc-700 px-3 py-1 rounded">
            {displayName}
          </div>
        )}
      </div>
    </header>
  );
}
