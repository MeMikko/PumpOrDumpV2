"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAccount, useEnsName } from "wagmi";

function shorten(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function Header() {
  const { address, isConnected } = useAccount();

  /* 🔹 ENS → AINA MAINNET */
  const { data: ensName } = useEnsName({
    address,
    chainId: 1, // 🔥 ETH MAINNET
    query: {
      enabled: Boolean(address),
    },
  });

  /* 🔹 Farcaster MiniApp */
  const [farcasterName, setFarcasterName] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const fc = (window as any).fc;
    if (fc?.user?.username) {
      setFarcasterName(fc.user.username);
    }
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
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* LOGO */}
        <Link
          href="/"
          className="pixel-text text-neon text-xl tracking-widest"
        >
          PUMP ▸ OR ▸ DUMP
        </Link>

        {/* USER */}
        {isConnected && displayName && (
          <div className="pixel-text text-xs text-zinc-300 border border-zinc-700 px-3 py-1 rounded">
            {displayName}
          </div>
        )}
      </div>
    </header>
  );
}
