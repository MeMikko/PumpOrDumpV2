"use client";

import { useEffect, useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import type { Address } from "viem";

import Typewriter from "../components/Typewriter";

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
  priceUsd?: number | null;
};

function isMiniApp() {
  return typeof window !== "undefined" && (window as any).fc;
}

function formatUsd(n?: number | null) {
  if (!n || !Number.isFinite(n)) return "—";
  if (n >= 1) return `$${n.toFixed(4)}`;
  return `$${n.toFixed(8)}`;
}

export default function HomePage() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [tokens, setTokens] = useState<TokenRow[]>([]);
  const [loading, setLoading] = useState(true);

  const BIRDEYE_API_KEY =
    process.env.NEXT_PUBLIC_BIRDEYE_API_KEY ||
    process.env.NEXT_PUBLIC_BIRDEYE_KEY ||
    "";

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
            priceUsd: null,
          });
        }

        // Birdeye prices
        if (BIRDEYE_API_KEY && rows.length) {
          try {
            const addresses = rows.map((r) => r.address);
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

            const json = (await res.json()) as any;
            if (json?.success && json?.data) {
              const priceMap: Record<string, number> = {};
              for (const [a, d] of Object.entries<any>(json.data || {})) {
                priceMap[String(a).toLowerCase()] = Number(d?.value ?? 0);
              }
              for (const r of rows) {
                r.priceUsd = priceMap[r.address.toLowerCase()] ?? null;
              }
            }
          } catch (e) {
            console.error("Birdeye failed", e);
          }
        }

        setTokens(rows);
      } catch (e) {
        console.error("Token load failed", e);
        setTokens([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [address, BIRDEYE_API_KEY]);

  async function vote(token: `0x${string}`, side: 0 | 1, feeWei: bigint) {
    // MiniApp → viem
    if (isMiniApp()) {
      if (!address) throw new Error("No MiniApp account available");
      await contract.write.vote([token, side], {
        account: address as `0x${string}`,
        value: feeWei,
      });
      return;
    }

    // Desktop → wagmi
    await writeContractAsync({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "vote",
      args: [token, side],
      value: feeWei,
    });
  }

  return (
    <div className="pod-page">
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
            {tokens.map((t) => (
              <div key={t.address} className="pod-card">
                <div className="pod-card__top">
                  <div>
                    <div className="pod-card__symbol">
                      {t.symbol || t.address}
                    </div>
                    <div className="pod-card__name">{t.name}</div>
                  </div>

                  <div className="pod-card__right">
                    <div className="pod-price">{formatUsd(t.priceUsd)}</div>
                    {t.logoURI ? (
                      <img className="pod-logo" src={t.logoURI} alt="" />
                    ) : (
                      <div className="pod-logo pod-logo--empty" />
                    )}
                  </div>
                </div>

                <div className="pod-stats">
                  <span>👍 {t.pump}</span>
                  <span className="pod-sep">·</span>
                  <span>👎 {t.dump}</span>
                </div>

                <div className="pod-actions-row">
                  <button
                    disabled={!isConnected && !isMiniApp()}
                    onClick={() => vote(t.address, 0, t.feeWei)}
                    className="pod-vote pod-vote--pump"
                  >
                    PUMP
                  </button>

                  <button
                    disabled={!isConnected && !isMiniApp()}
                    onClick={() => vote(t.address, 1, t.feeWei)}
                    className="pod-vote pod-vote--dump"
                  >
                    DUMP
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
