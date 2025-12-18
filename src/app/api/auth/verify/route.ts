import { NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";

const client = createPublicClient({
  chain: base,
  transport: http(),
});

export async function POST(req: Request) {
  const { address, message, signature } = await req.json();

  const valid = await client.verifyMessage({
    address,
    message,
    signature,
  });

  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // TODO:
  // - create DB user if not exists
  // - issue session / JWT
  // - attach XP, votes, quests

  return NextResponse.json({ ok: true });
}
