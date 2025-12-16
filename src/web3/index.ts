// src/web3/index.ts

export * from "./wagmi";

// 👇 eksplisiittiset exportit clientista
export { publicClient } from "./client";

// 👇 contractista EI enää publicClientia
export {
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
  contract,
  getActiveTokens,
  getTokenConfigSafe,
  getTokenMetadataSafe,
} from "./contract";
