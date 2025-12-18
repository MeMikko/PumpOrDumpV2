"use client";

import { useAccount } from "wagmi";
import { useSession } from "@/lib/useSession";
import { SignInWithBase } from "@/app/components/SignInWithBase";

export default function SignInModal() {
  const { address } = useAccount();
  const { signedIn, ready } = useSession();

  if (!ready) return null;
  if (!address || signedIn) return null;

  return (
    <div className="pod-modal-backdrop">
      <div className="pod-modal">
        <h2 className="pixel-text mb-2">Welcome to Pump or Dump</h2>
        <p className="text-xs text-zinc-400 mb-4">
          Sign in with your Base Account to start voting, earning XP, and
          claiming rewards.
        </p>

        <SignInWithBase />
      </div>
    </div>
  );
}
