"use client";

import * as React from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import {
  injected,
  walletConnect,
  coinbaseWallet,
  baseAccount,
} from "wagmi/connectors";
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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
    /**
     * 🔑 Base App / Mini App
     * – auto-connect Base Account
     * – enables paymaster, gasless, batching
     */
    farcasterMiniApp(),

    baseAccount({
      appName: "Pump or Dump",
      appLogoUrl: "https://pumpordump-app.vercel.app/icon.png",
    }),

    /**
     * 🖥 Desktop / Admin paneeli
     */
    injected(),

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
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
