import { clearAuthState } from "@/redux/authSlice";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import LogoutModal from "./Logout";
import { LogOutIcon } from "lucide-react";
import { toast } from "sonner";
import Cookies from "js-cookie";

const defaultPages = [
  { name: "Home", path: "/home" },
  { name: "Profile", path: "/" },
  { name: "Problems", path: "/problemset" },
  { name: "Compiler", path: "/compiler" },
  { name: "Leaderboard", path: "/leaderboard" },
  { name: "Chat", path: "/chat" },
  { name: "Settings", path: "/settings" },
];


const NavHeader = ({ pages = defaultPages, name, logout, className }: {
  pages?: { name: string; path: string }[];
  name: string;
  logout: boolean;
  className?: string;
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<{ name: string; path: string }>({ name: "Unknown", path: "/" });
  const dispatch = useDispatch();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const currentPage = defaultPages.find(({ path }) => location.pathname.toLowerCase().includes(path));
    setCurrentPage(currentPage || { name: "Unknown", path: location.pathname });
  }, [location.pathname]);


  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    try {
      // Clear cookies
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');

      // Clear redux state
      dispatch(clearAuthState());

      // Show success message
      toast.success('Logged out successfully');

      // Navigate to login
      navigate("/login");
    } catch (error) {
      toast.error('Failed to logout');
      console.error('Logout error:', error);
    } finally {
      setShowLogoutModal(false);
    }
  };

  return (
    <>
      <header className="flex justify-between items-center px-4 py-2 bg-[#121212] text-white w-full relative z-10 ">
        {/* Logo */}
        <div className="text-xl font-bold font-coinbase-display hover:text-[#3CE7B2] hover:cursor-crosshair transition-colors duration-200">
          xcode{" "}
          <span className="text-gray-400 text-[8px] font-coinbase-sans">beta</span>
        </div>

        {/* Hamburger Menu for Mobile */}
        <div className="md:hidden">
          <button
            onClick={toggleMobileMenu}
            className="text-white focus:outline-none hover:text-[#3CE7B2] transition-colors duration-200"
            aria-label="Toggle menu"
          >
            <svg
              className="w-5 h-5"
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
            } md:flex md:items-center md:space-x-8 absolute md:static top-12 left-0 w-full md:w-auto bg-[#121212] md:bg-transparent p-4 md:p-0 transition-all duration-300 ease-in-out z-20 ${isMobileMenuOpen ? "block min-h-screen" : ""
            }`}
        >
          {pages.map((page) => (
            <div
              key={page.name}
              className={`text-xl md:text-sm font-coinbase-sans hover:text-[#3CE7B2] ml-0 md:ml-16 hover:cursor-pointer ${currentPage.path === page.path ? "text-[#3CE7B2]" : "text-white"
                } py-2 md:py-0 transition-colors duration-200`}
              onClick={() => {
                navigate(page.path);
                if (isMobileMenuOpen) setIsMobileMenuOpen(false);
              }}
            >
              {page.name}
            </div>
          ))}

          {/* Logout Button */}
          <div
            className="text-xl md:text-sm font-coinbase-sans hover:text-[#3CE7B2] ml-0 md:ml-16 hover:cursor-pointer text-white py-2 md:py-0 transition-colors duration-200 flex items-center gap-2"
            onClick={handleLogoutClick}
          >
            <LogOutIcon className="w-4 h-4" />
            <span>Logout</span>
          </div>
        </div>
      </header>

      {/* Logout Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
      />
    </>
  );
};

export default NavHeader;