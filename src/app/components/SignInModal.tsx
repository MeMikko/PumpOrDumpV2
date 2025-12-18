// src/app/components/SignInModal.tsx
"use client";

import { isBaseApp } from "@/utils/isBaseApp";
import { useSession } from "@/lib/useSession";
import { SignInWithBase } from "./SignInWithBase";

export default function SignInModal() {
  const { signedIn, address, loading } = useSession();

  if (!isBaseApp()) return null;

  // Jos wallet ei ole connectattu → näytä connect-nappi
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

  // Jos connectattu mutta ei allekirjoitettu → näytä sign-nappi
  if (!signedIn) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center">
        <div className="bg-[#050617] border-2 border-[#1f2937] p-6 rounded-xl max-w-[420px] w-[90%] text-white">
          <h2 className="text-2xl mb-4">Sign In</h2>
          <p className="mb-6">
            Your wallet is connected! Sign this message to verify and start playing.
          </p>
          <SignInWithBase />
        </div>
      </div>
    );
  }

  // Kaikki ok → ei modalia
  return null;
}