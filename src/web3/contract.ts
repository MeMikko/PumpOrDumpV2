// src/web3/contract.ts
// FINAL VERSION – ABI-safe for viem + wagmi + Farcaster
// Fixes: token loading, desktop connect, MiniApp crash, ABI parsing

import type { Abi, Address, Hash } from "viem";
import {
  createPublicClient,
  http,
  getContract as viemGetContract,
  parseAbi,
} from "viem";
import { base } from "viem/chains";
import {
  getWalletClient,
  simulateContract,
  writeContract,
} from "@wagmi/core";

import { wagmiConfig } from "@/web3/wagmi";

/* ───────────────── CONFIG ───────────────── */

export const CONTRACT_ADDRESS =
  "0xD5979d30D00BA78bE26EA8f0Aadd1688f6bd9e0d" as Address;

const RPC_URL =
  process.env.NEXT_PUBLIC_BASE_RPC_URL ??
  "https://base-mainnet.public.blastapi.io";

const publicClient = createPublicClient({
  chain: base,
  transport: http(RPC_URL),
});

/* ───────────────── LEGACY PROVIDER ───────────────── */

function getReadOnlyProvider() {
  return {
    async getBlock(tag: "latest" | bigint | number) {
      if (tag === "latest") {
        return publicClient.getBlock({ blockTag: "latest" });
      }
      const blockNumber = typeof tag === "bigint" ? tag : BigInt(tag);
      return publicClient.getBlock({ blockNumber });
    },

    async getTransactionReceipt(hash: Hash) {
      return publicClient.getTransactionReceipt({ hash });
    },
  };
}

export const provider = getReadOnlyProvider();

/* ───────────────── ABI (UNCHANGED CONTENT) ───────────────── */

const RAW_ABI = [
  { inputs: [{ internalType: "address", name: "initialOwner", type: "address" }], stateMutability: "nonpayable", type: "constructor" },

  { inputs: [{ internalType: "address", name: "target", type: "address" }], name: "AddressEmptyCode", type: "error" },
  { inputs: [{ internalType: "address", name: "account", type: "address" }], name: "AddressInsufficientBalance", type: "error" },
  { inputs: [], name: "ContractPaused", type: "error" },
  { inputs: [], name: "CooldownActive", type: "error" },
  { inputs: [], name: "FailedInnerCall", type: "error" },
  { inputs: [], name: "InsufficientFee", type: "error" },
  { inputs: [], name: "InvalidInput", type: "error" },
  { inputs: [], name: "MaxVotesReached", type: "error" },
  { inputs: [], name: "NotOwner", type: "error" },
  { inputs: [], name: "ReentrancyGuardReentrantCall", type: "error" },
  { inputs: [{ internalType: "address", name: "token", type: "address" }], name: "SafeERC20FailedOperation", type: "error" },
  { inputs: [], name: "TokenInactive", type: "error" },
  { inputs: [], name: "TransferFailed", type: "error" },
  { inputs: [], name: "UserBanned", type: "error" },

  // ⛔️ nämä STRING-ABI:t aiheuttivat kaatumisen
  "function owner() view returns (address)",
  "function paused() view returns (bool)",
  "function CONTRACT_VERSION() view returns (string)",
  "function VOTE_COOLDOWN() view returns (uint64)",
  "function seasonId() view returns (uint256)",
  "function getActiveTokens() view returns (address[])",
  "function tokenConfigs(address) view returns (bool,bool,uint8,uint256,uint256)",
  "function tokenMetadata(address) view returns (string,string,string)",
  "function vote(address,uint8) payable",
  "function listingCount() view returns (uint256)",
];

/* ✅ TÄRKEIN KORJAUS */
export const CONTRACT_ABI = parseAbi(
  RAW_ABI.map((item) => item.toString())
) as Abi;

/* ───────────────── CONTRACT ───────────────── */

export const getContract = () =>
  viemGetContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    client: { public: publicClient },
  });

/* ───────────────── TOKEN HELPERS ───────────────── */

export const getTokenConfigSafe = async (token: string) => {
  try {
    const c = getContract();
    const r = (await c.read.tokenConfigs([token as Address])) as any;
    return {
      enabled: r[0],
      allowMultiple: r[1],
      maxVotes: Number(r[2]),
      feeWei: BigInt(r[3]),
      xpReward: BigInt(r[4]),
    };
  } catch {
    return { enabled: false };
  }
};

export const getTokenMetadataSafe = async (token: string) => {
  try {
    const c = getContract();
    const r = (await c.read.tokenMetadata([token as Address])) as any;
    return {
      name: r[0] ?? "",
      symbol: r[1] ?? "",
      logoURI: r[2] ?? "",
    };
  } catch {
    return { name: "", symbol: "", logoURI: "" };
  }
};
