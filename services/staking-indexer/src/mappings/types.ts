export type ExtrinsicPrimitive = {
  callIndex: string;
  args: any;
};

// Versioned bundle header can be wrapped in Rust-like enums { V0: {...} }
// Keep a permissive type to avoid runtime crashes when shapes vary
export interface SealedBundleHeader {
  header?: BundleHeader;
  [k: string]: any;
}

interface BundleHeader {
  proofOfElection: ProofOfElection;
  receipt: ExecutionReceipt;
}

interface ProofOfElection {
  domainId: number;
  operatorId: bigint;
}

export interface ExecutionReceipt {
  domainBlockNumber?: number;
  consensusBlockNumber?: number;
}

export interface EpochTransition {
  domainId: string;
  parentEpoch: number;
  currentEpoch: number;
  parentSummary: any;
}
