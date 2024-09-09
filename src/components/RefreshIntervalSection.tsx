import React from "react";

interface RefreshIntervalSectionProps {
  refreshInterval: number;
  tempRefreshInterval: number;
  onRefreshIntervalChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpdateRefreshInterval: () => void;
}

const RefreshIntervalSection: React.FC<RefreshIntervalSectionProps> = ({
  refreshInterval,
  tempRefreshInterval,
  onRefreshIntervalChange,
  onUpdateRefreshInterval,
}) => (
  <div className="mt-6 mb-5">
    <label className="block text-sm font-medium mb-2" htmlFor="refreshInterval">
      <b>Refresh Interval:</b> {refreshInterval} seconds
    </label>
    <div className="flex gap-2">
      <input
        type="number"
        id="refreshInterval"
        className="flex-grow p-2 bg-gray-800 border border-gray-700 rounded-l"
        value={tempRefreshInterval}
        min={1}
        onChange={onRefreshIntervalChange}
      />
      <button
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 rounded-r"
        onClick={onUpdateRefreshInterval}
      >
        Update
      </button>
    </div>
  </div>
);

export default RefreshIntervalSection;
