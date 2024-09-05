// components/ConfirmationModal.tsx
import React from "react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  chainId: number;
  url: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  chainId,
  url,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-700 bg-opacity-50">
      <div className="bg-gray-500 p-6 rounded shadow-lg">
        <h2 className="text-lg font-semibold">Confirm Reindex</h2>
        <p>Are you sure you want to reindex for chain ID {chainId}?</p>
        <p>URL: {url}</p>
        <div className="mt-4 flex justify-end">
          <button
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded mr-2"
            onClick={onConfirm}
          >
            Confirm
          </button>
          <button
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
