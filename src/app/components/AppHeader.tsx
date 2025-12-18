"use client";

import * as React from "react";
import Link from "next/link";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { isBaseApp } from "@/utils/isBaseApp";
import type { Address } from "viem";

import { getPlayerSafe } from "@/web3/contract";

function shortAddr(a?: string) {
  if (!a) return "";
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

async function tryResolveEns(address: Address): Promise<string | null> {
  // ENS on optional
  return null;
}

export default function AppHeader() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect, connectors, isPending } = useConnect();

  const [ens, setEns] = React.useState<string | null>(null);
  const [xp, setXp] = React.useState<number>(0);
  const [level, setLevel] = React.useState<number>(0);

  const online = Boolean(address);

  React.useEffect(() => {
    let alive = true;

    (async () => {
      if (!address) {
        setEns(null);
        setXp(0);
        setLevel(0);
        return;
      }

      // XP / Level contractilta
      try {
        const p = await getPlayerSafe(address as Address);
        if (!alive) return;
        setXp(p.xp);
        setLevel(p.level);
      } catch {
        if (!alive) return;
        setXp(0);
        setLevel(0);
      }

      // ENS (optional)
      try {
        const name = await tryResolveEns(address as Address);
        if (!alive) return;
        setEns(name);
      } catch {
        if (!alive) return;
        setEns(null);
      }
    })();

    return () => {
      alive = false;
    };
  }, [address]);

  const display =
    ens ||
    (address ? shortAddr(address) : "Not connected");

  const avatarUrl =
    // fallback avatar
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64">
        <rect width="64" height="64" fill="#0b0b0f"/>
        <rect x="8" y="8" width="48" height="48" fill="#111827"/>
        <rect x="16" y="18" width="8" height="8" fill="#22d3ee"/>
        <rect x="40" y="18" width="8" height="8" fill="#22d3ee"/>
        <rect x="24" y="40" width="16" height="6" fill="#a3a3a3"/>
      </svg>`
    );

  return (
    <header className="pod-header">
      <div className="pod-header__inner">
        <Link href="/" className="pod-brand" aria-label="Pump or Dump home">
          <span className="pod-brand__title">PUMP OR DUMP</span>
          <span className="pod-brand__chip">BASE</span>
        </Link>

        <div className="pod-user">
          <span className={`pod-dot ${online ? "is-on" : "is-off"}`} />

          <img className="pod-avatar" src={avatarUrl} alt="" />

          <div className="pod-user__meta">
            <div className="pod-user__name">{display}</div>
            <div className="pod-user__sub">
              <span>XP {xp.toLocaleString()}</span>
              <span className="pod-sep">·</span>
              <span>LVL {level}</span>
            </div>
          </div>

          {/* Wallet connect only */}
          <div className="pod-actions">
            {!isConnected ? (
              <button
                className="pod-btn"
                disabled={isPending}
                onClick={() => {
                  const injected = connectors.find(
                    (c) => c.id === "injected"
                  );
                  if (injected) {
                    connect({ connector: injected });
                  }
                }}
              >
                {isPending ? "CONNECTING…" : "CONNECT"}
              </button>
            ) : (
              <button className="pod-btn" onClick={() => disconnect()}>
                DISCONNECT
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
