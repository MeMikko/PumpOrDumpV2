"use client";

import { isBaseApp } from "@/utils/isBaseApp";
import { useSession } from "@/lib/useSession";
import { SignInWithBase } from "./SignInWithBase";

export default function SignInModal() {
  const { signedIn } = useSession();

  // ❗ Ei koskaan desktopissa
  if (!isBaseApp()) return null;

  // ❗ Jos jo kirjautunut → ei popupia
  if (signedIn) return null;

  return (
    <div className="signin-overlay">
      <div className="signin-modal">
        <h2>Welcome to Pump or Dump</h2>

        <p>
          Sign in with your Base Account to start voting,
          earning XP and claiming rewards.
        </p>

        <SignInWithBase />
      </div>
    </div>
  );
}
