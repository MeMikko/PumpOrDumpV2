export type AppEnv = "miniapp" | "desktop" | "mobile" | "server";

export function detectEnv(): AppEnv {
  if (typeof window === "undefined") return "server";

  if ((window as any).fc) return "miniapp";

  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|android/.test(ua)) return "mobile";

  return "desktop";
}
