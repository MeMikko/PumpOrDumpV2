"use client";

import { useEffect, useState, useCallback } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
} from "wagmi";
import { base } from "wagmi/chains";

import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/web3/contract";

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

export default function HomePage() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [tokens, setTokens] = useState<TokenRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTokens = useCallback(async () => {
    setLoading(true);

    try {
      // 1️⃣ Hae aktiiviset tokenit
      const addresses = (await fetchActiveTokens()) as `0x${string}`[];

      const rows: TokenRow[] = [];

      for (const token of addresses) {
        try {
          // 2️⃣ Hae token-data
          const [meta, stats, cfg] = await Promise.all([
            read("tokenMetadata", [token]),
            read("tokenStats", [token]),
            read("tokenConfigs", [token]),
          ]);

          if (!cfg[0]) continue; // enabled == false

          let lastVoteAt: number | null = null;

          // 3️⃣ Hae viimeisin äänestys
          if (address) {
            const ts = (await read("lastVoteTime", [
              address,
              token,
            ])) as bigint;

            if (ts > 0n) lastVoteAt = Number(ts) * 1000;
          }

          rows.push({
            address: token,
            name: meta[0],
            symbol: meta[1],
            logoURI: meta[2],
            pump: Number(stats[0]),
            dump: Number(stats[1]),
            feeWei: cfg[3],
            lastVoteAt,
          });
        } catch (e) {
          console.warn("Token skipped:", token, e);
        }
      }

      setTokens(rows);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    loadTokens();
  }, [loadTokens]);

  // 🔹 Generic read helper
  async function read(
    functionName: string,
    args: readonly unknown[] = []
  ) {
    const res = await useReadOnce(functionName, args);
    return res;
  }

  // 🔹 Single-read hook wrapper
  function useReadOnce(
    functionName: string,
    args: readonly unknown[]
  ) {
    return new Promise<any>((resolve, reject) => {
      useReadContract({
        chainId: base.id,
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName,
        args,
        query: {
          enabled: false,
          retry: false,
          onSuccess: resolve,
          onError: reject,
        },
      });
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
              <div className="text-xs text-zinc-400">{t.name}</div>
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
              disabled={!isConnected}
              onClick={async () => {
                await writeContractAsync({
                  chainId: base.id,
                  address: CONTRACT_ADDRESS,
                  abi: CONTRACT_ABI,
                  functionName: "vote",
                  args: [t.address, 0],
                  value: t.feeWei,
                });
                loadTokens();
              }}
              className="flex-1 bg-emerald-500 text-black font-bold py-2 rounded-xl disabled:bg-zinc-700"
            >
              PUMP
            </button>

            <button
              disabled={!isConnected}
              onClick={async () => {
                await writeContractAsync({
                  chainId: base.id,
                  address: CONTRACT_ADDRESS,
                  abi: CONTRACT_ABI,
                  functionName: "vote",
                  args: [t.address, 1],
                  value: t.feeWei,
                });
                loadTokens();
              }}
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
