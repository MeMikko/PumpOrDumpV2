// src/app/components/SignInWithBase.tsx
"use client";

import { useSession } from "@/lib/useSession";

export function SignInWithBase() {
  const { signedIn, address, loading, error, signIn } = useSession();

  if (signedIn && address) {
    return (
      <div className="text-green-400 text-center text-sm">
        Connected: {address.slice(0, 6)}...{address.slice(-4)}
      </div>
    );
  }

  const handleClick = async () => {
    console.log("Nappi klikattu – kutsutaan signIn()");
    try {
      await signIn();
      console.log("signIn() onnistui");
    } catch (err) {
      console.error("signIn() epäonnistui:", err);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        onClick={handleClick}
        disabled={loading}
        className={`
          bg-blue-600 hover:bg-blue-700 
          px-8 py-4 rounded-xl text-white font-semibold text-lg 
          disabled:opacity-50 disabled:cursor-not-allowed 
          transition-all shadow-lg
        `}
      >
        {loading ? "Signing..." : "Sign with Base"}
      </button>

      {loading && <p className="text-blue-400 text-sm mt-2">Waiting for signature...</p>}
    </div>
  );
}