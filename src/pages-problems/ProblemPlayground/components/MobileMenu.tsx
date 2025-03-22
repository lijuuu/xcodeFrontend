import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Lightbulb } from "lucide-react";
import Timer from "./Timer";
import React from "react";

interface MobileMenuProps {
  isPanelOpen: boolean;
  togglePanel: () => void;
  onShowHint: () => void;
}

const MobileMenu = ({ isPanelOpen, togglePanel, onShowHint }: MobileMenuProps) => {
  return (
    <motion.div 
      className="glass-panel border-b border-editor-border p-4 z-10"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex flex-col gap-3">
        <Timer className="self-center" />
        <div className="flex gap-2">
          <button
            onClick={togglePanel}
            className="glass-panel px-4 py-2 rounded-md flex items-center justify-center gap-2 text-white flex-1 hover:bg-editor-accent/10 focus:outline-none"
          >
            {isPanelOpen ? (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span>Hide Problem</span>
              </>
            ) : (
              <>
                <ChevronRight className="h-4 w-4" />
                <span>Show Problem</span>
              </>
            )}
          </button>
          
          <button
            onClick={onShowHint}
            className="glass-panel px-4 py-2 rounded-md flex items-center justify-center gap-2 text-white flex-1 hover:bg-editor-accent/10 focus:outline-none"
          >
            <Lightbulb className="h-4 w-4 text-editor-accent" />
            <span>Hint</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default MobileMenu;