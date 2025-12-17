// src/identity/useIdentity.ts
"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";

type FarcasterContextUser = {
  fid?: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  pfp?: string;
  avatarUrl?: string;
};

export type Identity =
  | {
      type: "farcaster";
      address?: `0x${string}`;
      fid?: number;
      username?: string;
      displayName: string;
      pfpUrl?: string;
      isMiniApp: true;
    }
  | {
      type: "wallet";
      address: `0x${string}`;
      displayName: string;
      pfpUrl?: undefined;
      fid?: undefined;
      username?: undefined;
      isMiniApp: false;
    }
  | null;

function shortAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function readMiniAppUser(): FarcasterContextUser | null {
  if (typeof window === "undefined") return null;

  const fc = (window as any).fc;
  if (!fc) return null;

  // Yleisimmät muodot joita MiniApp/Base-hostit käyttää:
  const u =
    fc?.context?.user ??
    fc?.user ??
    fc?.context?.profile ??
    fc?.profile ??
    null;

  if (!u) return null;

  return {
    fid: u.fid ?? u.user?.fid,
    username: u.username ?? u.user?.username,
    displayName: u.displayName ?? u.display_name ?? u.user?.displayName,
    pfpUrl: u.pfpUrl ?? u.pfp_url ?? u.pfp ?? u.avatarUrl ?? u.user?.pfpUrl,
    pfp: u.pfp,
    avatarUrl: u.avatarUrl,
  };
}

function isMiniAppEnv() {
  return typeof window !== "undefined" && !!(window as any).fc;
}

export function useIdentity(): Identity {
  const { address, isConnected } = useAccount();
  const [miniUser, setMiniUser] = useState<FarcasterContextUser | null>(null);

  // MiniApp/Base: lue käyttäjä window.fc:stä (EI auth-kit / EI keyDataOf)
  useEffect(() => {
    if (!isMiniAppEnv()) {
      setMiniUser(null);
      return;
    }

    const read = () => setMiniUser(readMiniAppUser());

    read();

    // Kevyt “päivitys” jos host täyttää contextin hetken päästä.
    const t1 = setTimeout(read, 250);
    const t2 = setTimeout(read, 1000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return useMemo(() => {
    const mini = isMiniAppEnv();
    if (mini && miniUser) {
      const display =
        miniUser.displayName ||
        (miniUser.username ? `@${miniUser.username}` : "") ||
        (address ? shortAddress(address) : "Farcaster");

      return {
        type: "farcaster",
        isMiniApp: true,
        address: address as `0x${string}` | undefined,
        fid: miniUser.fid,
        username: miniUser.username,
        displayName: display,
        pfpUrl: miniUser.pfpUrl || miniUser.pfp || miniUser.avatarUrl,
      };
    }

    if (isConnected && address) {
      return {
        type: "wallet",
        isMiniApp: false,
        address: address as `0x${string}`,
        displayName: shortAddress(address),
      };
    }

    return null;
  }, [address, isConnected, miniUser]);
}
