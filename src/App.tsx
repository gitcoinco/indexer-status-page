import React, { useEffect, useState } from "react";
import { getChains } from "@gitcoin/gitcoin-chain-data";
import {
  fetchIndexedBlock,
  fetchLatestBlock,
  fetchIndexerVersion,
  gtcChainsToChains,
} from "./utils";
import { ProgressData } from "./types";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import IndexerUrlSection from "./components/IndexerUrlSection";
import RefreshIntervalSection from "./components/RefreshIntervalSection";
import ChainFilterSection from "./components/ChainFilterSection";
import ChainStatus from "./components/ChainStatus";

const chains = gtcChainsToChains(getChains());

function App() {
  const [indexerUrl, setIndexerUrl] = useState<string>(
    "https://grants-stack-indexer-v2.gitcoin.co",
  );
  const [tempIndexerUrl, setTempIndexerUrl] = useState<string>(indexerUrl);
  const [progressData, setProgressData] = useState<ProgressData>([]);
  const [refreshInterval, setRefreshInterval] = useState<number>(10);
  const [tempRefreshInterval, setTempRefreshInterval] =
    useState<number>(refreshInterval);
  const [indexerVersion, setIndexerVersion] = useState<string>("Unknown");
  const [selectedChain, setSelectedChain] = useState<string>("All");
  const [showConfig, setShowConfig] = useState<boolean>(false); // New state for showing/hiding config

  // Function to update progress data
  const updateProgressData = async () => {
    const chainsToFetch =
      selectedChain === "All"
        ? chains
        : chains.filter((chain) => chain.name === selectedChain);

    const data = await Promise.all(
      chainsToFetch.map(async (chain) => {
        const { blockNumber, error: rpcError } = await fetchLatestBlock(
          chain.rpcUrl,
        );

        const latestBlock = blockNumber ?? 0;

        const startBlock = chain.startBlock;
        const { indexedToBlock, error: indexerError } = await fetchIndexedBlock(
          chain.chainId,
          indexerUrl + "/graphql",
        );

        console.log("indexedToBlock", indexedToBlock);
        console.log("latestBlock", latestBlock);
        console.log("startBlock", startBlock);
        const percentage =
          latestBlock && indexedToBlock
            ? ((indexedToBlock - startBlock) / (latestBlock - startBlock)) * 100
            : 0;

        return {
          ...chain,
          startBlock,
          latestBlock,
          indexedBlock: indexedToBlock,
          percentage:
            percentage > 99.99 && latestBlock - indexedToBlock >= 10
              ? "99.99"
              : percentage.toFixed(2),
          rpcError,
          indexerError,
        };
      }),
    );

    setProgressData(data);
  };

  const handleIndexerUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value.trim();
    setTempIndexerUrl(url);
  };

  const handleRefreshIntervalChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setTempRefreshInterval(Number(e.target.value));
  };

  const handleUpdateIndexerUrl = () => {
    setIndexerUrl(
      tempIndexerUrl.endsWith("/")
        ? tempIndexerUrl.slice(0, -1)
        : tempIndexerUrl,
    );
  };

  const handleUpdateRefreshInterval = () => {
    setRefreshInterval(tempRefreshInterval);
  };

  const handleRpcChange = (chainId: number, newRpcUrl: string) => {
    setProgressData((prevData) =>
      prevData.map((chain) =>
        chain.chainId === chainId
          ? { ...chain, rpc: newRpcUrl, rpcError: null }
          : chain,
      ),
    );
    updateProgressData();
  };

  const handleChainFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedChain(e.target.value);
  };

  const toggleConfig = () => {
    setShowConfig((prevShowConfig) => !prevShowConfig);
  };

  useEffect(() => {
    updateProgressData();
    fetchIndexerVersion(indexerUrl).then(setIndexerVersion);

    const interval = setInterval(() => {
      updateProgressData();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [indexerUrl, refreshInterval, selectedChain]);

  return (
    <div className="bg-gray-900 text-white min-h-screen p-4">
      <ConnectButton />
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Indexer Chain Status</h1>

        <p onClick={toggleConfig} className="text-blue-400 cursor-pointer mb-4">
          {showConfig ? "Hide config ▲" : "Show config ▼"}
        </p>

        {showConfig && (
          <>
            <IndexerUrlSection
              tempIndexerUrl={tempIndexerUrl}
              onIndexerUrlChange={handleIndexerUrlChange}
              onUpdateIndexerUrl={handleUpdateIndexerUrl}
              indexerVersion={indexerVersion}
            />

            <RefreshIntervalSection
              tempRefreshInterval={tempRefreshInterval}
              onRefreshIntervalChange={handleRefreshIntervalChange}
              onUpdateRefreshInterval={handleUpdateRefreshInterval}
            />
          </>
        )}

        <ChainFilterSection
          selectedChain={selectedChain}
          onChainFilterChange={handleChainFilterChange}
          chains={chains}
        />

        <ChainStatus
          progressData={progressData}
          indexerUrl={indexerUrl}
          onRpcChange={handleRpcChange}
        />
      </div>
    </div>
  );
}

export default App;
