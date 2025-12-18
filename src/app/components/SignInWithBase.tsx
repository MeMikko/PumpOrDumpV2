// src/app/components/SignInWithBase.tsx
"use client";

import { useSession } from "@/lib/useSession";
import { useAccount, useSignMessage } from "wagmi";
import { SiweMessage } from "siwe";

export function SignInWithBase() {
  const { signedIn, address, loading, error, setLoading, setError, setSignedIn } = useSession();
  const { isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();

  if (signedIn && address) {
    return (
      <div className="text-green-400 text-center text-sm">
        Connected: {address.slice(0, 6)}...{address.slice(-4)}
      </div>
    );
  }

  const handleSignIn = async () => {
    if (!isConnected) {
      setError("Wallet not connected");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const nonce = crypto.randomUUID().replace(/-/g, "");

      const message = new SiweMessage({
        domain: window.location.host,
        address: address || (await useAccount().address),
        statement: "Sign in to Pump or Dump",
        uri: window.location.origin,
        version: "1",
        chainId: 8453,
        nonce,
      });

      const preparedMessage = message.prepareMessage();
      const signature = await signMessageAsync({ message: preparedMessage });

      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, message: preparedMessage, signature }),
      });

      if (!res.ok) throw new Error("Verification failed");

      setSignedIn(true);
      console.log("Kirjautuminen onnistui!");
    } catch (err: any) {
      setError(err.message || "Sign-in failed");
      console.error("Sign-in error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        onClick={handleSignIn}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-xl text-white font-semibold text-lg disabled:opacity-50 transition-all shadow-lg"
      >
        {loading ? "Signing..." : "Sign In with Base"}
      </button>
      {loading && <p className="text-blue-400 text-sm mt-2">Waiting for signature...</p>}
    </div>
  );
}
