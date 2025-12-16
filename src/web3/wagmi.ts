"use client";

import { createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { injected, walletConnect, coinbaseWallet } from "wagmi/connectors";
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";
import { baseAccount } from "@base-org/account";

const WC_ID = process.env.NEXT_PUBLIC_WC_ID;
const RPC_URL =
  process.env.NEXT_PUBLIC_BASE_RPC_URL ??
  "https://base-mainnet.public.blastapi.io";

export const wagmiConfig = createConfig({
  ssr: false,
  autoConnect: true,

  chains: [base],
  transports: {
    [base.id]: http(RPC_URL),
  },

  connectors: [
    // 🟣 Farcaster MiniApp
    farcasterMiniApp(),

    // 🔵 Base Account (smart wallet)
    baseAccount({
      appName: "Pump or Dump",
      appLogoUrl: "https://pumpordump-app.vercel.app/icon.png",
    }),

    // 🖥️ Desktop wallets
    injected({ shimDisconnect: true }),

    ...(WC_ID
      ? [
          walletConnect({
            projectId: WC_ID,
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
