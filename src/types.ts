export type Chain = {
  chainId: number;
  name: string;
  rpcUrl: string;
  startBlock: number;
  latestBlock?: number | null;
  indexedBlock?: number | null;
  percentage: string;
  rpcError?: string | null;
  indexerError?: string | null;
};

export type ProgressData = Chain[];
