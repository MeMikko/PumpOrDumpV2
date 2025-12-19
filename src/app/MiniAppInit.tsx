// src/app/MiniAppInit.tsx
"use client";

import { useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { useSession } from "@/lib/useSession";

export default function MiniAppInit() {
  const { setSignedIn, setUser } = useSession();

  useEffect(() => {
    // Kerrotaan Base Appille että ollaan valmiita
    sdk.actions.ready();

    // Kuunnellaan signin-eventti
    sdk.on("signIn", (payload) => {
      /*
        payload sisältää mm:
        {
          fid,
          username,
          displayName,
          pfpUrl,
          custodyAddress
        }
      */

      setUser({
        fid: payload.fid,
        username: payload.username,
        displayName: payload.displayName,
        avatar: payload.pfpUrl,
        address: payload.custodyAddress,
      });

      setSignedIn(true);
    });

    return () => {
      sdk.removeAllListeners();
    };
  }, [setSignedIn, setUser]);

  return null;
}
