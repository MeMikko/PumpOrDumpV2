// src/web3/contract.ts
// FINAL – viem-safe ABI, no string ABI, desktop + MiniApp compatible

import type { Abi, Address } from "viem";
import { createPublicClient, http, getContract } from "viem";
import { base } from "viem/chains";

/* ───────────────── CONFIG ───────────────── */

export const CONTRACT_ADDRESS =
  "0xD5979d30D00BA78bE26EA8f0Aadd1688f6bd9e0d" as Address;

const RPC_URL =
  process.env.NEXT_PUBLIC_BASE_RPC_URL ??
  "https://base-mainnet.public.blastapi.io";

export const publicClient = createPublicClient({
  chain: base,
  transport: http(RPC_URL),
});

/* ───────────────── ABI (OBJECT ONLY) ───────────────── */

export const CONTRACT_ABI = [
  {
    type: "function",
    name: "owner",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
  {
    type: "function",
    name: "paused",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "getActiveTokens",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address[]" }],
  },
  {
    type: "function",
    name: "tokenConfigs",
    stateMutability: "view",
    inputs: [{ name: "token", type: "address" }],
    outputs: [
      { type: "bool" },
      { type: "bool" },
      { type: "uint8" },
      { type: "uint256" },
      { type: "uint256" },
    ],
  },
  {
    type: "function",
    name: "tokenMetadata",
    stateMutability: "view",
    inputs: [{ name: "token", type: "address" }],
    outputs: [
      { type: "string" },
      { type: "string" },
      { type: "string" },
    ],
  },
] as const satisfies Abi;

/* ───────────────── CONTRACT INSTANCE ───────────────── */

export const contract = getContract({
  address: CONTRACT_ADDRESS,
  abi: CONTRACT_ABI,
  client: publicClient,
});

/* ───────────────── HELPERS ───────────────── */

export async function getActiveTokens() {
  return contract.read.getActiveTokens();
}

export async function getTokenConfigSafe(token: Address) {
  try {
    const r = await contract.read.tokenConfigs([token]);
    return {
      enabled: r[0],
      allowMultiple: r[1],
      maxVotes: Number(r[2]),
      feeWei: r[3],
      xpReward: r[4],
    };
  } catch {
    return { enabled: false };
  }
}

export async function getTokenMetadataSafe(token: Address) {
  try {
    const r = await contract.read.tokenMetadata([token]);
    return {
      name: r[0] || "",
      symbol: r[1] || "",
      logoURI: r[2] || "",
    };
  } catch {
    return { name: "", symbol: "", logoURI: "" };
  }
}
