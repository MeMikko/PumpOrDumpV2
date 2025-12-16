export interface ContractDefinition {
  name: string;
  abi: readonly unknown[];
  addressByChainId: Record<number, string>;
}

export const contracts: ContractDefinition[] = [];
