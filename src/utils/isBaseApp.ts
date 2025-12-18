export function isBaseApp() {
  // Base MiniApp iframe käyttää usein näitä
  if (typeof window === "undefined") return false;

  const host = window.location.host;
  if (
    host.includes("base.org") ||
    host.includes("miniapp.base.org") ||
    host.includes("vercel.app") || // Vercel preview
    window.base || // Base SDK
    window.ethereum?.isBase // Joskus Base SDK lisää tämän
  ) {
    return true;
  }

  // Lisävarmistus: Base app lähettää usein tietyn user-agentin
  return /Base|BaseWallet|Coinbase/i.test(navigator.userAgent);
}