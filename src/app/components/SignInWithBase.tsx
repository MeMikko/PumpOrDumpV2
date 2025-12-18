"use client";

import { SignInWithBaseButton } from "@base-org/account-ui/react";
import { createBaseAccountSDK } from "@base-org/account";

const sdk = createBaseAccountSDK({
  appName: "Pump or Dump",
});

export function SignInWithBase() {
  const signIn = async () => {
    const provider = sdk.getProvider();

    const nonce = crypto.randomUUID().replace(/-/g, "");

    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x2105" }], // Base
    });

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

    await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address, message, signature }),
    });
  };

  return (
    <SignInWithBaseButton
      colorScheme="dark"
      onClick={signIn}
    />
  );
}
