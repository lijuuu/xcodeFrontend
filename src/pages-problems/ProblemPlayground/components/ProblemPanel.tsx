import React from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProblemDescription from "./ProblemDescription";
import { Problem } from "@/utils/problemData";

interface ProblemPanelProps {
  isPanelOpen: boolean;
  togglePanel: () => void;
  selectedProblem: Problem;
  isMobile: boolean;
}

const ProblemPanel = ({ isPanelOpen, togglePanel, selectedProblem, isMobile }: ProblemPanelProps) => {
  return (
    <motion.div 
      className={`relative h-full ${isPanelOpen ? 'md:w-[35%]' : 'w-0'}`}
      initial={{ width: isPanelOpen ? isMobile ? '100%' : '35%' : '0%' }}
      animate={{ width: isPanelOpen ? isMobile ? '100%' : '35%' : '0%' }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {isPanelOpen && (
        <div className="h-full p-4 overflow-hidden">
          <ProblemDescription problem={selectedProblem} />
        </div>
      )}
      
      <button 
        onClick={togglePanel}
        className={`absolute ${isMobile ? 'top-4 right-4' : 'top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2'} glass-panel h-8 w-8 md:h-12 md:w-6 flex items-center justify-center rounded-full z-10 text-editor-text focus:outline-none`}
      >
        {isPanelOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>
    </motion.div>
  );
};

export default ProblemPanel;