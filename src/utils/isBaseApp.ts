export function isBaseApp() {
  if (typeof window === "undefined") return false;
  return Boolean((window as any).ethereum?.isBase);
}
