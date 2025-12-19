// src/app/components/SignInWithBase.tsx
"use client";

import { sdk } from "@farcaster/miniapp-sdk";
import { useSession } from "@/lib/useSession";

export function SignInWithBase() {
  const { signedIn, setSignedIn, loading, setLoading, error, setError } =
    useSession();

  if (signedIn) return null;

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      await sdk.actions.signIn();
      setSignedIn(true);
    } catch (e: any) {
      console.error("Base sign-in failed", e);
      setError("Sign in failed");
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
        className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-xl text-white font-semibold text-lg disabled:opacity-50"
      >
        {loading ? "Signing in…" : "Sign in with Base"}
      </button>
    </div>
  );
}
