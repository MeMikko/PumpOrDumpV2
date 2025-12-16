// src/web3/wagmi.ts
import { createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";
import { injected, walletConnect, coinbaseWallet } from "wagmi/connectors";

const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WC_ID;
const BASE_RPC =
  process.env.NEXT_PUBLIC_BASE_RPC_URL ??
  "https://base-mainnet.public.blastapi.io";

export const wagmiConfig = createConfig({
  ssr: false,

  chains: [base],
  transports: {
    [base.id]: http(BASE_RPC),
  },

  connectors: [
    /* 🟣 Farcaster MiniApp */
    farcasterMiniApp(),

    /* 🦊 MetaMask */
    injected({
      target: "metaMask",
      shimDisconnect: true,
    }),

    /* 🔗 WalletConnect */
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

    /* 🧿 Coinbase Wallet */
    coinbaseWallet({
      appName: "Pump or Dump",
    }),
  ],
});
