"use client";

import { useAccount } from "wagmi";
import { useProfile } from "@farcaster/auth-kit";
import { detectEnv } from "@/utils/detectEnv";
import { useIdentity } from "./useIdentity";

export type AuthState =
  | { state: "miniapp"; identity: ReturnType<typeof useIdentity> }
  | { state: "needs-wallet" }
  | { state: "needs-farcaster" }
  | { state: "ready"; identity: ReturnType<typeof useIdentity> };

export function useAuthGate(): AuthState {
  const env = detectEnv();
  const identity = useIdentity();
  const { isConnected } = useAccount();
  const { isAuthenticated } = useProfile();

  // 🟣 Farcaster MiniApp
  if (env === "miniapp" && identity) {
    return { state: "miniapp", identity };
  }

  // 🖥 Desktop
  if (env === "desktop") {
    if (!isConnected) return { state: "needs-wallet" };
    if (!isAuthenticated) return { state: "needs-farcaster" };
    return { state: "ready", identity };
  }

  // 📱 Mobile
  if (env === "mobile") {
    if (!isConnected) return { state: "needs-wallet" };
    return { state: "ready", identity };
  }

  return { state: "needs-wallet" };
}
