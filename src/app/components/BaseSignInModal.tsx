"use client";

import { useAccount } from "wagmi";
import { useSession } from "@/lib/useSession";
import { isBaseApp } from "@/utils/isBaseApp";
import SignInWithBase from "./SignInWithBase";

export default function SignInModal() {
  const { address } = useAccount();
  const { signedIn, ready } = useSession();

  // Ei desktopissa
  if (!isBaseApp()) return null;

  // Odotetaan että wagmi/provider valmis
  if (!ready) return null;

  // Jos jo signed in → ei näytetä
  if (!address || signedIn) return null;

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
