"use client";

import { SignInWithBase } from "./SignInWithBase";
import { useSession } from "@/lib/useSession";
import { isBaseApp } from "@/utils/isBaseApp";

export default function BaseSignInModal() {
  const { signedIn } = useSession();

  // ÄLÄ näytä desktopissa
  if (!isBaseApp()) return null;

  // ÄLÄ näytä jos jo kirjautunut
  if (signedIn) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center">
      <div className="w-full max-w-md mx-4 rounded-xl bg-[#0b0b1a] border border-cyan-500/30 p-6 text-center">
        <h2 className="text-xl mb-2">Welcome to Pump or Dump</h2>
        <p className="text-sm text-zinc-400 mb-6">
          Sign in with your Base Account to start voting, earning XP, and claiming rewards.
        </p>

        <SignInWithBase />
      </div>
    </div>
  );
}
