"use client";

import { create } from "zustand";

type SessionState = {
  signedIn: boolean;
  ready: boolean;
  markSignedIn: () => void;
  markReady: () => void;
};

export const useSession = create<SessionState>((set) => ({
  signedIn: false,
  ready: false,

  markSignedIn: () => set({ signedIn: true }),
  markReady: () => set({ ready: true }),
}));
