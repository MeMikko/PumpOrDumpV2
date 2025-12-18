// src/lib/useSession.ts
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { SiweMessage } from "siwe";

type SessionState = {
  signedIn: boolean;
  address: string | null;
  ready: boolean;
  loading: boolean;
  error: string | null;

  markReady: () => void;
  signIn: () => Promise<void>;
  signOut: () => void;
};

export const useSession = create<SessionState>()(
  persist(
    (set, get) => ({
      signedIn: false,
      address: null,
      ready: false,
      loading: false,
      error: null,

      markReady: () => set({ ready: true }),

      signIn: async () => {
        const { address, isConnected } = useAccount();
        const { signMessageAsync } = useSignMessage();

        if (!isConnected || !address) {
          set({ error: "No wallet connected" });
          return;
        }

        set({ loading: true, error: null });

        try {
          const nonce = crypto.randomUUID().replace(/-/g, "");

          const message = new SiweMessage({
            domain: window.location.host,
            address,
            statement: "Sign in to Pump or Dump with Base",
            uri: window.location.origin,
            version: "1",
            chainId: 8453,
            nonce,
          });

          const preparedMessage = message.prepareMessage();
          const signature = await signMessageAsync({ message: preparedMessage });

          set({
            signedIn: true,
            address,
            error: null,
          });
        } catch (err: any) {
          set({ error: err.message || "Sign-in failed" });
        } finally {
          set({ loading: false });
        }
      },

      signOut: () => {
        set({
          signedIn: false,
          address: null,
          error: null,
        });
      },
    }),
    {
      name: "pump-or-dump-session",
      partialize: (state) => ({ signedIn: state.signedIn, address: state.address }),
    }
  )
);