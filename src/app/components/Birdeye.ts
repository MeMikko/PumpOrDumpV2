export async function fetchBirdeyePrice(token: string) {
  try {
    const res = await fetch(
      `https://public-api.birdeye.so/public/price?address=${token}`,
      {
        headers: {
          "x-chain": "base",
        },
        cache: "no-store",
      }
    );

    const json = await res.json();

    return {
      price: json?.data?.value ?? null,
      change24h: json?.data?.priceChange24h ?? null,
    };
  } catch {
    return { price: null, change24h: null };
  }
}
