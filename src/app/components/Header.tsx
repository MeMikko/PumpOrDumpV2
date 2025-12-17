"use client";

import Link from "next/link";
import { useAccount } from "wagmi";

export default function Header({
  tagline,
}: {
  tagline?: string;
}) {
  const { isConnected } = useAccount();

  return (
    <header className="sticky top-0 z-50 bg-black border-b-4 border-neon px-6 py-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link href="/" className="pixel-text text-neon text-xl">
          PUMP ▸ OR ▸ DUMP
        </Link>

        <div className="flex items-center gap-4">
          {tagline && (
            <div className="hidden md:block pixel-text text-xs text-zinc-400">
              {tagline}
            </div>
          )}

          <div
            className={`pixel-text text-xs ${
              isConnected ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {isConnected ? "WALLET ONLINE" : "NO WALLET"}
          </div>
        </div>
      </div>
    </header>
  );
}
