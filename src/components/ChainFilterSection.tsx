import React from "react";

interface ChainFilterSectionProps {
  selectedChain: string;
  onChainFilterChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  chains: { name: string; chainId: number }[];
}

const ChainFilterSection: React.FC<ChainFilterSectionProps> = ({
  selectedChain,
  onChainFilterChange,
  chains,
}) => {
  // Sort chains by name
  const sortedChains = [...chains].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium mb-2" htmlFor="chainFilter">
        Filter by Chain
      </label>
      <select
        id="chainFilter"
        className="p-2 bg-gray-800 border border-gray-700 rounded"
        value={selectedChain}
        onChange={onChainFilterChange}
      >
        <option value="All">All</option>
        {sortedChains.map((chain) => (
          <option key={chain.chainId} value={chain.name}>
            {chain.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ChainFilterSection;
