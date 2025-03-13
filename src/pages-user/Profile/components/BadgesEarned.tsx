import React from "react";
const badges = [
  { id: 1, name: "Problem Solver", description: "Solved 50+ problems", icon: "https://api.dicebear.com/9.x/bottts/svg?seed=Sophia" },
  { id: 2, name: "Consistency King", description: "Active for 30 days", icon: "https://api.dicebear.com/9.x/bottts/svg?seed=Jude" },
  { id: 3, name: "Algorithm Master", description: "Mastered 10 algorithms", icon: "https://api.dicebear.com/9.x/bottts/svg?seed=Avery" },
];


const BadgesEarned = () => {
  return (
    <div className="w-full md:w-1/2 bg-[#1D1D1D] rounded-xl shadow-lg p-6 border border-gray-800 hover:border-gray-700 transition-all duration-300">
      <h3 className="text-xl font-semibold text-white mb-4 font-coinbase-display">Badges Earned</h3>
      <div className="space-y-3">
        {badges.map((badge) => (
          <div key={badge.id} className="flex items-center space-x-3 bg-[#2C2C2C] p-3 rounded-md">
            <img
              src={badge.icon}
              alt={`${badge.name} badge`}
              className="w-10 h-10 rounded-full border-2 border-[#3CE7B2]"
            />
            <div className="flex flex-col">
              <span className="text-sm text-white font-medium font-coinbase-sans">{badge.name}</span>
              <span className="text-xs text-gray-400 font-coinbase-sans">{badge.description}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BadgesEarned;
