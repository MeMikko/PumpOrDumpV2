"use client";

import { isBaseApp } from "@/utils/isBaseApp";
import { SignInWithBase } from "./SignInWithBase";

export default function SignInModal() {
  console.log("DEBUG: SignInModal renderöidään");

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center">
      <div className="bg-[#050617] border-2 border-[#1f2937] p-8 rounded-2xl max-w-[420px] w-[90%] text-white">
        <h2 className="text-3xl mb-4">DEBUG MODAL</h2>
        <p className="mb-6">Tämän pitäisi näkyä Base:ssa heti!</p>
        <SignInWithBase />
      </div>
    </div>
  );
}