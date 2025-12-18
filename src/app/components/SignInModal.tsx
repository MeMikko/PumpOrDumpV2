"use client";

import { isBaseApp } from "@/utils/isBaseApp";
import { useSession } from "@/lib/useSession";
import { SignInWithBase } from "./SignInWithBase";

export default function SignInModal() {
  const { signedIn } = useSession();

  // Debug-teksti, joka näkyy Base:ssa jos modal estyy
  if (isBaseApp()) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center">
        <div className="bg-red-900 text-white p-6 rounded-xl max-w-[420px] w-[90%] text-center">
          <h2 className="text-2xl mb-4">DEBUG: Modal estetty</h2>
          <p className="mb-2">isBaseApp() = {isBaseApp() ? "true" : "false"}</p>
          <p className="mb-4">signedIn = {signedIn ? "true" : "false"}</p>
          <p className="text-sm text-red-300">
            Jos näet tämän, ongelma on joko isBaseApp() tai signedIn.
          </p>
        </div>
      </div>
    );
  }

  return null; // Desktop tai ei Base → ei mitään
}