"use client";

import { useEffect, useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import type { Address } from "viem";

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

/* ───────────────── Types ───────────────── */

type TokenRow = {
  address: `0x${string}`;
  name: string;
  symbol: string;
  logoURI: string;
  pump: number;
  dump: number;
  feeWei: bigint;
  lastVoteAt: number | null;
  priceUsd?: number | null;
  priceChange24h?: number | null;
};

/* ───────────────── Utils ───────────────── */

function isBaseApp() {
  return typeof window !== "undefined" && Boolean((window as any).ethereum?.isBase);
}

function formatUsd(n?: number | null) {
  if (n === null || n === undefined || !Number.isFinite(n)) return "—";
  if (n >= 1) return `$${n.toFixed(4)}`;
  return `$${n.toFixed(8)}`;
}

function formatChange(n?: number | null) {
  if (n === null || n === undefined || !Number.isFinite(n)) return "—";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}

function playerName(address?: string) {
  if (!address) return "Player";
  return `Player ${parseInt(address.slice(2, 6), 16)}`;
}

/* ───────────────── Onboarding ───────────────── */

function Onboarding() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("onboarded")) {
      setOpen(true);
    }
  }, []);

  if (!open) return null;

  return (
    <div className="pod-onboard">
      <div className="pod-onboard__card">
        <h2>Welcome to Pump or Dump</h2>
        <ul>
          <li>Vote on trending tokens</li>
          <li>Earn XP from correct predictions</li>
          <li>Climb the leaderboard</li>
        </ul>
        <button
          onClick={() => {
            localStorage.setItem("onboarded", "1");
            setOpen(false);
          }}
        >
          Start voting
        </button>
      </div>
    </div>
  );
}

/* ───────────────── Page ───────────────── */

export default function HomePage() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [tokens, setTokens] = useState<TokenRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState<string | null>(null);

  const BIRDEYE_API_KEY =
    process.env.NEXT_PUBLIC_BIRDEYE_API_KEY ||
    process.env.NEXT_PUBLIC_BIRDEYE_KEY ||
    "";

  /* ───────── Load tokens ───────── */

  useEffect(() => {
    let alive = true;

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
            const ts = await getLastVoteTimeSafe(address as Address, token);
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
            priceUsd: null,
            priceChange24h: null,
          });
        }

        // Birdeye prices
        if (BIRDEYE_API_KEY && rows.length) {
          const res = await fetch(
            `https://public-api.birdeye.so/defi/multi_price?list_address=${rows
              .map((r) => r.address.toLowerCase())
              .join(",")}`,
            {
              headers: {
                "X-API-KEY": BIRDEYE_API_KEY,
                "x-chain": "base",
              },
            }
          );

          const json = await res.json();
          if (json?.success && json?.data) {
            for (const r of rows) {
              const d = json.data[r.address.toLowerCase()];
              r.priceUsd = d?.value ?? null;
              r.priceChange24h =
                typeof d?.priceChange24h === "number"
                  ? d.priceChange24h
                  : null;
            }
          }
        }

        if (!alive) return;
        setTokens(rows);
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [address, BIRDEYE_API_KEY]);

  /* ───────── Vote ───────── */

  async function vote(token: `0x${string}`, side: 0 | 1, feeWei: bigint) {
    setVoting(token);
    try {
      if (isBaseApp()) {
        await contract.write.vote([token, side], {
          account: address as Address,
          value: feeWei,
        });
      } else {
        await writeContractAsync({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "vote",
          args: [token, side],
          value: feeWei,
        });
      }
    } finally {
      setVoting(null);
    }
  }

  return (
    <div className="pod-page">
      <Onboarding />

      {/* HERO */}
      <section className="pod-hero">
        <div className="pod-hero__frame">
          <div className="pod-hero__kicker">SEASON MODE</div>
          <Typewriter text="Vote on Base. Earn XP. Claim Rewards." />
        </div>
      </section>

      {/* TOKEN LIST */}
      <section className="pod-content">
        {loading ? (
          <div className="pod-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="pod-card pod-card--skeleton">
                <div className="sk-line w-40" />
                <div className="sk-line w-24" />
                <div className="sk-box" />
              </div>
            ))}
          </div>
        ) : (
          <div className="pod-grid">
            {tokens.map((t) => {
              const changeClass =
                t.priceChange24h === null
                  ? "pod-change"
                  : t.priceChange24h >= 0
                  ? "pod-change pod-change--up"
                  : "pod-change pod-change--down";

              return (
                <div key={t.address} className="pod-card">
                  <div className="pod-card__top">
                    <div>
                      <div className="pod-card__symbol">{t.symbol}</div>
                      <div className="pod-card__name">{t.name}</div>
                      <div className="pod-price">{formatUsd(t.priceUsd)}</div>
                      <div className={changeClass}>
                        {formatChange(t.priceChange24h)}
                      </div>
                    </div>

                    {t.logoURI ? (
                      <img
                        className="pod-logo pod-logo--corner"
                        src={t.logoURI}
                        alt=""
                      />
                    ) : (
                      <div className="pod-logo pod-logo--corner pod-logo--empty" />
                    )}
                  </div>

                  <div className="pod-stats">
                    <span>👍 {t.pump}</span>
                    <span className="pod-sep">·</span>
                    <span>👎 {t.dump}</span>
                  </div>

                  <div className="pod-actions-row">
                    <button
                      className="pod-vote pod-vote--pump"
                      disabled={!address || voting === t.address}
                      onClick={() => vote(t.address, 0, t.feeWei)}
                    >
                      {voting === t.address ? "VOTING…" : "PUMP"}
                    </button>

                    <button
                      className="pod-vote pod-vote--dump"
                      disabled={!address || voting === t.address}
                      onClick={() => vote(t.address, 1, t.feeWei)}
                    >
                      {voting === t.address ? "VOTING…" : "DUMP"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
