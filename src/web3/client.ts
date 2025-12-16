import { createPublicClient, createWalletClient, http } from "viem";
import { base } from "viem/chains";

const RPC_URL =
  process.env.NEXT_PUBLIC_BASE_RPC_URL ??
  "https://base-mainnet.public.blastapi.io";

export const publicClient = createPublicClient({
  chain: base,
  transport: http(RPC_URL),
});

/**
 * Wallet client luodaan wagmin kautta runtime-tilanteessa,
 * ei täällä. Tämä on tarkoituksella tyhjä wrapper.
 */
export function getWalletClient(provider: any) {
  return createWalletClient({
    chain: base,
    transport: http(RPC_URL),
    account: provider?.account,
  });
}
