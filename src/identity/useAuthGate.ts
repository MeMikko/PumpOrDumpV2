"use client";

import { useAccount } from "wagmi";
import { detectEnv } from "@/utils/detectEnv";
import { useIdentity } from "./useIdentity";

export type AuthState =
  | { state: "miniapp"; identity: ReturnType<typeof useIdentity> }
  | { state: "needs-wallet" }
  | { state: "ready"; identity: ReturnType<typeof useIdentity> };

export function useAuthGate(): AuthState {
  const env = detectEnv();
  const identity = useIdentity();
  const { isConnected } = useAccount();

  // 🟣 MiniApp: wallet + Farcaster context riittää
  if (env === "miniapp" && identity) {
    return { state: "miniapp", identity };
  }

  // Desktop + Mobile
  if (!isConnected) return { state: "needs-wallet" };

  return { state: "ready", identity };
}
