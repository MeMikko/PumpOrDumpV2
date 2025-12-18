"use client";

import { useEffect, useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import type { Address } from "viem";

import Typewriter from "./components/Typewriter";
import Onboarding from "./components/Onboarding";

import { isBaseApp } from "@/utils/isBaseApp";
import { fetchBirdeyePrices } from "@/lib/Birdeye";

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
  priceUsd: number | null;
  priceChange24h: number | null;
};

/* ───────────────── Utils ───────────────── */

function formatUsd(n: number | null) {
  if (n === null || !Number.isFinite(n)) return "—";
  if (n >= 1) return `$${n.toFixed(4)}`;
  return `$${n.toFixed(8)}`;
}

function formatChange(n: number | null) {
  if (n === null) return "—";
  return `${n > 0 ? "+" : ""}${n.toFixed(2)}%`;
}

/* ───────────────── Page ───────────────── */

export default function HomePage() {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [tokens, setTokens] = useState<TokenRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState<string | null>(null);

  /* ───────── Load tokens ───────── */

  useEffect(() => {
    let alive = true;

    async function loadTokens() {
      setLoading(true);

      try {
        // 1️⃣ HAE AINA KOKO TOKEN-LISTA
        const addresses = (await getActiveTokens()) as `0x${string}`[];

        // 2️⃣ HAE BIRDEYE AINA TÄLLÄ LISTALLA (KORJAUS)
        const birdeyeMap = await fetchBirdeyePrices(addresses);

        const rows: TokenRow[] = [];

        for (const token of addresses) {
          const cfg = await getTokenConfigSafe(token);
          if (!cfg.enabled) continue;

          const meta = await getTokenMetadataSafe(token);
          const stats = await getTokenStatsSafe(token);

          let lastVoteAt: number | null = null;
          if (address) {
            const ts = await getLastVoteTimeSafe(
              address as Address,
              token
            );
            if (ts > 0n) lastVoteAt = Number(ts) * 1000;
          }

          const d = birdeyeMap[token.toLowerCase()];

          rows.push({
            address: token,
            name: meta.name,
            symbol: meta.symbol,
            logoURI: meta.logoURI,
            pump: Number(stats.pump),
            dump: Number(stats.dump),
            feeWei: cfg.feeWei ?? 0n,
            lastVoteAt,
            priceUsd:
              typeof d?.value === "number" ? d.value : null,
            priceChange24h:
              typeof d?.priceChange24h === "number"
                ? d.priceChange24h
                : null,
          });
        }

        if (alive) setTokens(rows);
      } catch (e) {
        console.error("Token load failed", e);
        if (alive) setTokens([]);
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadTokens();
    return () => {
      alive = false;
    };
  }, [address]);

  /* ───────── Vote (Base sponsored ready) ───────── */

  async function vote(
    token: `0x${string}`,
    side: 0 | 1,
    feeWei: bigint
  ) {
    if (!address) return;

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

  /* ───────── Render ───────── */

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
                <div className="sk-line" />
                <div className="sk-line" />
                <div className="sk-box" />
              </div>
            ))}
          </div>
        ) : (
          <div className="pod-grid">
            {tokens.map((t) => {
              const change =
                typeof t.priceChange24h === "number"
                  ? t.priceChange24h
                  : null;

              const changeClass =
                change === null
                  ? "pod-change"
                  : change >= 0
                  ? "pod-change pod-change--up"
                  : "pod-change pod-change--down";

              return (
                <div key={t.address} className="pod-card">
                  <div className="pod-card__top">
                    <div>
                      <div className="pod-card__symbol">
                        {t.symbol}
                      </div>
                      <div className="pod-card__name">
                        {t.name}
                      </div>
                      <div className="pod-price">
                        {formatUsd(t.priceUsd)}
                      </div>
                      <div className={changeClass}>
                        {formatChange(change)}
                      </div>
                    </div>

                    {t.logoURI ? (
                      <img
                        src={t.logoURI}
                        alt=""
                        className="pod-logo pod-logo--corner"
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
                      onClick={() =>
                        vote(t.address, 0, t.feeWei)
                      }
                    >
                      {voting === t.address
                        ? "VOTING…"
                        : "PUMP"}
                    </button>

                    <button
                      className="pod-vote pod-vote--dump"
                      disabled={!address || voting === t.address}
                      onClick={() =>
                        vote(t.address, 1, t.feeWei)
                      }
                    >
                      {voting === t.address
                        ? "VOTING…"
                        : "DUMP"}
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
