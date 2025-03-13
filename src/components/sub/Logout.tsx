import React from "react";

const LogoutModal = ({
  isOpen,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#121212] bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-[#1D1D1D] border border-[#2C2C2C] rounded-xl p-6 w-[90%] max-w-md shadow-lg hover:border-gray-700 transition-all duration-300">
        <h2 className="text-xl font-bold text-white mb-4 font-coinbase-display">
          Confirm Logout
        </h2>
        <p className="text-gray-400 mb-6 font-coinbase-sans">
          Are you sure you want to logout?
        </p>

        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#2C2C2C] text-white rounded-md hover:bg-[#3CE7B2] hover:text-[#121212] transition-colors duration-200 font-coinbase-sans"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-[#121212] rounded-md hover:bg-red-600 transition-colors duration-200 font-coinbase-sans"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;