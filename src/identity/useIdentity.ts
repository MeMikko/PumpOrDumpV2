"use client";

import { useEffect, useState } from "react";
import MiniAppSDK from "@farcaster/miniapp-sdk";
import { useAccount } from "wagmi";

export type Identity =
  | {
      type: "farcaster";
      fid: number;
      username?: string;
      pfp?: string;
    }
  | {
      type: "wallet";
      address: `0x${string}`;
    }
  | null;

function isMiniApp() {
  return typeof window !== "undefined" && (window as any).fc;
}

export function useIdentity(): Identity {
  const { address, isConnected } = useAccount();
  const [identity, setIdentity] = useState<Identity>(null);

  useEffect(() => {
    // 🟣 Farcaster MiniApp
    if (isMiniApp()) {
      MiniAppSDK.getUser()
        .then((user) => {
          setIdentity({
            type: "farcaster",
            fid: user.fid,
            username: user.username,
            pfp: user.pfpUrl,
          });
        })
        .catch(() => {
          // fallback if something weird happens
          if (address) {
            setIdentity({
              type: "wallet",
              address,
            });
          }
        });

      return;
    }

    // 🖥️ Base App / Desktop
    if (isConnected && address) {
      setIdentity({
        type: "wallet",
        address,
      });
    } else {
      setIdentity(null);
    }
  }, [address, isConnected]);

  return identity;
}
