import Loader1 from "@/components/ui/loader1";
import React from "react";

// LoaderOverlay Component
const LoaderOverlay = ({ onCancel }: { onCancel: () => void }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-95 z-50">
    <Loader1 className="w-12 h-12 mr-10 text-[#3CE7B2]" />
    <div className="text-white text-xl opacity-80 font-coinbase-sans mt-24">
      Uploading...
    </div>
    <button
      onClick={onCancel}
      className="text-white text-sm font-coinbase-sans mt-4 underline hover:text-[#3CE7B2] transition-colors duration-200"
    >
      Cancel
    </button>
  </div>
);

export default LoaderOverlay;