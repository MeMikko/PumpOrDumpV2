// src/app/MiniAppInit.tsx
"use client";

import { useEffect } from "react";
import { useAccount } from "wagmi";
import { createBaseAccountSDK } from "@base-org/account";

const sdk = createBaseAccountSDK({
  appName: "Pump or Dump",
  appLogoUrl: "https://pumpordump-app.vercel.app/icon.png",
});

export default function MiniAppInit() {
  const { address, isConnected } = useAccount();

  useEffect(() => {
    if (!isConnected) return;

    const provider = sdk.getProvider();

    const initWallet = async () => {
      try {
        // Pakota switch Base-ketjulle
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x2105" }],
        });

        // Hae accounts (varmistus)
        const accounts = await provider.request({ method: "eth_requestAccounts" });
        console.log("Wallet connected, accounts:", accounts);

        // Jos haluat tallentaa address sessioniin
        // useSession().setAddress(accounts[0]);
      } catch (err) {
        console.error("Wallet init error:", err);
      }
    };

    initWallet();
  }, [isConnected]);

  return null;
}
