"use client";

import { useEffect, useState } from "react";
import { useAccount, useWriteContract } from "wagmi";

import {
  getActiveTokens,
  getTokenConfigSafe,
  getTokenMetadataSafe,
  getTokenStatsSafe,
  getLastVoteTimeSafe,
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
  contract,
} from "@/web3/contract";

/* ───────────────── TYPES ───────────────── */

type TokenRow = {
  address: `0x${string}`;
  name: string;
  symbol: string;
  logoURI: string;
  pump: number;
  dump: number;
  feeWei: bigint;
  lastVoteAt: number | null;
  price: number | null;
};

/* ───────────────── HELPERS ───────────────── */

function isMiniApp() {
  return typeof window !== "undefined" && (window as any).fc;
}

/* ───────────────── UI: NEON LOADER ───────────────── */

function NeonLoader() {
  return (
    <div className="flex justify-center py-10">
      <div className="pixel-text text-neon animate-pulse">
        LOADING TOKENS…
      </div>
    </div>
  );
}

/* ───────────────── UI: SKELETON CARD ───────────────── */

function TokenSkeleton() {
  return (
    <div className="retro-card animate-pulse">
      <div className="flex justify-between">
        <div className="space-y-2">
          <div className="h-4 w-24 bg-zinc-700 rounded-sm" />
          <div className="h-3 w-32 bg-zinc-800 rounded-sm" />
        </div>
        <div className="h-10 w-10 bg-zinc-700 rounded-sm" />
      </div>

      <div className="mt-4 h-3 w-20 bg-zinc-800 rounded-sm" />

      <div className="mt-4 flex gap-3">
        <div className="flex-1 h-9 bg-zinc-800 rounded-sm" />
        <div className="flex-1 h-9 bg-zinc-800 rounded-sm" />
      </div>
    </div>
  );
}

/* ───────────────── PAGE ───────────────── */

export default function HomePage() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [tokens, setTokens] = useState<TokenRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        const addresses = await getActiveTokens();
        const rows: TokenRow[] = [];

        /* 🔹 Birdeye */
        const BIRDEYE_API_KEY = process.env.NEXT_PUBLIC_BIRDEYE_API_KEY;
        let prices: Record<string, number> = {};

        if (BIRDEYE_API_KEY) {
          try {
            const res = await fetch(
              `https://public-api.birdeye.so/defi/multi_price?list_address=${addresses
                .map((a) => a.toLowerCase())
                .join(",")}`,
              {
                headers: {
                  "X-API-KEY": BIRDEYE_API_KEY,
                  "x-chain": "base",
                },
              }
            );
            const json = await res.json();
            if (json?.data) {
              for (const [addr, d] of Object.entries(json.data)) {
                prices[addr.toLowerCase()] = (d as any)?.value ?? null;
              }
            }
          } catch {}
        }

        for (const token of addresses as `0x${string}`[]) {
          const cfg = await getTokenConfigSafe(token);
          if (!cfg.enabled) continue;

          const meta = await getTokenMetadataSafe(token);
          const stats = await getTokenStatsSafe(token);

          let lastVoteAt: number | null = null;
          if (address) {
            const ts = await getLastVoteTimeSafe(address, token);
            if (ts > 0n) lastVoteAt = Number(ts) * 1000;
          }

          rows.push({
            address: token,
            name: meta.name,
            symbol: meta.symbol,
            logoURI: meta.logoURI,
            pump: Number(stats.pump),
            dump: Number(stats.dump),
            feeWei: cfg.feeWei ?? 0n,
            lastVoteAt,
            price: prices[token.toLowerCase()] ?? null,
          });
        }

        setTokens(rows);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [address]);

  /* ───────────────── VOTE ───────────────── */

  async function vote(token: `0x${string}`, side: 0 | 1, feeWei: bigint) {
    if (isMiniApp()) {
      if (!address) throw new Error("No MiniApp account");
      await contract.write.vote([token, side], {
        account: address,
        value: feeWei,
      });
      return;
    }

    await writeContractAsync({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "vote",
      args: [token, side],
      value: feeWei,
    });
  }

  /* ───────────────── RENDER ───────────────── */

  if (loading) {
    return (
      <div className="p-6 space-y-6 bg-black min-h-screen">
        <NeonLoader />
        {Array.from({ length: 3 }).map((_, i) => (
          <TokenSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-black min-h-screen text-white">
      {tokens.map((t) => (
        <div key={t.address} className="retro-card">
          <div className="flex justify-between items-center">
            <div>
              <div className="pixel-text text-lg">
                {t.symbol || "TOKEN"}
              </div>
              <div className="text-xs text-zinc-400">{t.name}</div>
              {t.price != null && (
                <div className="text-sm text-neon mt-1">
                  ${t.price.toFixed(4)}
                </div>
              )}
            </div>

            {t.logoURI && (
              <img
                src={t.logoURI}
                className="h-10 w-10 pixel-img"
                alt=""
              />
            )}
          </div>

          <div className="mt-3 text-xs text-zinc-400">
            👍 {t.pump} · 👎 {t.dump}
          </div>

          <div className="mt-4 flex gap-3">
            <button
              disabled={!isConnected && !isMiniApp()}
              onClick={() => vote(t.address, 0, t.feeWei)}
              className="retro-btn neon-green"
            >
              PUMP
            </button>

            <button
              disabled={!isConnected && !isMiniApp()}
              onClick={() => vote(t.address, 1, t.feeWei)}
              className="retro-btn neon-red"
            >
              DUMP
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
