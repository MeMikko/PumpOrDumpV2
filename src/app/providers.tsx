// src/app/providers.tsx
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
import { isBaseApp } from "@/utils/isBaseApp";

/* ───────────────── ENV ───────────────── */

const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WC_ID;
const BASE_RPC =
  process.env.NEXT_PUBLIC_BASE_RPC_URL ??
  "https://base-mainnet.public.blastapi.io";

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
  /**
   * ⚠️ TÄRKEÄÄ
   * isBaseApp() saa kutsua VAIN clientissä
   * siksi koko wagmiConfig rakennetaan täällä
   */
  const wagmiConfig = React.useMemo(() => {
    const connectors = isBaseApp()
      ? [
          /**
           * 🟣 Base / Farcaster Mini App
           * – auto-connect
           * – Base Account identity
           */
          farcasterMiniApp(),

          baseAccount({
            appName: "Pump or Dump",
            appLogoUrl: "https://pumpordump-app.vercel.app/icon.png",
          }),
        ]
      : [
          /**
           * 🖥 Desktop / Admin
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
        ];

    return createConfig({
      ssr: false,
      chains: [base],
      transports: {
        [base.id]: http(BASE_RPC),
      },
      connectors,
    });
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
