import { clearAuthState } from "@/redux/authSlice";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { LogOut } from 'lucide-react'; 

// Custom Modal Component for Logout
const LogoutModal = ({
  isOpen,
  onClose,
  onConfirm
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  if (!isOpen) return null;

  return ( 
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-night-black border border-gray-700 rounded-lg p-6 w-[90%] max-w-md">
        <h2 className="text-xl font-bold text-white mb-4">Confirm Logout</h2>
        <p className="text-gray-300 mb-6">Are you sure you want to logout?</p>

        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

const NavHeader = ({ pages, name, logout }: { pages: { name: string; path: string }[]; name: string, logout: boolean }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState("/");
  const dispatch = useDispatch();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Update currentPage based on location pathname
  useEffect(() => {
    const path = location.pathname;
    console.log("window.location.pathname ", path);
    setCurrentPage(path);
    console.log("currentPage ", currentPage);
    console.log("pages ", pages);
  }, [location.pathname]);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    dispatch(clearAuthState());
    navigate("/login");
    setShowLogoutModal(false);
  };

  return (
    <>
      <header className="flex justify-between items-center px-6 py-4 bg-[#121212] text-white w-full relative z-10">
        {/* Logo */}
        <div className="text-2xl font-bold font-coinbase-display hover:cursor-crosshair">
          xcode <span className="text-gray-500 text-[10px] font-coinbase-sans"> beta</span>
        </div>

        {/* Hamburger Menu for Mobile */}
        <div className="md:hidden">
          <button
            onClick={toggleMobileMenu}
            className="text-white focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}
              />
            </svg>
          </button>
        </div>

        {/* Navigation Links */}
        <div
          className={`${isMobileMenuOpen ? "flex flex-col" : "hidden"
            } md:flex md:items-center md:space-x-12 absolute md:static top-16 left-0 w-full md:w-auto bg-[#121212] md:bg-transparent p-4 md:p-0 transition-all duration-300 ease-in-out z-20 ${isMobileMenuOpen ? "block  min-h-screen" : ""
            }`}
        >
          {pages.map((page) => (
            <div
              key={page.name}
              className={`text-3xl mt-2 md:text-base font-coinbase-sans hover:text-emerald-300 ml-0 md:ml-24 hover:cursor-pointer ${currentPage === page.path ? "text-emerald-300" : ""
                } py-2 md:py-0`}
              onClick={() => {
                navigate(page.path);
                if (isMobileMenuOpen) setIsMobileMenuOpen(false); // Close menu on mobile click
              }}

            >
              {page.name}
            </div>
          ))}

          {/* Add Logout Button */}
          <button
            onClick={handleLogoutClick}
            className="flex items-center space-x-2 text-red-500 hover:text-red-400 transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
      />
    </>
  );
};

export default NavHeader;