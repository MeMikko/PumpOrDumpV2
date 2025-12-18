"use client";

import { SignInWithBase } from "./SignInWithBase";

export default function SignInModal() {
  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center">
      <div className="bg-[#050617] border-2 border-[#1f2937] p-6 rounded-xl max-w-[420px] w-[90%]">
        <h2 className="text-white text-2xl mb-4">TEST MODAL</h2>
        <p className="text-white mb-6">Tämän pitäisi näkyä Base-sovelluksessa!</p>
        <SignInWithBase />
      </div>
    </div>
  );
}