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
  appLogoUrl: "https://pumpordump-app.vercel.app/icon.png", // hyvä lisätä
});

export function SignInWithBase() {
  const { address, signedIn, loading, error, signIn } = useSession();

  // Jos jo kirjautunut → näytä connected-tila
  if (signedIn && address) {
    return (
      <div className="text-green-400 text-center text-sm">
        Connected: {address.slice(0, 6)}...{address.slice(-4)}
      </div>
    );
  }

  const handleSignIn = async () => {
    try {
      await signIn(); // Käyttää uutta hookin signIn-funktiota
    } catch (err) {
      console.error("Sign-in failed:", err);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <SignInWithBaseButton
        colorScheme="dark"
        onClick={handleSignIn}
        disabled={loading}
        size="lg"
      />
      {loading && <p className="text-blue-400 text-sm mt-2">Signing...</p>}
    </div>
  );
}