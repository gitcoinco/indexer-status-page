// pages/reindex.tsx
import { useState } from "react";
import { useAccount } from "wagmi";
import axios from "axios";
import { signMessage } from "@wagmi/core";
import { config } from "../wagmi";
import ConfirmationModal from "../components/ConfirmationModal";

const ReIndex = (props: {
  chainId: number;
  url: string;
  onSuccess: () => void;
}) => {
  const { address } = useAccount();
  const [isSigning, setIsSigning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSignMessage = async () => {
    if (!address) {
      setErrorMessage("Wallet not connected");
      return;
    }

    try {
      setIsSigning(true);
      setErrorMessage(null);

      // Create a timestamp
      const timestamp = Date.now();

      // Construct the message
      const message = `Authenticate with timestamp: ${timestamp}`;

      // Sign the message
      const result = await signMessage(config, {
        message,
      });

      // Send the signature to your backend for verification
      const response = await axios.post(props.url, {
        chainId: props.chainId,
        address,
        timestamp,
        signature: result,
      });

      if (response.status !== 200) {
        alert("Reindexing failed");
      }
      props.onSuccess();
    } catch (error) {
      if (error instanceof Error) setErrorMessage(`Error: ${error.message}`);
    } finally {
      setIsSigning(false);
    }
  };

  const handleConfirm = () => {
    setIsModalOpen(false); // Close the modal
    handleSignMessage(); // Proceed with signing
  };

  const handleOpenModal = () => {
    setIsModalOpen(true); // Show the modal
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); // Close the modal
  };

  return (
    <div>
      <button
        className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-0 rounded"
        onClick={handleOpenModal}
        disabled={isSigning}
      >
        {isSigning ? "Signing..." : "Reindex"}
      </button>
      {errorMessage && <p>{errorMessage}</p>}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirm}
        chainId={props.chainId}
        url={props.url}
      />
    </div>
  );
};

export default ReIndex;
