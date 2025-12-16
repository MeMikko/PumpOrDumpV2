"use client";

import { useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

export default function MiniAppInit() {
  useEffect(() => {
    try {
      sdk.actions.ready();
    } catch {
      // Desktopissa tämä ei ole MiniApp → täysin ok
    }
  }, []);

  return null;
}
