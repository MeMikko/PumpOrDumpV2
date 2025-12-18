// src/lib/useSession.ts
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware"; // tallentaa localStorageen
import { useEffect } from "react";
import { useAccount } from "wagmi";
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
        const { address } = useAccount(); // wagmi:n account
        if (!address) {
          set({ error: "No wallet connected" });
          return;
        }

        set({ loading: true, error: null });

        try {
          // Generoi nonce (voit hakea myös backendistä)
          const nonce = crypto.randomUUID().replace(/-/g, "");

          // Luo SIWE-viesti
          const message = new SiweMessage({
            domain: window.location.host,
            address,
            statement: "Sign in to Pump or Dump with Base",
            uri: window.location.origin,
            version: "1",
            chainId: 8453, // Base Mainnet
            nonce,
          });

          const preparedMessage = message.prepareMessage();

          // Kutsu wagmi:n signMessage (tai Base SDK jos käytät sitä)
          const { signMessageAsync } = useAccount(); // wagmi:n signMessage
          const signature = await signMessageAsync({ message: preparedMessage });

          // Tallenna session
          set({
            signedIn: true,
            address,
            error: null,
          });

          // Voit lähettää signature + message backendille varmistukseen
          // await fetch('/api/auth/verify', { method: 'POST', body: JSON.stringify({ message: preparedMessage, signature }) });
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
      name: "pump-or-dump-session", // tallentaa localStorageen
      partialize: (state) => ({ signedIn: state.signedIn, address: state.address }),
    }
  )
);