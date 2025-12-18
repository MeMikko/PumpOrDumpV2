// src/web3/wagmiConfig.ts
"use client"; // Tärkeää: tämä tiedosto on client-side only

import { createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";
import { baseAccount } from "@base-org/account"; // ← Tämä puuttui!
import { injected, walletConnect, coinbaseWallet } from "wagmi/connectors";

const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WC_ID;
const BASE_RPC =
  process.env.NEXT_PUBLIC_BASE_RPC_URL ??
  "https://base-mainnet.public.blastapi.io";

// Käytä dynaamista connector-valintaa client-side (window on olemassa)
const getConnectors = () => {
  if (typeof window === "undefined") return [];

  return [
    // Farcaster MiniApp (pakollinen Farcaster-embedille)
    farcasterMiniApp(),

    // Base Account (pakollinen automaattiselle Base Smart Wallet -connectille)
    baseAccount({
      appName: "Pump or Dump",
      appLogoUrl: "https://pumpordump-app.vercel.app/icon.png",
    }),

    // Desktop / muut ympäristöt
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
  ];
};

export const wagmiConfig = createConfig({
  ssr: false,
  chains: [base],
  transports: {
    [base.id]: http(BASE_RPC),
  },
  connectors: getConnectors(), // kutsutaan client-side
});