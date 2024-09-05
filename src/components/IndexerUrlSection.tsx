import React from "react";

interface IndexerUrlSectionProps {
  tempIndexerUrl: string;
  onIndexerUrlChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpdateIndexerUrl: () => void;
  indexerVersion: string;
}

const IndexerUrlSection: React.FC<IndexerUrlSectionProps> = ({
  tempIndexerUrl,
  onIndexerUrlChange,
  onUpdateIndexerUrl,
  indexerVersion,
}) => (
  <div className="mb-6">
    <label className="block text-sm font-medium mb-2" htmlFor="indexerUrl">
      Indexer URL
    </label>
    <div className="flex gap-2">
      <input
        type="text"
        id="indexerUrl"
        className="flex-grow p-2 bg-gray-800 border border-gray-700 rounded-l"
        value={tempIndexerUrl}
        onChange={onIndexerUrlChange}
        autoComplete="off" // Added to disable browser auto-complete
      />
      <button
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 rounded-r"
        onClick={onUpdateIndexerUrl}
      >
        Update
      </button>
    </div>
    <div className="mb-2 mt-2">
      <p>Indexer Version: {indexerVersion}</p>
    </div>
  </div>
);

export default IndexerUrlSection;
