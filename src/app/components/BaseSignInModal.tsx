// src/app/components/BaseSignInModal.tsx (tai SignInModal.tsx)
"use client";

import { isBaseApp } from "@/utils/isBaseApp";
import { useSession } from "@/lib/useSession";
import { useAccount } from "wagmi";
import { SignInWithBase } from "./SignInWithBase";

export default function SignInModal() {
  const { signedIn, address, loading } = useSession();
  const { isConnected } = useAccount();

  console.log("SignInModal: isBaseApp =", isBaseApp());
  console.log("SignInModal: signedIn =", signedIn);
  console.log("SignInModal: address =", address);
  console.log("SignInModal: isConnected =", isConnected);
  console.log("SignInModal: loading =", loading);

  if (!isBaseApp()) {
    console.log("Ei Base MiniApp → ei renderöidä");
    return null;
  }

  // Jos wallet ei connectattu tai loading → näytä loading
  if (!isConnected || loading) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center">
        <div className="bg-[#050617] border-2 border-[#1f2937] p-6 rounded-xl max-w-[420px] w-[90%] text-white text-center">
          <h2 className="text-2xl mb-4">Connecting Wallet...</h2>
          <p className="mb-6">Please wait while we connect your Base wallet.</p>
        </div>
      </div>
    );
  }

  // Jos wallet connectattu mutta ei signed in → näytä sign-in modal
  if (!signedIn) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center">
        <div className="bg-[#050617] border-2 border-[#1f2937] p-6 rounded-xl max-w-[420px] w-[90%] text-white">
          <h2 className="text-2xl mb-4">Welcome to Pump or Dump</h2>
          <p className="mb-6">
            Sign in with your Base Account to start voting, earning XP and claiming rewards.
          </p>
          <SignInWithBase />
        </div>
      </div>
    );
  }

  // Kaikki ok → ei modalia
  return null;
}
