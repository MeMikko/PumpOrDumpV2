// src/web3/contract.ts
// FINAL VERSION – December 13, 2025
// All fixes included: token loading, vote, quest claim (no false InvalidInput), MiniApp compatibility, clear error messages

/* ───────────────── CONFIG ───────────────── */

import type { Abi, Address, Hash } from "viem";
import { createPublicClient, http, getContract as viemGetContract } from "viem";
import { base } from "viem/chains";
import {
  getWalletClient,
  simulateContract,
  writeContract,
  waitForTransactionReceipt,
} from "@wagmi/core";

import { wagmiConfig } from "@/web3/wagmi"; // ✅ muuta polku jos sinulla eri

export const CONTRACT_ADDRESS =
  "0xD5979d30D00BA78bE26EA8f0Aadd1688f6bd9e0d" as Address;

/**
 * Read-only RPC URL (Base)
 * Käyttää env: NEXT_PUBLIC_BASE_RPC_URL jos olemassa, muuten Base public.
 */
const RPC_URL =
  process.env.NEXT_PUBLIC_BASE_RPC_URL ||
  "https://base-mainnet.public.blastapi.io";

/**
 * viem public client (read-only)
 */
const publicClient = createPublicClient({
  chain: base,
  transport: http(RPC_URL),
});

/**
 * Ethers-tyylinen provider-wrapper, jotta vanhat kutsut (provider.getBlock) eivät hajoa.
 * ÄLÄ poista: vanha frontend-logiikka luottaa tähän.
 */
function getReadOnlyProvider() {
  return {
    /**
     * Vanha koodi kutsuu provider.getBlock("latest")
     */
    async getBlock(tag: "latest" | bigint | number) {
  if (tag === "latest") {
    return publicClient.getBlock({ blockTag: "latest" });
  }

  const blockNumber =
    typeof tag === "bigint" ? tag : BigInt(tag);

  return publicClient.getBlock({ blockNumber });
}

    /**
     * Vanha waitForReceipt tms saattaa käyttää tätä
     */
    async getTransactionReceipt(hash: Hash) {
      return await publicClient.getTransactionReceipt({ hash });
    },
  };
}

export const provider = getReadOnlyProvider();

/* ───────────────── ABI ───────────────── */

export const ABI = [
  {
    inputs: [{ internalType: "address", name: "initialOwner", type: "address" }],
    stateMutability: "nonpayable",
    type: "constructor",
  },

  {
    inputs: [{ internalType: "address", name: "target", type: "address" }],
    name: "AddressEmptyCode",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "AddressInsufficientBalance",
    type: "error",
  },
  { inputs: [], name: "ContractPaused", type: "error" },
  { inputs: [], name: "CooldownActive", type: "error" },
  { inputs: [], name: "FailedInnerCall", type: "error" },
  { inputs: [], name: "InsufficientFee", type: "error" },
  { inputs: [], name: "InvalidInput", type: "error" },
  { inputs: [], name: "MaxVotesReached", type: "error" },
  { inputs: [], name: "NotOwner", type: "error" },
  { inputs: [], name: "ReentrancyGuardReentrantCall", type: "error" },
  {
    inputs: [{ internalType: "address", name: "token", type: "address" }],
    name: "SafeERC20FailedOperation",
    type: "error",
  },
  { inputs: [], name: "TokenInactive", type: "error" },
  { inputs: [], name: "TransferFailed", type: "error" },
  { inputs: [], name: "UserBanned", type: "error" },

  "function owner() view returns (address)",
  "function paused() view returns (bool)",
  "function CONTRACT_VERSION() view returns (string)",
  "function VOTE_COOLDOWN() view returns (uint64)",
  "function transferOwnership(address newOwner)",
  "function pause()",
  "function unpause()",
  "function banUser(address user, bool banned_)",

  "function seasonId() view returns (uint256)",
  "function seasonName(uint256) view returns (string)",
  "function seasonXp(uint256, address) view returns (uint256)",
  "function startNewSeason(string name_)",
  "function listingFeePerHourWei() view returns (uint256)",
  "function setListingFeePerHour(uint256 feeWei)",
  "function correctVoteXp() view returns (uint256)",
  "function setCorrectVoteXpReward(uint256 xp)",

  "function getPlayer(address user) view returns (uint256, uint256, uint32, uint32, uint32, uint32)",
  "function players(address) view returns (uint256 lifetimeXp, uint64 lastActiveDay, uint32 loginStreak, uint32 bestStreak, uint32 totalQuests, uint32 totalVotes, bool banned)",

  "function getActiveTokens() view returns (address[])",
  "function activeTokens(uint256) view returns (address)",
  "function tokenConfigs(address) view returns (bool enabled, bool allowMultiple, uint8 maxVotes, uint256 feeWei, uint256 xpReward)",
  "function tokenStats(address) view returns (uint256 pump, uint256 dump)",
  "function tokenMetadata(address) view returns (string name, string symbol, string logoURI)",

  "function setToken(address token, bool enabled, bool allowMultiple, uint8 maxVotes, uint256 feeWei, uint256 xpReward)",
  "function setTokenMetadata(address token, string name_, string symbol_, string logoURI_)",
  "function setTokenFull(address token, bool enabled, bool allowMultiple, uint8 maxVotes, uint256 feeWei, uint256 xpReward, string name_, string symbol_, string logoURI_)",

  "function vote(address token, uint8 dir) payable",
  "function lastVoteTime(address, address) view returns (uint64)",

  "function getActiveQuests() view returns (uint256[])",
  "function activeQuestIds(uint256) view returns (uint256)",
  "function quests(uint256) view returns (bool active, uint8 repeatType, uint8 questKind, uint32 maxClaimsPerDay, uint256 feeWei, uint256 xpReward, uint256 tokenReward, address rewardToken, address targetToken)",
  "function questName(uint256) view returns (string)",
  "function claimQuest(uint256 id) payable",
  "function setQuest(uint256 id, string name_, bool active, uint8 r, uint8 k, uint32 maxClaimsPerDay, uint256 feeWei, uint256 xpReward, address rewardToken, uint256 tokenReward, address targetToken)",

  "function snapshotCount() view returns (uint256)",
  "function getSnapshot(uint256 id) view returns (address user, address token, uint8 direction, uint64 timestamp, bool rewarded, bool correct)",
  "function claimPredictionXp(uint256 snapshotId)",

  "function listingCount() view returns (uint256)",
  "function listings(uint256) view returns (address dev, address token, uint256 rewardRemaining, uint256 feePaid, uint256 rewardPerWinner, uint64 startTime, uint64 endTime, uint64 durationHours, uint32 winnersLimit, uint32 winnersClaimed, uint8 status)",

  "event Voted(address indexed token, address indexed user, uint8 dir, uint256 xpEarned)",
  "event SnapshotCreated(uint256 indexed id, address indexed token, address indexed user, uint8 direction, uint64 timestamp)",
] as const;

