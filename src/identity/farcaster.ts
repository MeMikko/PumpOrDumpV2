import MiniAppSDK from "@farcaster/miniapp-sdk";

/**
 * Singleton Farcaster MiniApp SDK instance
 * Used for:
 * - getUser()
 * - getContext()
 * - signMessage()
 * - requestWallet()
 */
export const farcasterSDK = new MiniAppSDK();
