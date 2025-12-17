"use client";

import { useEffect, useState } from "react";
import { useAccount, useWriteContract } from "wagmi";

import Header from "./components/Header";
import Typewriter from "./components/Typewriter";

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

type TokenRow = {
  address: `0x${string}`;
  name: string;
  symbol: string;
  logoURI: string;
  pump: number;
  dump: number;
  feeWei: bigint;
  lastVoteAt: number | null;
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
        const rows: TokenRow[] = [];

        for (const token of tokenAddresses as `0x${string}`[]) {
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
          });
        }

        setTokens(rows);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [address]);

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

  return (
    <div className="bg-black min-h-screen text-white">
      <Header />

      {/* 🟣 HERO / TAGLINE */}
      <Typewriter text="PREDICT THE MARKET. VOTE WITH CONVICTION. EARN REWARDS." />

      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        {loading && (
          <div className="pixel-text text-center text-neon animate-pulse">
            LOADING TOKENS…
          </div>
        )}

        {!loading &&
          tokens.map((t) => (
            <div
              key={t.address}
              className="rounded-2xl border-4 border-zinc-800 bg-zinc-900 p-4 pixel-card"
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="pixel-text text-lg">
                    {t.symbol || t.address}
                  </div>
                  <div className="text-xs text-zinc-400">{t.name}</div>
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
    </div>
  );
}
