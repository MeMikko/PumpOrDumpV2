"use client";

import { SignInWithBaseButton } from "@base-org/account-ui/react";
import { createBaseAccountSDK } from "@base-org/account";
import { useSession } from "@/lib/useSession";

const sdk = createBaseAccountSDK({
  appName: "Pump or Dump",
});

export function SignInWithBase() {
  const { markSignedIn } = useSession();

  const signInWithBase = async () => {
    const provider = sdk.getProvider();

    // 1️⃣ nonce (voit myöhemmin prefetchoida backendistä)
    const nonce = crypto.randomUUID().replace(/-/g, "");

    // 2️⃣ varmista Base chain
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x2105" }], // Base mainnet (8453)
    });

    // 3️⃣ Sign in with Base Account
    const { accounts } = await provider.request({
      method: "wallet_connect",
      params: [
        {
          version: "1",
          capabilities: {
            signInWithEthereum: {
              nonce,
              chainId: "0x2105",
            },
          },
        },
      ],
    });

    const { address } = accounts[0];
    const { message, signature } =
      accounts[0].capabilities.signInWithEthereum;

    // 4️⃣ Backend-verifiointi
    await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address, message, signature }),
    });

    // 5️⃣ Local session (UI)
    markSignedIn();
  };

  return (
    <SignInWithBaseButton
      colorScheme="dark"
      onClick={signInWithBase}
    />
  );
}
