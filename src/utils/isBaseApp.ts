// src/utils/isBaseApp.ts
export function isBaseApp(): boolean {
  if (typeof window === "undefined") return false;

  const host = window.location.host.toLowerCase();

  // Base MiniApp käyttää näitä hostnameja
  if (
    host.includes("base.org") ||
    host.includes("miniapp.base.org") ||
    host.includes("vercel.app") || // preview/dev
    host.includes("localhost")
  ) {
    return true;
  }

  // Base SDK:n property (joskus)
  const w = window as any;
  if (w.base || (w.ethereum && w.ethereum.isBase)) return true;

  // User-Agent (Base app lähettää tämän)
  if (/Base|Coinbase|BaseWallet/i.test(navigator.userAgent)) return true;

  return false;
}