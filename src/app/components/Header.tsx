"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAccount, useEnsName } from "wagmi";
import { getFarcasterUser } from "@/lib/farcaster";

function shorten(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function Header() {
  const { address, isConnected } = useAccount();

  /* ✅ ENS = MAINNET */
  const { data: ensName } = useEnsName({
    address,
    chainId: 1,
    query: { enabled: Boolean(address) },
  });

  const [farcasterName, setFarcasterName] = useState<string | null>(null);

  useEffect(() => {
    getFarcasterUser().then((u) => {
      if (u?.username) setFarcasterName(u.username);
    });
  }, []);

  let displayName: string | null = null;

  if (ensName) {
    displayName = ensName;
  } else if (farcasterName) {
    displayName = `@${farcasterName}`;
  } else if (address) {
    displayName = shorten(address);
  }

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
