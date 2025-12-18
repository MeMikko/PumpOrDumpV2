const BIRDEYE_API_KEY = process.env.NEXT_PUBLIC_BIRDEYE_API_KEY;

export type BirdeyePrice = {
  value?: number;
  priceChange24h?: number;
};

export async function fetchBirdeyePrices(
  addresses: string[]
): Promise<Record<string, BirdeyePrice>> {
  if (!BIRDEYE_API_KEY || addresses.length === 0) return {};

  try {
    const res = await fetch(
      `https://public-api.birdeye.so/defi/multi_price?list_address=${addresses
        .map((a) => a.toLowerCase())
        .join(",")}`,
      {
        headers: {
          "X-API-KEY": BIRDEYE_API_KEY,
          "x-chain": "base",
        },
        cache: "no-store",
      }
    );

    const json = await res.json();

    const raw = json?.data ?? {};
    const normalized: Record<string, BirdeyePrice> = {};

    // 🔑 KRIITTINEN KORJAUS: normalisoi osoitteet lowercaseksi
    for (const [addr, data] of Object.entries(raw)) {
      normalized[addr.toLowerCase()] = data as BirdeyePrice;
    }

    return normalized;
  } catch (e) {
    console.error("Birdeye fetch failed", e);
    return {};
  }
}
