import React, { useState } from "react";
import ReIndex from "./ReIndex";
import { getProgressColor } from "../utils";
import { ProgressData } from "../types";
import { useAccount } from "wagmi";

interface ChainStatusProps {
  progressData: ProgressData;
  indexerUrl: string;
  onRpcChange: (chainId: number, newRpcUrl: string) => void;
}

const ChainStatus: React.FC<ChainStatusProps> = ({
  progressData,
  indexerUrl,
  onRpcChange,
}) => {
  const { address } = useAccount();

  const [sortOption, setSortOption] = useState<
    "name" | "chainId" | "missingBlocks" | "indexingStatus"
  >("missingBlocks");
  const [reverse, setReverse] = useState(true);

  const handleSortOptionChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const value = event.target.value as
      | "name"
      | "chainId"
      | "missingBlocks"
      | "indexingStatus";
    setSortOption(value);
  };

  const handleReverseChange = () => {
    setReverse((prevReverse) => !prevReverse);
  };

  const sortedData = [...progressData].sort((a, b) => {
    let compareResult = 0;

    if (sortOption === "name") {
      compareResult = a.name.localeCompare(b.name);
    } else if (sortOption === "chainId") {
      compareResult = a.chainId - b.chainId;
    } else if (sortOption === "missingBlocks") {
      const missingBlocksA =
        a.latestBlock && a.indexedBlock
          ? a.latestBlock - a.indexedBlock
          : Infinity;
      const missingBlocksB =
        b.latestBlock && b.indexedBlock
          ? b.latestBlock - b.indexedBlock
          : Infinity;
      compareResult = missingBlocksA - missingBlocksB;
    } else if (sortOption === "indexingStatus") {
      compareResult = Number(a.percentage) - Number(b.percentage);
    }

    return reverse ? -compareResult : compareResult;
  });

  return (
    <>
      <div className="mb-4">
        <label htmlFor="sortOption" className="block text-sm font-medium mb-2">
          Sort By
        </label>
        <select
          id="sortOption"
          value={sortOption}
          onChange={handleSortOptionChange}
          className="p-2 bg-gray-800 border border-gray-700 rounded"
        >
          <option value="name">Name</option>
          <option value="chainId">Chain ID</option>
          <option value="missingBlocks">Missing Blocks</option>
          <option value="indexingStatus">Indexing Status</option>
        </select>

        <button
          onClick={handleReverseChange}
          className="ml-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded mb-2"
        >
          {reverse ? "Sort Ascending" : "Sort Descending"}
        </button>
      </div>

      {sortedData.map((chain) => (
        <div key={chain.chainId} className="mb-4">
          <h2 className="text-xl font-semibold">{`${chain.name} (${chain.chainId})`}</h2>
          {chain.rpcError ? (
            <div className="text-red-500 text-sm mb-1">
              RPC Error: {chain.rpcError}
              <button
                className="ml-2 text-blue-400"
                onClick={() =>
                  onRpcChange(
                    chain.chainId,
                    prompt("Enter new RPC URL:", chain.rpcUrl) || chain.rpcUrl,
                  )
                }
              >
                Update RPC
              </button>
            </div>
          ) : (
            <div className="text-sm mb-1">
              Start Block: {chain.startBlock}, Latest Block: {chain.latestBlock}
              , Missing:{" "}
              {chain.latestBlock &&
              chain.indexedBlock &&
              chain.indexedBlock !== Infinity
                ? Math.max(chain.latestBlock - chain.indexedBlock, 0)
                : "undefined"}
            </div>
          )}
          {chain.indexerError ? (
            <div className="text-red-500 text-sm mb-1">
              Indexer Error: {chain.indexerError}
            </div>
          ) : (
            <div className="flex items-center space-x-4 mb-2">
              <div className="text-sm">
                Indexed Block:{" "}
                {chain.indexedBlock === Infinity ? 0 : chain.indexedBlock}
              </div>
              {address && (
                <ReIndex chainId={chain.chainId} url={`${indexerUrl}/index`} />
              )}
            </div>
          )}
          <div className="w-full bg-gray-700 rounded h-4">
            <div
              className={`h-4 rounded ${getProgressColor(
                Number(chain.percentage === "Infinity" ? 0 : chain.percentage),
              )}`}
              style={{ width: `${chain.percentage}%` }}
            ></div>
          </div>
          <div className="text-sm mt-1">
            {chain.percentage === "Infinity" ? 0 : chain.percentage}% Indexed
          </div>
        </div>
      ))}
    </>
  );
};

export default ChainStatus;
