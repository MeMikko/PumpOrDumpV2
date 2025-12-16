// src/web3/wagmi.ts
"use client";

import { createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";

const RPC_URL =
  process.env.NEXT_PUBLIC_BASE_RPC_URL ||
  "https://base-mainnet.public.blastapi.io";

const WC_ID = process.env.NEXT_PUBLIC_WC_ID;

export const wagmiConfig = createConfig({
  ssr: false,
  autoConnect: true,

  chains: [base],

  transports: {
    [base.id]: http(RPC_URL),
  },

  connectors: [
    // 🟣 Farcaster MiniApp (Base Account / Farcaster ID)
    farcasterMiniApp(),

    // 🦊 MetaMask DESKTOP ONLY (ei RN)
    injected({
      target: "metaMask",
      shimDisconnect: true,
    }),

    // 🔵 WalletConnect (vain jos Project ID on asetettu)
    ...(WC_ID
      ? [
          walletConnect({
            projectId: WC_ID,
            metadata: {
              name: "Pump or Dump",
              description: "Predict crypto trends. Earn rewards.",
              url: "https://pumpordump-app.vercel.app",
              icons: ["https://pumpordump-app.vercel.app/icon.png"],
            },
          }),
        ]
      : []),
  ],
});
