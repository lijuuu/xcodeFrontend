import React from "react";
import { useNavigate } from "react-router-dom";

const AuthHeader = ({ page, name }: { page: string; name: string }) => {
  const navigate = useNavigate();

  return (
    <header className="flex justify-between items-center px-6 py-4 bg-[#121212] text-white">
      <div className="text-2xl font-bold text-white font-coinbase-display hover:text-[#3CE7B2] hover:cursor-crosshair transition-colors duration-200">
        xcode
      </div>
      <button
        onClick={() => navigate(page)}
        className="text-sm text-white font-coinbase-sans hover:text-[#3CE7B2] transition-colors duration-200"
      >
        {name}
      </button>
    </header>
  );
};

export default AuthHeader;