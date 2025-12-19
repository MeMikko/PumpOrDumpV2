"use client";

import { sdk } from "@farcaster/miniapp-sdk";

let initialized = false;

export function initMiniAppSdk() {
  if (initialized) return;
  if (typeof window === "undefined") return;

  try {
    sdk.actions.ready();
    initialized = true;
    console.log("[MiniApp] SDK ready()");
  } catch (e) {
    console.warn("[MiniApp] SDK init failed", e);
  }
}
