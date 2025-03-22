import { problems } from "@/utils/problemData";
import React from "react";


interface ProblemSelectorProps {
  selectedProblemId: string;
  onSelectProblem: (id: string) => void;
}

const ProblemSelector = ({ selectedProblemId, onSelectProblem }: ProblemSelectorProps) => {
  return (
    <div className="flex items-center gap-2">
      <select
        value={selectedProblemId}
        onChange={(e) => onSelectProblem(e.target.value)}
        className="bg-editor-darker text-editor-text px-3 py-1.5 rounded-md border border-editor-border focus:border-editor-accent focus:outline-none text-sm"
      >
        {problems.map((problem) => (
          <option key={problem.id} value={problem.id}>
            {problem.title} - {problem.difficulty}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ProblemSelector;