import { Menu, X } from "lucide-react";
import Timer from "./Timer";
import ProblemSelector from "./ProblemSelector";
import React from "react";


interface TopBarProps {
  selectedProblemId: string;
  onSelectProblem: (id: string) => void;
  isMobile: boolean;
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
}

const TopBar = ({ 
  selectedProblemId, 
  onSelectProblem, 
  isMobile, 
  isMobileMenuOpen, 
  toggleMobileMenu 
}: TopBarProps) => {
  return (
    <div className="glass-panel z-10 border-b border-editor-border px-4 py-3 flex justify-between items-center">
      <ProblemSelector 
        selectedProblemId={selectedProblemId} 
        onSelectProblem={onSelectProblem} 
      />
      
      <div className="flex items-center gap-3">
        <Timer className="hidden sm:flex" />
        
        {isMobile && (
          <button
            onClick={toggleMobileMenu}
            className="p-1.5 rounded-md bg-editor-darker text-editor-text"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        )}
      </div>
    </div>
  );
};

export default TopBar;