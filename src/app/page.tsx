"use client";

import { useEffect, useState, useCallback } from "react";
import { useAccount } from "wagmi";
import { readContract, writeContract, waitForTransactionReceipt } from "@wagmi/core";
import { base } from "wagmi/chains";

import { wagmiConfig } from "@/web3/wagmi";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/web3/contract";

import NeonLoader from "@/app/components/NeonLoader";
import Confetti from "@/app/components/Confetti";

type TokenRow = {
  address: `0x${string}`;
  name: string;
  symbol: string;
  logo: string;
  feeWei: bigint;
};

export default function HomePage() {
  const { isConnected } = useAccount();

  const [tokens, setTokens] = useState<TokenRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState<string | null>(null);
  const [confetti, setConfetti] = useState(false);

  /* ───────── LOAD TOKENS ───────── */
  const loadTokens = useCallback(async () => {
    setLoading(true);

    try {
      const addresses = (await readContract(wagmiConfig, {
        chainId: base.id,
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "getActiveTokens",
      })) as `0x${string}`[];

      if (!addresses?.length) {
        setTokens([]);
        return;
      }

      const uniq = Array.from(
        new Set(addresses.map((a) => a.toLowerCase()))
      ) as `0x${string}`[];

      const rows: TokenRow[] = [];

      for (const addr of uniq) {
        try {
          const [meta, cfg] = await Promise.all([
            readContract(wagmiConfig, {
              chainId: base.id,
              address: CONTRACT_ADDRESS,
              abi: CONTRACT_ABI,
              functionName: "tokenMetadata",
              args: [addr],
            }) as Promise<[string, string, string]>,

            readContract(wagmiConfig, {
              chainId: base.id,
              address: CONTRACT_ADDRESS,
              abi: CONTRACT_ABI,
              functionName: "tokenConfigs",
              args: [addr],
            }) as Promise<[boolean, boolean, number, bigint, bigint]>,
          ]);

          if (!cfg?.[0]) continue; // enabled === false → skip

          rows.push({
            address: addr,
            name: meta?.[0] || "Unknown",
            symbol: meta?.[1] || "???",
            logo: meta?.[2] || "/placeholder.png",
            feeWei: cfg?.[3] ?? 0n,
          });
        } catch (e) {
          console.warn("[TOKEN FAIL]", addr, e);
        }
      }

      setTokens(rows);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTokens();
    const i = setInterval(loadTokens, 30000);
    return () => clearInterval(i);
  }, [loadTokens]);

  /* ───────── VOTE ───────── */
  const vote = async (token: TokenRow, dir: 0 | 1) => {
    if (!isConnected || voting) return;

    setVoting(token.address);

    try {
      const hash = await writeContract(wagmiConfig, {
        chainId: base.id,
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "vote",
        args: [token.address, dir],
        value: token.feeWei,
      });

      const receipt = await waitForTransactionReceipt(wagmiConfig, {
        chainId: base.id,
        hash,
      });

      if (receipt.status === "success") {
        setConfetti(true);
        setTimeout(() => setConfetti(false), 2000);
      }
    } catch (e) {
      console.error("Vote failed", e);
    } finally {
      setVoting(null);
    }
  };

  /* ───────── LOADING ───────── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <NeonLoader text="LOADING TOKENS" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {confetti && <Confetti trigger />}

      {tokens.length === 0 ? (
        <div className="max-w-xl mx-auto text-center rounded-3xl border border-zinc-800 bg-zinc-950 p-10">
          <p className="text-zinc-300 font-bold text-lg">No active tokens</p>
          <p className="text-zinc-500 text-sm mt-2">
            Admin will add some soon.
          </p>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {tokens.map((t) => (
            <div
              key={t.address}
              className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6"
            >
              <div className="flex justify-between mb-4">
                <div>
                  <p className="text-xs text-zinc-500">{t.name}</p>
                  <p className="text-3xl font-black text-cyan-300">
                    {t.symbol}
                  </p>
                </div>
                <img
                  src={t.logo}
                  onError={(e) =>
                    ((e.currentTarget as HTMLImageElement).src =
                      "/placeholder.png")
                  }
                  className="w-14 h-14 rounded-full border border-zinc-700"
                  alt={t.symbol}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  disabled={!isConnected || voting === t.address}
                  onClick={() => vote(t, 0)}
                  className="bg-emerald-500 disabled:bg-zinc-800 text-black font-black py-2 rounded-xl"
                >
                  PUMP
                </button>
                <button
                  disabled={!isConnected || voting === t.address}
                  onClick={() => vote(t, 1)}
                  className="bg-red-500 disabled:bg-zinc-800 text-black font-black py-2 rounded-xl"
                >
                  DUMP
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
