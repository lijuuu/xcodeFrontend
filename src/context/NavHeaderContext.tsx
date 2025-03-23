import React,{ createContext, useContext, useState, ReactNode } from "react";

interface NavHeaderContextType {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

const NavHeaderContext = createContext<NavHeaderContextType | undefined>(undefined);

export const NavHeaderProvider = ({ children }: { children: ReactNode }) => {
  const [currentPage, setCurrentPage] = useState<string>("Home");

  return (
    <NavHeaderContext.Provider value={{ currentPage, setCurrentPage }}>
      {children}
    </NavHeaderContext.Provider>
  );
};

export const useNavHeader = (): NavHeaderContextType => {
  const context = useContext(NavHeaderContext);
  if (!context) {
    throw new Error("useNavHeader must be used within a NavHeaderProvider");
  }
  return context;
};