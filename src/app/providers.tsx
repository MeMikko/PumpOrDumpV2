"use client";

import * as React from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";
import { injected, walletConnect, coinbaseWallet } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WC_ID;
const BASE_RPC =
  process.env.NEXT_PUBLIC_BASE_RPC_URL ??
  "https://base-mainnet.public.blastapi.io";

/* ────────────────────────────────────────────── */
/* Wagmi Config                                   */
/* ────────────────────────────────────────────── */

export const wagmiConfig = createConfig({
  ssr: false,
  autoConnect: true,

  chains: [base],
  transports: {
    [base.id]: http(BASE_RPC),
  },

  connectors: [
    /* 🟣 Farcaster MiniApp (autoconnect) */
    farcasterMiniApp(),

    /* 🖥️ Desktop wallets */
    injected({
      target: "metaMask",
      shimDisconnect: true,
    }),

    ...(WC_PROJECT_ID
      ? [
          walletConnect({
            projectId: WC_PROJECT_ID,
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

/* ────────────────────────────────────────────── */
/* React Query                                    */
/* ────────────────────────────────────────────── */

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/* ────────────────────────────────────────────── */
/* Provider Wrapper                               */
/* ────────────────────────────────────────────── */

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
