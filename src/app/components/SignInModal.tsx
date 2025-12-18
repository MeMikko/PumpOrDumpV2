"use client";

import { isBaseApp } from "@/utils/isBaseApp";
import { useSession } from "@/lib/useSession";
import { SignInWithBase } from "./SignInWithBase"; // Oletettu connect-nappi

export default function SignInModal() {
  const { signedIn, loading, error, signIn, address } = useSession();

  if (!isBaseApp()) return null;

  // Jos wallet ei ole connectattu → näytä connect
  if (!address) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center">
        <div className="bg-[#050617] border-2 border-[#1f2937] p-6 rounded-xl max-w-[420px] w-[90%] text-white">
          <h2 className="text-2xl mb-4">Connect Wallet</h2>
          <p className="mb-6">Connect your Base wallet to continue</p>
          <SignInWithBase />
        </div>
      </div>
    );
  }

  // Wallet connectattu, mutta ei allekirjoitettu → näytä sign-in
  if (!signedIn) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center">
        <div className="bg-[#050617] border-2 border-[#1f2937] p-6 rounded-xl max-w-[420px] w-[90%] text-white">
          <h2 className="text-2xl mb-4">Sign In</h2>
          <p className="mb-6">
            Sign this message to verify your wallet and start playing.
          </p>
          {error && <p className="text-red-400 mb-4">{error}</p>}
          <button
            onClick={signIn}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg w-full disabled:opacity-50"
          >
            {loading ? "Signing..." : "Sign Message"}
          </button>
        </div>
      </div>
    );
  }

  return null;
}