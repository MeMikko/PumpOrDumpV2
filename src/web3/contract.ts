// src/lib/contract.js
// FINAL VERSION – December 13, 2025
// All fixes included: token loading, vote, quest claim (no false InvalidInput), MiniApp compatibility, clear error messages

import { ethers } from "ethers";
import { getEthersSigner, getReadOnlyProvider } from "@/lib/getSigner";

/* ───────────────── CONFIG ───────────────── */

export const CONTRACT_ADDRESS =
  "0xD5979d30D00BA78bE26EA8f0Aadd1688f6bd9e0d";

export const provider = getReadOnlyProvider();

/* ───────────────── ABI ───────────────── */

export const ABI = [
  {"inputs":[{"internalType":"address","name":"initialOwner","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},

  {"inputs":[{"internalType":"address","name":"target","type":"address"}],"name":"AddressEmptyCode","type":"error"},
  {"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"AddressInsufficientBalance","type":"error"},
  {"inputs":[],"name":"ContractPaused","type":"error"},
  {"inputs":[],"name":"CooldownActive","type":"error"},
  {"inputs":[],"name":"FailedInnerCall","type":"error"},
  {"inputs":[],"name":"InsufficientFee","type":"error"},
  {"inputs":[],"name":"InvalidInput","type":"error"},
  {"inputs":[],"name":"MaxVotesReached","type":"error"},
  {"inputs":[],"name":"NotOwner","type":"error"},
  {"inputs":[],"name":"ReentrancyGuardReentrantCall","type":"error"},
  {"inputs":[{"internalType":"address","name":"token","type":"address"}],"name":"SafeERC20FailedOperation","type":"error"},
  {"inputs":[],"name":"TokenInactive","type":"error"},
  {"inputs":[],"name":"TransferFailed","type":"error"},
  {"inputs":[],"name":"UserBanned","type":"error"},

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
];

/* ───────────────── CONTRACT ───────────────── */

export const getContract = (signerOrProvider = provider) =>
  new ethers.Contract(CONTRACT_ADDRESS, ABI, signerOrProvider);

/* ───────────────── PLAYER ───────────────── */

export const getPlayer = async (addr) => {
  if (!addr) throw new Error("Missing address");
  const r = await getContract().getPlayer(addr);
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

const toBigInt = (v) => {
  try {
    if (typeof v === "bigint") return v;
    if (v == null) return 0n;
    return BigInt(v);
  } catch {
    return 0n;
  }
};

const toNum = (v) => (typeof v === "bigint" ? Number(v) : Number(v || 0));
const secToMs = (sec) => toNum(sec) * 1000;

/* ───────────────── REVERT PARSER ───────────────── */

const parseRevertError = (error, contract) => {
  try {
    const data = error.error?.data || error.data || error.reason;
    if (data && typeof data === "string") {
      const parsed = contract.interface.parseError(data);
      if (parsed) return parsed.name;
    }
  } catch {}
  return error.shortMessage || error.message || "Unknown contract error";
};

/* ───────────────── TOKEN HELPERS ───────────────── */

export const getTokenConfigSafe = async (token) => {
  try {
    const r = await getContract().tokenConfigs(token);
    return {
      enabled: r.enabled,
      allowMultiple: r.allowMultiple,
      maxVotes: toNum(r.maxVotes),
      feeWei: toBigInt(r.feeWei),
      xpReward: toBigInt(r.xpReward),
    };
  } catch {
    return { enabled: false, feeWei: 0n };
  }
};

/* ✅ KORJAUS: SAFE METADATA */

export const getTokenMetadataSafe = async (token) => {
  try {
    const r = await getContract().tokenMetadata(token);
    return {
      name: r?.name?.toString?.() ?? "",
      symbol: r?.symbol?.toString?.() ?? "",
      logoURI: r?.logoURI?.toString?.() ?? "",
    };
  } catch {
    return { name: "", symbol: "", logoURI: "" };
  }
};

/* ───────────────── VOTING ───────────────── */
export const voteOnChain = async (signer, token, direction, feeWei) => {
  const contract = getContract(signer);
  const fee = BigInt(feeWei || 0);

  const txOpts = {
    value: fee,
    gasLimit: 300_000n,
  };

  try {
    return await contract.vote(token, direction, txOpts);
  } catch (error) {
    throw new Error(
      error?.shortMessage ||
      error?.reason ||
      error?.message ||
      "Vote failed"
    );
  }
};


/* ───────────────── QUEST CLAIM ───────────────── */

export const claimQuestOnChain = async (signer, questId, feeWei) => {
  const contract = getContract(signer);
  const fee = toBigInt(feeWei);
  const options = fee > 0n ? { value: fee } : {};
  try {
    await contract.claimQuest.staticCall(questId, options);
    return await contract.claimQuest(questId, options);
  } catch (error) {
    throw new Error(`Claim failed: ${parseRevertError(error, contract)}`);
  }
};

export const claimQuestOnChainAuto = async (questId) => {
  const signer = await getEthersSigner();
  const q = await getContract().quests(questId);
  return claimQuestOnChain(signer, questId, q.feeWei);
};

/* ───────────────── QUEST STATUS ───────────────── */

export const canClaimQuestOnChain = async (signerOrProvider, questId) => {
  const contract = getContract(signerOrProvider);
  try {
    await contract.claimQuest.staticCall(questId);
    return { canClaim: true };
  } catch (e) {
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

export const listingCount = async () =>
  toNum(await getContract().listingCount());

export const getListing = async (id) => {
  const r = await getContract().listings(id);
  return {
    id: toNum(id),
    dev: r.dev,
    token: r.token,
    rewardRemaining: toBigInt(r.rewardRemaining),
    feePaid: toBigInt(r.feePaid),
    rewardPerWinner: toBigInt(r.rewardPerWinner),
    startTime: secToMs(r.startTime),
    endTime: secToMs(r.endTime),
    durationHours: toNum(r.durationHours),
    winnersLimit: toNum(r.winnersLimit),
    winnersClaimed: toNum(r.winnersClaimed),
    status: toNum(r.status),
  };
};

const cache = new Map();
const TTL = 15000;

const cached = async (k, fn) => {
  const hit = cache.get(k);
  if (hit && Date.now() - hit.t < TTL) return hit.v;
  const v = await fn();
  cache.set(k, { v, t: Date.now() });
  return v;
};

export const getActiveTokensCached = () =>
  cached("tokens", () => getContract().getActiveTokens());

export const getTokenConfigCached = (t) =>
  cached(`cfg:${t}`, () => getTokenConfigSafe(t));

export const getTokenMetadataCached = (t) =>
  cached(`meta:${t}`, () => getTokenMetadataSafe(t));
