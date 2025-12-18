// src/web3/wagmiConfig.ts
"use client";

import { createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";
import { injected, walletConnect, coinbaseWallet } from "wagmi/connectors";

const getConnectors = () => [
  farcasterMiniApp(),
  injected({ shimDisconnect: true }),
  walletConnect({ projectId: process.env.NEXT_PUBLIC_WC_ID }),
  coinbaseWallet({ appName: "Pump or Dump" }),
];

export const wagmiConfig = createConfig({
  ssr: false,
  chains: [base],
  transports: { [base.id]: http() },
  connectors: getConnectors(),
});
