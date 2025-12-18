"use client";

import * as React from "react";
import { useAccount } from "wagmi";
import type { Address } from "viem";
import { getPlayerSafe } from "@/web3/contract";

function shortAddr(a?: string) {
  if (!a) return "";
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

export default function ProfileCard() {
  const { address, connector } = useAccount();

  const [xp, setXp] = React.useState<number>(0);
  const [level, setLevel] = React.useState<number>(0);
  const [loading, setLoading] = React.useState(true);

  const isBaseAccount = connector?.id === "baseAccount";

  React.useEffect(() => {
    let alive = true;

    (async () => {
      if (!address) {
        setXp(0);
        setLevel(0);
        setLoading(false);
        return;
      }

      try {
        const p = await getPlayerSafe(address as Address);
        if (!alive) return;
        setXp(p.xp);
        setLevel(p.level);
      } catch {
        if (!alive) return;
        setXp(0);
        setLevel(0);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [address]);

  const displayName = React.useMemo(() => {
    if (isBaseAccount) return "Base Player";
    if (address) return shortAddr(address);
    return "Anonymous";
  }, [isBaseAccount, address]);

  if (loading) {
    return (
      <div className="pod-card pod-card--skeleton">
        <div className="sk-line" />
        <div className="sk-line" />
        <div className="sk-line" />
      </div>
    );
  }

  return (
    <div className="pod-card">
      <div className="pod-card__name">{displayName}</div>

      <div className="pod-stats">
        <div>XP: {xp.toLocaleString()}</div>
        <div>Level: {level}</div>
      </div>
    </div>
  );
}
