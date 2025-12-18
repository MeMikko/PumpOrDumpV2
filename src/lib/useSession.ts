"use client";

import { create } from "zustand";

type SessionState = {
  signedIn: boolean;
  markSignedIn: () => void;
};

export const useSession = create<SessionState>((set) => ({
  signedIn: false,
  markSignedIn: () => set({ signedIn: true }),
}));
