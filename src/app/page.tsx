"use client";

import { useEffect, useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { fetchBirdeyePrices } from "./components/birdeye";


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

const BIRDEYE_API_KEY = process.env.NEXT_PUBLIC_BIRDEYE_API_KEY;

type TokenRow = {
  address: `0x${string}`;
  name: string;
  symbol: string;
  logoURI: string;
  pump: number;
  dump: number;
  feeWei: bigint;
  lastVoteAt: number | null;
  price?: number | null; // 👈 lisäys
};

function isMiniApp() {
  return typeof window !== "undefined" && (window as any).fc;
}

export default function HomePage() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [tokens, setTokens] = useState<TokenRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        const tokenAddresses = await getActiveTokens();

        /* ───────── Birdeye: hae hinnat yhdellä requestilla ───────── */
        let birdeyePrices: Record<string, { value?: number }> = {};
        if (BIRDEYE_API_KEY && tokenAddresses.length > 0) {
          try {
            const res = await fetch(
              `https://public-api.birdeye.so/defi/multi_price?list_address=${tokenAddresses
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
            birdeyePrices = json?.data ?? {};
          } catch (e) {
            console.error("Birdeye fetch failed", e);
          }
        }
        /* ───────────────────────────────────────────────────────── */

        const rows: TokenRow[] = [];

        for (const token of tokenAddresses as `0x${string}`[]) {
          const cfg = await getTokenConfigSafe(token);
          if (!cfg.enabled) continue;

          const meta = await getTokenMetadataSafe(token);
          const stats = await getTokenStatsSafe(token);

          let lastVoteAt: number | null = null;
          if (address) {
            const ts = await getLastVoteTimeSafe(
              address as `0x${string}`,
              token
            );
            if (ts > 0n) lastVoteAt = Number(ts) * 1000;
          }

          const bird = birdeyePrices[token.toLowerCase()];

          rows.push({
            address: token,
            name: meta.name,
            symbol: meta.symbol,
            logoURI: meta.logoURI,
            pump: Number(stats.pump),
            dump: Number(stats.dump),
            feeWei: cfg.feeWei ?? 0n,
            lastVoteAt,
            price: bird?.value ?? null, // 👈 lisäys
          });
        }

        setTokens(rows);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [address]);

  async function vote(
    token: `0x${string}`,
    side: 0 | 1,
    feeWei: bigint
  ) {
    if (isMiniApp()) {
      if (!address) {
        throw new Error("No MiniApp account available");
      }

      const account = address as `0x${string}`;

      await contract.write.vote(
        [token, side],
        {
          account,
          value: feeWei,
        }
      );
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

  if (loading) {
    return <div className="p-6 text-white">Loading tokens…</div>;
  }

  return (
    <div className="p-6 space-y-6 bg-black text-white">
      {tokens.map((t) => (
        <div
          key={t.address}
          className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4"
        >
          <div className="flex justify-between items-center">
            <div>
              <div className="font-bold text-lg">
                {t.symbol || t.address}
              </div>
              <div className="text-xs text-zinc-400">
                {t.name}
              </div>

              {/* 💰 Birdeye price */}
              {t.price != null && (
                <div className="text-sm text-zinc-300 mt-1">
                  ${t.price.toFixed(4)}
                </div>
              )}
            </div>

            {t.logoURI && (
              <img
                src={t.logoURI}
                className="h-10 w-10 rounded-full"
                alt=""
              />
            )}
          </div>

          <div className="mt-3 text-sm text-zinc-400">
            👍 {t.pump} · 👎 {t.dump}
          </div>

          <div className="mt-4 flex gap-3">
            <button
              disabled={!isConnected && !isMiniApp()}
              onClick={() => vote(t.address, 0, t.feeWei)}
              className="flex-1 bg-emerald-500 text-black font-bold py-2 rounded-xl disabled:bg-zinc-700"
            >
              PUMP
            </button>

            <button
              disabled={!isConnected && !isMiniApp()}
              onClick={() => vote(t.address, 1, t.feeWei)}
              className="flex-1 bg-red-500 text-black font-bold py-2 rounded-xl disabled:bg-zinc-700"
            >
              DUMP
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
