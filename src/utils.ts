import { TChain } from "@gitcoin/gitcoin-chain-data";
import { Chain } from "./types";

export const getProgressColor = (percentage: number) => {
  if (percentage < 10) return "bg-red-800"; // Very low progress
  if (percentage < 25) return "bg-red-600"; // Low progress
  if (percentage < 40) return "bg-orange-500"; // Slightly low progress
  if (percentage < 55) return "bg-yellow-400"; // Medium progress
  if (percentage < 70) return "bg-yellow-300"; // Slightly high progress
  if (percentage < 85) return "bg-green-300"; // High progress
  return "bg-green-500"; // Very high progress
};

export const gtcChainsToChains = (gtcChains: TChain[]): Chain[] => {
  return gtcChains
    .filter((c) => c.id !== 80001) // filter mumbai
    .map((chain) => {
      const startBlock = chain.subscriptions[0].fromBlock || 0;
      return {
        chainId: chain.id,
        name: chain.prettyName,
        rpcUrl: chain.rpc,
        startBlock,
        percentage: "0",
      };
    });
};

// Function to fetch the latest block number from an RPC URL
export async function fetchLatestBlock(
  rpcUrl: string,
): Promise<{ blockNumber: number | null; error: string | null }> {
  const requestData = {
    jsonrpc: "2.0",
    method: "eth_blockNumber",
    params: [],
    id: 1,
  };

  try {
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseData = await response.json();
    const blockNumberHex = responseData.result;
    return { blockNumber: parseInt(blockNumberHex, 16), error: null };
  } catch (error) {
    console.error("Error fetching the latest block number:", error);
    return { blockNumber: null, error: (error as Error).message };
  }
}

// Function to fetch the indexed block number from the indexer URL
export async function fetchIndexedBlock(
  chainId: number,
  indexerUrl: string,
): Promise<{ indexedToBlock: number | null; error: string | null }> {
  const query = `
    query {
      subscriptions(first: 1, filter: {chainId: {equalTo: ${chainId}}}) {
        indexedToBlock
      }
    }
  `;

  try {
    const response = await fetch(indexerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseData = await response.json();
    const indexedToBlock = responseData.data.subscriptions[0]?.indexedToBlock;
    return { indexedToBlock: indexedToBlock ?? null, error: null };
  } catch (error) {
    console.error("Error fetching the indexed block number:", error);
    return { indexedToBlock: null, error: (error as Error).message };
  }
}
