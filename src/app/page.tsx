"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { base } from "viem/chains";

import {
  CONTRACT_ADDRESS,
  getActiveTokens,
  getTokenConfigSafe,
  getTokenMetadataSafe,
  getTokenStatsSafe,
  getLastVoteTimeSafe,
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

export default function HomePage() {
  const { address, isConnected } = useAccount();

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
            const ts = await getLastVoteTimeSafe(
              address as `0x${string}`,
              token
            );
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
            <VoteButton
              disabled={!isConnected}
              token={t.address}
              vote={0}
              feeWei={t.feeWei}
              label="PUMP"
              className="bg-emerald-500"
            />

            <VoteButton
              disabled={!isConnected}
              token={t.address}
              vote={1}
              feeWei={t.feeWei}
              label="DUMP"
              className="bg-red-500"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ───────────────── VOTE BUTTON ───────────────── */

function VoteButton({
  token,
  vote,
  feeWei,
  label,
  disabled,
  className,
}: {
  token: `0x${string}`;
  vote: 0 | 1;
  feeWei: bigint;
  label: string;
  disabled: boolean;
  className: string;
}) {
  const { address } = useAccount();

  async function handleVote() {
    if (!address) return;

    const { writeContract } = await import("wagmi/actions");
    const { config } = await import("wagmi");

    await writeContract(config, {
      chainId: base.id,
      address: CONTRACT_ADDRESS,
      abi: [
        {
          type: "function",
          name: "vote",
          stateMutability: "payable",
          inputs: [
            { name: "token", type: "address" },
            { name: "side", type: "uint8" },
          ],
          outputs: [],
        },
      ],
      functionName: "vote",
      args: [token, vote],
      value: feeWei,
    });
  }

  return (
    <button
      disabled={disabled}
      onClick={handleVote}
      className={`flex-1 text-black font-bold py-2 rounded-xl disabled:bg-zinc-700 ${className}`}
    >
      {label}
    </button>
  );
}
