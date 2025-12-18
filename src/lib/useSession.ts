// src/lib/useSession.ts
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type SessionState = {
  signedIn: boolean;
  address: string | null;
  loading: boolean;
  error: string | null;

  setSignedIn: (value: boolean) => void;
  setAddress: (value: string | null) => void;
  setLoading: (value: boolean) => void;
  setError: (value: string | null) => void;
};

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      signedIn: false,
      address: null,
      loading: false,
      error: null,

      setSignedIn: (value) => set({ signedIn: value }),
      setAddress: (value) => set({ address: value }),
      setLoading: (value) => set({ loading: value }),
      setError: (value) => set({ error: value }),
    }),
    { name: "pump-or-dump-session" }
  )
);
