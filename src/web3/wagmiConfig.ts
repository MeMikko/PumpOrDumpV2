// src/web3/wagmiConfig.ts
"use client";

import { createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";
import { injected, walletConnect, coinbaseWallet } from "wagmi/connectors";

const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WC_ID;
const BASE_RPC = process.env.NEXT_PUBLIC_BASE_RPC_URL ?? "https://base-mainnet.public.blastapi.io";

// Dynaamiset connectorit client-side
const getConnectors = () => {
  const connectors = [
    farcasterMiniApp(), // Farcaster MiniApp -autoconnect
    injected({ shimDisconnect: true }), // Injected (Base Wallet, MetaMask jne.)
    coinbaseWallet({ appName: "Pump or Dump" }),
  ];

  // Lisää walletConnect vain jos projectId on määritelty
  if (WC_PROJECT_ID) {
    connectors.push(
      walletConnect({
        projectId: WC_PROJECT_ID,
        metadata: {
          name: "Pump or Dump",
          description: "Predict → Earn → Dominate",
          url: "https://pumpordump-app.vercel.app",
          icons: ["https://pumpordump-app.vercel.app/icon.png"],
        },
      })
    );
  }

  return connectors;
};

export const wagmiConfig = createConfig({
  ssr: false,
  chains: [base],
  transports: {
    [base.id]: http(BASE_RPC),
  },
  connectors: getConnectors(),
});
