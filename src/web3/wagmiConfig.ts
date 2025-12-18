// src/web3/wagmiConfig.ts
"use client"; // Client-side only

import { createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";
import { injected, walletConnect, coinbaseWallet } from "wagmi/connectors";

const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WC_ID;
const BASE_RPC =
  process.env.NEXT_PUBLIC_BASE_RPC_URL ??
  "https://base-mainnet.public.blastapi.io";

// Dynaamiset connectorit client-side
const getConnectors = () => {
  if (typeof window === "undefined") return [];

  return [
    farcasterMiniApp(), // Farcaster MiniApp -autoconnect

    injected({ shimDisconnect: true }), // Injected (MetaMask, Base Wallet, etc.)

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
  connectors: getConnectors(),
});