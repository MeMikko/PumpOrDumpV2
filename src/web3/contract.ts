// src/web3/contract.ts
// FINAL – full ABI, viem-safe, desktop + MiniApp compatible

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

/* ───────────────── ABI (FULL, OBJECT ONLY) ───────────────── */

export const CONTRACT_ABI = [
  /* ===== CORE ===== */
  { type: "function", name: "owner", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "paused", stateMutability: "view", inputs: [], outputs: [{ type: "bool" }] },
  { type: "function", name: "CONTRACT_VERSION", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { type: "function", name: "VOTE_COOLDOWN", stateMutability: "view", inputs: [], outputs: [{ type: "uint64" }] },
  { type: "function", name: "seasonId", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },

  /* ===== TOKENS ===== */
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
      { type: "bool" },     // enabled
      { type: "bool" },     // allowMultiple
      { type: "uint8" },    // maxVotes
      { type: "uint256" },  // feeWei
      { type: "uint256" },  // xpReward
    ],
  },
  {
    type: "function",
    name: "tokenMetadata",
    stateMutability: "view",
    inputs: [{ name: "token", type: "address" }],
    outputs: [
      { type: "string" }, // name
      { type: "string" }, // symbol
      { type: "string" }, // logoURI
    ],
  },
  {
    type: "function",
    name: "tokenStats",
    stateMutability: "view",
    inputs: [{ name: "token", type: "address" }],
    outputs: [
      { type: "uint256" }, // pump
      { type: "uint256" }, // dump
    ],
  },

  /* ===== VOTING ===== */
  {
    type: "function",
    name: "lastVoteTime",
    stateMutability: "view",
    inputs: [
      { name: "user", type: "address" },
      { name: "token", type: "address" },
    ],
    outputs: [{ type: "uint64" }],
  },
  {
    type: "function",
    name: "lastVote",
    stateMutability: "view",
    inputs: [
      { name: "user", type: "address" },
      { name: "token", type: "address" },
    ],
    outputs: [{ type: "uint8" }],
  },

  /* ===== LISTINGS ===== */
  {
    type: "function",
    name: "listingCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
] as const satisfies Abi;

/* ───────────────── CONTRACT INSTANCE ───────────────── */

export const contract = getContract({
  address: CONTRACT_ADDRESS,
  abi: CONTRACT_ABI,
  client: publicClient,
});

/* ───────────────── SAFE HELPERS ───────────────── */

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

export async function getTokenStatsSafe(token: Address) {
  try {
    const r = await contract.read.tokenStats([token]);
    return { pump: r[0], dump: r[1] };
  } catch {
    return { pump: 0n, dump: 0n };
  }
}

export async function getLastVoteTimeSafe(
  user: Address,
  token: Address
) {
  try {
    return await contract.read.lastVoteTime([user, token]);
  } catch {
    return 0n;
  }
}
