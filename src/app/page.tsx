"use client";

import { useEffect, useState } from "react";
import { Address } from "viem";
import {
  getActiveTokens,
  getTokenConfigSafe,
  getTokenMetadataSafe,
} from "@/web3/contract";

export default function HomePage() {
  const [tokens, setTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const addrs = await getActiveTokens();
        const rows = [];

        for (const token of addrs as Address[]) {
          const cfg = await getTokenConfigSafe(token);
          if (!cfg.enabled) continue;

          const meta = await getTokenMetadataSafe(token);

          rows.push({
            address: token,
            ...cfg,
            ...meta,
          });
        }

        setTokens(rows);
      } catch (e) {
        console.error("Token load failed", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-6">Loading tokens…</div>;

  return (
    <div className="p-6 space-y-4">
      {tokens.map((t) => (
        <div
          key={t.address}
          className="rounded-xl border border-zinc-800 bg-zinc-900 p-4"
        >
          <div className="font-bold">
            {t.name || t.symbol || t.address}
          </div>
          {t.logoURI && (
            <img
              src={t.logoURI}
              className="mt-2 h-10 w-10 rounded"
              alt=""
            />
          )}
        </div>
      ))}
    </div>
  );
}
