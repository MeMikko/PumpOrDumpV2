"use client";

import { SignInWithBaseButton } from "@base-org/account-ui/react";
import { createBaseAccountSDK } from "@base-org/account";
import { useSession } from "@/lib/useSession";

type WalletConnectResult = {
  accounts: Array<{
    address: string;
    capabilities: {
      signInWithEthereum: {
        message: string;
        signature: `0x${string}`;
      };
    };
  }>;
};

const sdk = createBaseAccountSDK({
  appName: "Pump or Dump",
});

export function SignInWithBase() {
  const { markSignedIn } = useSession();

  const signInWithBase = async () => {
    const provider = sdk.getProvider();

    const nonce = crypto.randomUUID().replace(/-/g, "");

    // Ensure Base chain
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x2105" }], // Base mainnet
    });

    const result = (await provider.request({
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
    })) as WalletConnectResult;

    const account = result.accounts[0];
    const { address } = account;
    const { message, signature } =
      account.capabilities.signInWithEthereum;

    await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address, message, signature }),
    });

    markSignedIn();
  };

  return (
    <SignInWithBaseButton
      colorScheme="dark"
      onClick={signInWithBase}
    />
  );
}
