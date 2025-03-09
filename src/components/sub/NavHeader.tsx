import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const NavHeader = ({ pages, name }: { pages: { name: string; path: string }[]; name: string }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState("/");

  // Update currentPage based on location pathname
  useEffect(() => {
    const path = location.pathname;
    console.log("window.location.pathname ", path);
    setCurrentPage(path);
    console.log("currentPage ", currentPage);
    console.log("pages ", pages);
  }, [location.pathname]); // Depend on location.pathname to update on route change

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="flex justify-between items-center px-6 py-4 bg-night-black text-white w-full relative z-10">
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
        className={`${
          isMobileMenuOpen ? "flex flex-col" : "hidden"
        } md:flex md:items-center md:space-x-24 absolute md:static top-16 left-0 w-full md:w-auto bg-night-black md:bg-transparent p-4 md:p-0 transition-all duration-300 ease-in-out z-20 ${
          isMobileMenuOpen ? "block  min-h-screen" : ""
        }`}
      >
        {pages.map((page) => (
          <div
            key={page.name}
            className={`text-3xl mt-2 md:text-base font-coinbase-sans hover:text-blue-600 ml-0 md:ml-24 hover:cursor-pointer ${
              currentPage === page.path ? "text-blue-600" : ""
            } py-2 md:py-0`}
            onClick={() => {
              navigate(page.path);
              if (isMobileMenuOpen) setIsMobileMenuOpen(false); // Close menu on mobile click
            }}
          >
            {page.name}
          </div>
        ))}
      </div>
    </header>
  );
};

export default NavHeader;