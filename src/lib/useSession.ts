// src/lib/useSession.ts
"use client";

import { create } from "zustand";

type User = {
  fid: number;
  username?: string;
  displayName?: string;
  avatar?: string;
  address?: string;
};

type SessionState = {
  signedIn: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;

  setSignedIn: (v: boolean) => void;
  setUser: (u: User) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
};

export const useSession = create<SessionState>((set) => ({
  signedIn: false,
  user: null,
  loading: false,
  error: null,

  setSignedIn: (v) => set({ signedIn: v }),
  setUser: (u) => set({ user: u }),
  setLoading: (v) => set({ loading: v }),
  setError: (e) => set({ error: e }),
}));
