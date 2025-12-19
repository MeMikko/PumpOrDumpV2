// src/app/components/SignInWithBase.tsx
"use client";

import { sdk } from "@farcaster/miniapp-sdk";
import { useSession } from "@/lib/useSession";
import { isBaseApp } from "@/utils/isBaseApp";

export function SignInWithBase() {
  const { signedIn, loading, error, setLoading, setError } = useSession();

  // ❗ Ei koskaan desktopissa
  if (!isBaseApp()) return null;

  // ❗ Ei näytetä jos jo kirjautunut
  if (signedIn) return null;

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      await sdk.actions.signIn();
      // data tulee MiniAppInitin eventistä
    } catch (e) {
      console.error(e);
      setError("Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-[#0b0b0f] border border-zinc-800 rounded-2xl p-6 w-[90%] max-w-sm text-center">
        <h2 className="text-xl font-semibold mb-2">Welcome to Pump or Dump</h2>
        <p className="text-zinc-400 text-sm mb-4">
          Sign in with your Base Account to continue
        </p>

        {error && <p className="text-red-400 text-sm mb-2">{error}</p>}

        <button
          onClick={handleSignIn}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl text-white font-semibold disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in with Base"}
        </button>
      </div>
    </div>
  );
}
