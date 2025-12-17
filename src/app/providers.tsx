"use client";

import * as React from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { metaMask, walletConnect, coinbaseWallet } from "wagmi/connectors";
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthKitProvider } from "@farcaster/auth-kit";

/* ───────────────── ENV ───────────────── */

const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WC_ID;
const BASE_RPC =
  process.env.NEXT_PUBLIC_BASE_RPC_URL ??
  "https://base-mainnet.public.blastapi.io";

/* ───────────────── Wagmi Config ───────────────── */

export const wagmiConfig = createConfig({
  ssr: false,
  chains: [base],
  transports: {
    [base.id]: http(BASE_RPC),
  },
  connectors: [
    // 🟣 Farcaster MiniApp
    farcasterMiniApp(),

    // 🦊 Desktop MetaMask & muut injected walletit
    injected(),

    // 🔗 WalletConnect (mobile)
    ...(WC_PROJECT_ID
      ? [
          walletConnect({
            projectId: WC_PROJECT_ID,
            showQrModal: true,
            metadata: {
              name: "Pump or Dump",
              description: "Predict → Earn → Dominate",
              url: "https://pumpordump-app.vercel.app",
              icons: ["https://pumpordump-app.vercel.app/icon.png"],
            },
          }),
        ]
      : []),

    // 🔵 Coinbase Wallet
    coinbaseWallet({
      appName: "Pump or Dump",
    }),
  ],
});


/* ───────────────── React Query ───────────────── */

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/* ───────────────── Providers ───────────────── */

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  const authConfig = {
    domain:
      typeof window !== "undefined"
        ? window.location.host
        : "pumpordump-app.vercel.app",
    siweUri:
      typeof window !== "undefined"
        ? window.location.href
        : "https://pumpordump-app.vercel.app",
    relay: "https://relay.farcaster.xyz",
    rpcUrl: BASE_RPC,
  };

  return (
    <WagmiProvider config={wagmiConfig}>
      <AuthKitProvider config={authConfig}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </AuthKitProvider>
    </WagmiProvider>
  );
}