/**
 * ✅ Tämä export puuttui ja aiheutti build-errorin:
 * "CONTRACT_ABI is not exported"
 */
export const CONTRACT_ABI = ABI as unknown as Abi;

/* ───────────────── CONTRACT ───────────────── */

/**
 * Vanha getContract palautti ethers.Contract.
 * Nyt palautetaan viem-contract, mutta pidetään nimi ja signature jotta muu koodi ei hajoa.
 */
export const getContract = (signerOrProvider: any = provider) => {
  // Read-only: käytetään publicClientia
  // Write: käytetään wagmi walletClientia myöhemmin vote/claim-funktioissa
  return viemGetContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    client: {
      public: publicClient,
    },
  });
};

/* ───────────────── PLAYER ───────────────── */

export const getPlayer = async (addr: string) => {
  if (!addr) throw new Error("Missing address");
  const contract = getContract();

  // viem read
  const r = (await contract.read.getPlayer([addr as Address])) as any;

  return {
    xp: Number(r[0]),
    level: Number(r[1]),
    streak: Number(r[2]),
    bestStreak: Number(r[3]),
    totalQuests: Number(r[4]),
    totalVotes: Number(r[5]),
  };
};

/* ───────────────── HELPERS ───────────────── */

const toBigInt = (v: any) => {
  try {
    if (typeof v === "bigint") return v;
    if (v == null) return 0n;
    return BigInt(v);
  } catch {
    return 0n;
  }
};

const toNum = (v: any) => (typeof v === "bigint" ? Number(v) : Number(v || 0));
const secToMs = (sec: any) => toNum(sec) * 1000;

/* ───────────────── REVERT PARSER ───────────────── */

const parseRevertError = (error: any) => {
  return (
    error?.shortMessage ||
    error?.details ||
    error?.message ||
    "Unknown contract error"
  );
};

/* ───────────────── TOKEN HELPERS ───────────────── */

export const getTokenConfigSafe = async (token: string) => {
  try {
    const contract = getContract();
    const r = (await contract.read.tokenConfigs([token as Address])) as any;

    return {
      enabled: r[0],
      allowMultiple: r[1],
      maxVotes: toNum(r[2]),
      feeWei: toBigInt(r[3]),
      xpReward: toBigInt(r[4]),
    };
  } catch {
    return { enabled: false, feeWei: 0n };
  }
};

/* ✅ KORJAUS: SAFE METADATA */

