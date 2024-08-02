import React, { useEffect, useState } from "react";
import { getChains } from "@gitcoin/gitcoin-chain-data";
import {
  fetchIndexedBlock,
  fetchLatestBlock,
  getProgressColor,
  gtcChainsToChains,
} from "./utils";
import { ProgressData } from "./types";

// Chain data: array of objects containing chainId, name, rpcUrl, and startBlock
const chains = gtcChainsToChains(getChains());

function App() {
  const [indexerUrl, setIndexerUrl] = useState<string>(
    "https://grants-stack-indexer-v2.gitcoin.co",
  );
  const [progressData, setProgressData] = useState<ProgressData>([]);
  const [refreshInterval, setRefreshInterval] = useState<number>(10);

  // Function to update progress data
  const updateProgressData = async () => {
    const data = await Promise.all(
      chains.map(async (chain) => {
        const { blockNumber, error: rpcError } = await fetchLatestBlock(
          chain.rpcUrl,
        );

        const startBlock = chain.startBlock; // Use fromBlock from subscriptions
        const { indexedToBlock, error: indexerError } = await fetchIndexedBlock(
          chain.chainId,
          indexerUrl + "/graphql",
        );
        const percentage =
          blockNumber && indexedToBlock
            ? ((indexedToBlock - startBlock) / (blockNumber - startBlock)) * 100
            : 0;

        return {
          ...chain,
          startBlock,
          latestBlock: blockNumber,
          indexedBlock: indexedToBlock,
          percentage: percentage.toFixed(2),
          rpcError,
          indexerError,
        };
      }),
    );

    setProgressData(data);
  };

  const handleIndexerUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value.trim();
    setIndexerUrl(url.endsWith("/") ? url.slice(0, -1) : url);
  };

  const handleRpcChange = (chainId: number, newRpcUrl: string) => {
    setProgressData((prevData) =>
      prevData.map((chain) =>
        chain.chainId === chainId
          ? { ...chain, rpc: newRpcUrl, rpcError: null } // Reset RPC error and update RPC URL
          : chain,
      ),
    );
    updateProgressData(); // Refetch data with updated RPC URL
  };

  // Fetch data on initial render and when indexerUrl or refreshInterval changes
  useEffect(() => {
    updateProgressData();

    const interval = setInterval(() => {
      updateProgressData();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [indexerUrl, refreshInterval]);

  return (
    <div className="bg-gray-900 text-white min-h-screen p-4">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Indexer Chain Status</h1>
        <div className="mb-6">
          <label
            className="block text-sm font-medium mb-2"
            htmlFor="indexerUrl"
          >
            Indexer URL
          </label>
          <input
            type="text"
            id="indexerUrl"
            className="w-full p-2 bg-gray-800 border border-gray-700 rounded"
            value={indexerUrl}
            onChange={handleIndexerUrlChange}
          />
        </div>
        <div className="mt-6">
          <label
            className="block text-sm font-medium mb-2"
            htmlFor="refreshInterval"
          >
            Refresh Interval (seconds)
          </label>
          <input
            type="number"
            id="refreshInterval"
            className="w-full p-2 bg-gray-800 border border-gray-700 rounded mb-10"
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
          />
        </div>
        {progressData
          .sort((a, b) => Number(a.percentage) - Number(b.percentage))
          .map((chain) => (
            <div key={chain.chainId} className="mb-4">
              <h2 className="text-xl font-semibold">{`${chain.name} (${chain.chainId})`}</h2>
              {chain.rpcError ? (
                <div className="text-red-500 text-sm mb-1">
                  RPC Error: {chain.rpcError}
                  <button
                    className="ml-2 text-blue-400"
                    onClick={() =>
                      handleRpcChange(
                        chain.chainId,
                        prompt("Enter new RPC URL:", chain.rpcUrl) ||
                          chain.rpcUrl,
                      )
                    }
                  >
                    Update RPC
                  </button>
                </div>
              ) : (
                <div className="text-sm mb-1">
                  Start Block: {chain.startBlock}, Latest Block:{" "}
                  {chain.latestBlock}
                </div>
              )}
              {chain.indexerError ? (
                <div className="text-red-500 text-sm mb-1">
                  Indexer Error: {chain.indexerError}
                </div>
              ) : (
                <div className="text-sm mb-1">
                  Indexed Block: {chain.indexedBlock}
                </div>
              )}
              <div className="w-full bg-gray-700 rounded h-4">
                <div
                  className={`h-4 rounded ${getProgressColor(
                    chain.percentage,
                  )}`}
                  style={{ width: `${chain.percentage}%` }}
                ></div>
              </div>
              <div className="text-sm mt-1">{chain.percentage}% Indexed</div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default App;
