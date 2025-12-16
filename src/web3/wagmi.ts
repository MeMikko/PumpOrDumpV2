import { createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";

export const wagmiConfig = createConfig({
  ssr: false,
  autoConnect: true,
  chains: [base],
  transports: {
    [base.id]: http(),
  },
  connectors: [
    farcasterMiniApp(), // ✅ Base + Farcaster
    injected(),         // ✅ MetaMask desktop
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WC_ID!,
    }),
  ],
});