export const getTokenMetadataSafe = async (token: string) => {
  try {
    const contract = getContract();
    const r = (await contract.read.tokenMetadata([token as Address])) as any;

    return {
      name: r?.[0]?.toString?.() ?? "",
      symbol: r?.[1]?.toString?.() ?? "",
      logoURI: r?.[2]?.toString?.() ?? "",
    };
  } catch {
    return { name: "", symbol: "", logoURI: "" };
  }
};

/* ───────────────── VOTING ───────────────── */

export const voteOnChain = async (
  signer: any, // pidetään parametri ettei vanha kutsu hajoa
  token: string,
  direction: number,
  feeWei: any
) => {
  const fee = BigInt(feeWei || 0);

  try {
    // WalletClient wagmista (MiniApp + Desktop)
    const walletClient = await getWalletClient(wagmiConfig);
    if (!walletClient) throw new Error("No wallet client");

    // Simuloi ensin (revertit näkyy oikein)
    await simulateContract(wagmiConfig, {
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "vote",
      args: [token as Address, direction],
      value: fee,
      chainId: base.id,
    });

    // Lähetä tx
    const hash = await writeContract(wagmiConfig, {
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "vote",
      args: [token as Address, direction],
      value: fee,
      chainId: base.id,
    });

    // Palautetaan ethers-tyylinen { hash } jotta vanha wait/poll toimii
    return { hash };
  } catch (error: any) {
    throw new Error(
      error?.shortMessage || error?.message || "Vote failed"
    );
  }
};

/* ───────────────── QUEST CLAIM ───────────────── */

export const claimQuestOnChain = async (
  signer: any, // pidetään parametri
  questId: number,
  feeWei: any
) => {
  const fee = toBigInt(feeWei);
  const value = fee > 0n ? fee : 0n;

  try {
    // simulate (vastaa vanhaa staticCall-ideaa)
    await simulateContract(wagmiConfig, {
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "claimQuest",
      args: [BigInt(questId)],
      value,
      chainId: base.id,
    });

    const hash = await writeContract(wagmiConfig, {
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "claimQuest",
      args: [BigInt(questId)],
      value,
      chainId: base.id,
    });

    return { hash };
  } catch (error: any) {
    throw new Error(`Claim failed: ${parseRevertError(error)}`);
  }
};

export const claimQuestOnChainAuto = async (questId: number) => {
  // pidetään funktio olemassa (älä poista)
  const contract = getContract();
  const q = (await contract.read.quests([BigInt(questId)])) as any;
  return claimQuestOnChain(null, questId, q?.[4]); // feeWei index tässä ABI:ssa
};

/* ───────────────── QUEST STATUS ───────────────── */

export const canClaimQuestOnChain = async (signerOrProvider: any, questId: number) => {
  try {
    await simulateContract(wagmiConfig, {
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "claimQuest",
      args: [BigInt(questId)],
      chainId: base.id,
    });
    return { canClaim: true };
  } catch (e: any) {
    return { canClaim: false, reason: e?.shortMessage || e?.message };
  }
};

/* ───────────────── DAILY RESET ───────────────── */

export const getNextDailyResetMs = async () => {
  const block = await provider.getBlock("latest");
  const day = Math.floor(Number(block.timestamp) / 86400);
  return (day + 1) * 86400 * 1000;
};

/* ───────────────── LISTINGS & CACHE ───────────────── */

export const listingCount = async () => {
  const contract = getContract();
  const r = (await contract.read.listingCount()) as any;
  return toNum(r);
};

export const getListing = async (id: any) => {
  const contract = getContract();
  const r = (await contract.read.listings([BigInt(id)])) as any;

  return {
    id: toNum(id),
    dev: r[0],
    token: r[1],
    rewardRemaining: toBigInt(r[2]),
    feePaid: toBigInt(r[3]),
    rewardPerWinner: toBigInt(r[4]),
    startTime: secToMs(r[5]),
    endTime: secToMs(r[6]),
    durationHours: toNum(r[7]),
    winnersLimit: toNum(r[8]),
    winnersClaimed: toNum(r[9]),
    status: toNum(r[10]),
  };
};

const cache = new Map<string, { v: any; t: number }>();
const TTL = 15000;

const cached = async (k: string, fn: () => Promise<any>) => {
  const hit = cache.get(k);
  if (hit && Date.now() - hit.t < TTL) return hit.v;
  const v = await fn();
  cache.set(k, { v, t: Date.now() });
  return v;
};

export const getActiveTokensCached = () =>
  cached("tokens", async () => {
    const contract = getContract();
    return await contract.read.getActiveTokens();
  });

export const getTokenConfigCached = (t: string) =>
  cached(`cfg:${t}`, () => getTokenConfigSafe(t));

export const getTokenMetadataCached = (t: string) =>
  cached(`meta:${t}`, () => getTokenMetadataSafe(t));
