// src/utils/isBaseApp.ts

export function isBaseApp(): boolean {
  if (typeof window === "undefined") return false;

  const host = window.location.host.toLowerCase();

  // Base MiniApp -iframe käyttää näitä hostnameja
  if (
    host.includes("base.org") ||
    host.includes("miniapp.base.org") ||
    host.includes("vercel.app") || // Vercel preview / dev
    host.includes("localhost") // paikallinen kehitys
  ) {
    return true;
  }

  // Base SDK lisää usein tämän propertyn window-objektiin
  // (TypeScript ei tiedä sitä, joten käytetään any-cast)
  const w = window as any;
  if (w.base || (w.ethereum && w.ethereum.isBase)) {
    return true;
  }

  // User-Agent tarkistus varmuudeksi (Base app lähettää tämän)
  if (/Base|Coinbase|BaseWallet/i.test(navigator.userAgent)) {
    return true;
  }

  return false;
}