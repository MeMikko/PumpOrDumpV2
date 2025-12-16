"use client";

import { useEffect, useState, useCallback } from "react";
import { useAccount } from "wagmi";
import {
  writeContract,
  waitForTransactionReceipt,
  readContract,
} from "@wagmi/core";
import { base } from "wagmi/chains";
import { wagmiConfig } from "@/src/web3/wagmi";
import {
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
} from "@/src/web3/contract";

import NeonLoader from "@/app/components/NeonLoader";
import Confetti from "@/app/components/Confetti";

const BIRDEYE_API_KEY = process.env.NEXT_PUBLIC_BIRDEYE_API_KEY;
const COOLDOWN_MS = 60 * 60 * 1000;
const TYPEWRITER_TEXT = "Predict → Earn → Dominate.";

type TokenRow = {
  address: `0x${string}`;
  name: string;
  symbol: string;
  logo: string;
  price: number;
  pump: number;
  dump: number;
  lastVoteAt: number | null;
  feeWei: bigint;
};

export default function HomePage() {
  const { address, isConnected } = useAccount();

  const [tokens, setTokens] = useState<TokenRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [votingToken, setVotingToken] = useState<string | null>(null);
  const [votedToken, setVotedToken] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const [typedText, setTypedText] = useState("");

  /* ───────── CLOCK ───────── */
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);

  /* ───────── TYPEWRITER ───────── */
  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      setTypedText(TYPEWRITER_TEXT.slice(0, i));
      i++;
      if (i > TYPEWRITER_TEXT.length) clearInterval(t);
    }, 75);
    return () => clearInterval(t);
  }, []);

  /* ───────── LOAD TOKENS ───────── */
  const loadTokens = useCallback(async () => {
    setLoading(true);

    try {
      const addresses = (await readContract(wagmiConfig, {
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "getActiveTokens",
      })) as `0x${string}`[];

      if (!addresses.length) {
        setTokens([]);
        return;
      }

      /* ───── Birdeye prices ───── */
      let priceMap: Record<string, number> = {};
      if (BIRDEYE_API_KEY) {
        try {
          const res = await fetch(
            `https://public-api.birdeye.so/defi/multi_price?list_address=${addresses.join(",")}`,
            {
              headers: {
                "X-API-KEY": BIRDEYE_API_KEY,
                "x-chain": "base",
              },
            }
          );
          const json = await res.json();
          if (json?.success) {
            for (const [a, d] of Object.entries(json.data || {})) {
              priceMap[a.toLowerCase()] = d?.value ?? 0;
            }
          }
        } catch {}
      }

      const rows: TokenRow[] = [];

      for (const addr of addresses) {
        const [meta, stats, cfg] = await Promise.all([
          readContract(wagmiConfig, {
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: "tokenMetadata",
            args: [addr],
          }),
          readContract(wagmiConfig, {
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: "tokenStats",
            args: [addr],
          }),
          readContract(wagmiConfig, {
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: "tokenConfigs",
            args: [addr],
          }),
        ]);

        let lastVoteAt: number | null = null;
        if (address) {
          const ts = (await readContract(wagmiConfig, {
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: "lastVoteTime",
            args: [address, addr],
          })) as bigint;
          if (ts > 0n) lastVoteAt = Number(ts) * 1000;
        }

        rows.push({
          address: addr,
          name: meta[0],
          symbol: meta[1],
          logo: meta[2] || "/placeholder.png",
          price: priceMap[addr.toLowerCase()] ?? 0,
          pump: Number(stats[0]),
          dump: Number(stats[1]),
          lastVoteAt,
          feeWei: cfg[3],
        });
      }

      setTokens(rows);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    loadTokens();
    const i = setInterval(loadTokens, 20000);
    return () => clearInterval(i);
  }, [loadTokens]);

  /* ───────── COOLDOWN ───────── */
  const cooldown = (ts: number | null) => {
    if (!ts) return null;
    const d = ts + COOLDOWN_MS - now;
    if (d <= 0) return null;
    return `${Math.floor(d / 60000)}:${String(
      Math.floor((d % 60000) / 1000)
    ).padStart(2, "0")}`;
  };

  /* ───────── VOTE (FINAL) ───────── */
  const vote = async (token: TokenRow, dir: 0 | 1) => {
    if (!isConnected || votingToken) return;

    setVotingToken(token.address);

    try {
      const hash = await writeContract(wagmiConfig, {
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "vote",
        args: [token.address, dir],
        value: token.feeWei,
        chainId: base.id,
      });

      const receipt = await waitForTransactionReceipt(wagmiConfig, {
        hash,
        chainId: base.id,
      });

      if (receipt.status !== "success") {
        throw new Error("Vote reverted");
      }

      await loadTokens();

      setVotedToken(token.address);
      setTimeout(() => setVotedToken(null), 2000);
    } catch (e) {
      console.error("Vote failed:", e);
    } finally {
      setVotingToken(null);
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
      {votedToken && <Confetti trigger />}

      <div className="text-center mb-12">
        <p className="text-xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">
          {typedText}
          <span className="animate-pulse ml-1">|</span>
        </p>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {tokens.map((t) => {
          const cd = cooldown(t.lastVoteAt);
          const disabled = !!cd || votingToken === t.address;

          return (
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
                  className="w-14 h-14 rounded-full border border-zinc-700"
                />
              </div>

              <p className="text-emerald-400 font-bold mb-2">
                ${t.price.toFixed(6)}
              </p>

              <p className="text-xs text-zinc-500 mb-3">
                👍 {t.pump} · 👎 {t.dump}
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  disabled={disabled}
                  onClick={() => vote(t, 0)}
                  className="bg-emerald-500 disabled:bg-zinc-800 text-black font-black py-2 rounded-xl"
                >
                  {cd ? "WAIT" : "PUMP"}
                </button>
                <button
                  disabled={disabled}
                  onClick={() => vote(t, 1)}
                  className="bg-red-500 disabled:bg-zinc-800 text-black font-black py-2 rounded-xl"
                >
                  {cd ? "WAIT" : "DUMP"}
                </button>
              </div>

              {cd && (
                <p className="text-center text-yellow-400 mt-2 font-mono">
                  {cd}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
