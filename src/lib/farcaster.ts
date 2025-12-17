import sdk from "@farcaster/miniapp-sdk";

export async function getFarcasterUser() {
  try {
    const ctx = await sdk.context;
    return ctx?.user ?? null;
  } catch {
    return null;
  }
}
