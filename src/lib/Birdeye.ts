const BIRDEYE_API_KEY = process.env.NEXT_PUBLIC_BIRDEYE_API_KEY;

type BirdeyePrice = {
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

    return json?.data ?? {};
  } catch (e) {
    console.error("Birdeye fetch failed", e);
    return {};
  }
}
