"use client";

import { useEffect, useState } from "react";
import { useAccount, useEnsName } from "wagmi";
import sdk from "@farcaster/miniapp-sdk";

function shorten(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function useDisplayName() {
  const { address, isConnected } = useAccount();

  // 🔹 ENS (desktop + base app)
  const { data: ens } = useEnsName({
    address,
    chainId: 1,
    query: { enabled: Boolean(address) },
  });

  const [farcaster, setFarcaster] = useState<string | null>(null);

  // 🔹 Farcaster MiniApp only
  useEffect(() => {
    (async () => {
      try {
        const ctx = await sdk.context;
        if (ctx?.user?.username) {
          setFarcaster(`@${ctx.user.username}`);
        }
      } catch {
        // not in MiniApp → ignore
      }
    })();
  }, []);

  let name: string | null = null;

  if (ens) name = ens;
  else if (farcaster) name = farcaster;
  else if (address) name = shorten(address);

  return {
    displayName: name,
    isConnected,
  };
}
