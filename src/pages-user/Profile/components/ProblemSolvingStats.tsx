import { Pie, PieChart, Cell } from "recharts";
import React from "react";

// Dashboard stats data
const stats = {
  solved: 86,
  total: 150,
  attempting: 15,
  easy: { solved: 74, total: 80 },
  medium: { solved: 12, total: 50 },
  hard: { solved: 0, total: 20 },
};

// Circular progress data for PieChart
const progressData = [
  { name: "Solved", value: stats.solved, color: "#3CE7B2" }, // Turquoise from reference image
  { name: "Attempting", value: stats.attempting, color: "#60a5fa" }, // Blue highlight
  { name: "Remaining", value: stats.total - stats.solved - stats.attempting, color: "#2c2c2c" }, // Dark gray
];

// Difficulty breakdown data
const difficultyData = [
  { label: "Easy", primaryColor: "text-emerald-400", solved: stats.easy.solved, total: stats.easy.total, color: "text-gray-400" },
  { label: "Med.", primaryColor: "text-blue-400", solved: stats.medium.solved, total: stats.medium.total, color: "text-gray-400" },
  { label: "Hard", primaryColor: "text-red-400", solved: stats.hard.solved, total: stats.hard.total, color: "text-gray-400" },
];

// DashboardStats Component
const ProblemSolvingStats = ({ className }: { className: string }) => {
  return (
    <div className={`bg-[#1D1D1D] p-6 rounded-xl w-full h-full flex items-center space-x-6 shadow-lg border border-gray-800 hover:border-gray-700 transition-all duration-300 ${className}`}>
      <div className="flex flex-col space-y-3 w-full">
        <p className="text-xl font-semibold text-white font-coinbase-display">Problem Solving Stats</p>
        <div className="flex items-center space-x-6">
          <PieChart width={140} height={140}>
            <Pie
              data={progressData}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={70}
              startAngle={90}
              endAngle={-270}
              labelLine={false}
            >
              {progressData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
          <div className="text-white space-y-2 font-coinbase-sans">
            <h1 className="text-3xl font-bold text-white font-coinbase-display">
              {stats.solved} <span className="text-gray-500 text-base">/{stats.total}</span>
            </h1>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-[#3CE7B2] mr-2"></div>
              <p className="text-sm">Solved</p>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-[#60a5fa] mr-2"></div>
              <p className="text-sm">{stats.attempting} Attempting</p>
            </div>
          </div>
          <div className="space-y-2 font-coinbase-sans">
            {difficultyData.map((item, index) => (
              <div key={index} className="bg-[#2C2C2C] px-3 py-2 rounded-md flex justify-between w-40">
                <span className={`${item.primaryColor} font-medium text-sm`}>{item.label}</span>
                <span className="text-gray-400 text-sm">{item.solved}/{item.total}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemSolvingStats;