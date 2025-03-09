import React from "react";
import { User } from "@/types/common";
import HeatMap from "@uiw/react-heat-map";
import { PieChart, Pie, Cell } from "recharts";
import imagesrc from "@/assets/triangle.png";
import { FaGithub, FaTwitter, FaLinkedin, FaInstagram, FaMapMarkerAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// Define ProfileCardProps
type ProfileCardProps = {
  user: any;
};

// Dashboard stats data
const stats = {
  solved: 86,
  total: 150,
  attempting: 15,
  easy: { solved: 74, total: 80 },
  medium: { solved: 12, total: 50 },
  hard: { solved: 0, total: 20 },
};

// Circular progress data for PieChart (green, yellow, red)
const progressData = [
  { name: "Solved", value: stats.solved, color: "#22c55e" }, // Green
  { name: "Attempting", value: stats.attempting, color: "#facc15" }, // Yellow
  { name: "Remaining", value: stats.total - stats.solved - stats.attempting, color: "#ef4444" }, // Red
];

// Difficulty breakdown data (using neutral text)
const difficultyData = [
  { label: "Easy", primaryColor: "text-green-400", solved: stats.easy.solved, total: stats.easy.total, color: "text-gray-400" },
  { label: "Med.", primaryColor: "text-yellow-400", solved: stats.medium.solved, total: stats.medium.total, color: "text-gray-400" },
  { label: "Hard", primaryColor: "text-red-400", solved: stats.hard.solved, total: stats.hard.total, color: "text-gray-400" },
];

// Dummy data for recent submissions and badges
const dummyRecentSubmissions = [
  { id: 1, title: "Two Sum", difficulty: "Easy", category: ["Array", "Hash Table"], status: "Solved" },
  {
    id: 2,
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    category: ["String", "Sliding Window"],
    status: "Attempted",
  },
  { id: 3, title: "Median of Two Sorted Arrays", difficulty: "Hard", category: ["Array", "Binary Search"], status: "Solved" },
  { id: 4, title: "Add Two Numbers", difficulty: "Medium", category: ["Linked List", "Math"], status: "Solved" },
  { id: 5, title: "Longest Palindromic Substring", difficulty: "Medium", category: ["String", "Dynamic Programming"], status: "Attempted" },
  { id: 6, title: "Merge Two Sorted Lists", difficulty: "Easy", category: ["Linked List", "Recursion"], status: "Solved" },
  { id: 7, title: "Longest Common Subsequence", difficulty: "Medium", category: ["String", "Dynamic Programming"], status: "Solved" },
  { id: 8, title: "Longest Increasing Subsequence", difficulty: "Medium", category: ["Array", "Dynamic Programming"], status: "Attempted" },
  { id: 9, title: "Longest Palindromic Subsequence", difficulty: "Medium", category: ["String", "Dynamic Programming"], status: "Solved" },
  { id: 10, title: "Longest Common Subsequence", difficulty: "Medium", category: ["String", "Dynamic Programming"], status: "Solved" },
  { id: 11, title: "Two Sum", difficulty: "Easy", category: ["Array", "Hash Table"], status: "Solved" },
  { id: 12, title: "Longest Substring Without Repeating Characters", difficulty: "Medium", category: ["String", "Sliding Window"], status: "Attempted" },
  { id: 13, title: "Median of Two Sorted Arrays", difficulty: "Hard", category: ["Array", "Binary Search"], status: "Solved" },
  { id: 14, title: "Add Two Numbers", difficulty: "Medium", category: ["Linked List", "Math"], status: "Solved" },
  { id: 15, title: "Longest Palindromic Substring", difficulty: "Medium", category: ["String", "Dynamic Programming"], status: "Attempted" },
];

const badges = [
  { id: 1, name: "Badge 1", description: "Badge 1 description", icon: "https://api.dicebear.com/9.x/bottts/svg?seed=Sophia" },
  { id: 2, name: "Badge 2", description: "Badge 2 description", icon: "https://api.dicebear.com/9.x/bottts/svg?seed=Jude" },
  { id: 3, name: "Badge 3", description: "Badge 3 description", icon: "https://api.dicebear.com/9.x/bottts/svg?seed=Avery" },
];

// DashboardStats Component
const DashboardStats = () => {
  return (
    <div className="bg-black p-4 rounded-lg w-full h-full flex items-center space-x-6 shadow-sm hover:bg-gray-900 transition-colors duration-200">
      {/* Circular Progress */}
      <div className="flex flex-col space-y-3">
        <p className="text-2xl font-semibold text-blue-700 font-coinbase-display">Solved</p>
        <div className="flex items-center space-x-4">
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

          {/* Stats */}
          <div className="text-white space-y-1 font-coinbase-sans">
            <h1 className="text-3xl font-bold text-blue-700 font-coinbase-display">
              {stats.solved} <span className="text-gray-500 text-base">/{stats.total}</span>
            </h1>
            <p className="text-green-400 text-sm">✔ Solved</p>
            <p className="text-yellow-400 text-sm">{stats.attempting} Attempting</p>
          </div>

          {/* Difficulty Breakdown */}
          <div className="space-y-1 font-coinbase-sans">
            {difficultyData.map((item, index) => (
              <div key={index} className="bg-gray-900 px-3 py-1 rounded-md flex justify-between w-36">
                <span className={`${item.color} font-semibold text-sm`}>{item.label}</span>
                <span className="text-gray-500 text-sm">{item.solved}/{item.total}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Generate heatmap data (last 365 days)
const generateHeatmapData = () => {
  const today = new Date();
  return Array.from({ length: 365 }, (_, index) => {
    const date = new Date();
    date.setDate(today.getDate() - index);
    const count = Math.floor(Math.random() * 5); // 0-4 contributions
    return {
      date: date.toISOString().split("T")[0], // Format as YYYY-MM-DD
      count,
    };
  });
};

// UserActivityCard Component with @uiw/react-heat-map
const UserActivityCard = () => {
  const heatmapData = generateHeatmapData();

  // Blue shades for heatmap
  const blueShades = [
    "#1e3a8a", // Darkest blue (no activity)
    "#3b82f6", // Blue-600 (low activity)
    "#60a5fa", // Blue-500 (medium-low)
    "#93c5fd", // Blue-400 (medium-high)
    "#bfdbfe", // Blue-300 (high activity)
  ];

  return (
    <div className="bg-black p-4 rounded-lg shadow-sm hover:bg-gray-900 transition-colors duration-200">
      <h3 className="text-2xl font-semibold text-blue-700 mb-4 font-coinbase-display">Activity</h3>
      <div className="w-full h-auto">
        <HeatMap
          className="w-full h-full"
          value={heatmapData}
          startDate={new Date("2024-03-08")}
          endDate={new Date("2025-03-07")}
          rectSize={16}
          space={3}
          rectRender={(props, data) => {
            const intensity = data?.count || 0;
            const fillColor = blueShades[Math.min(intensity, blueShades.length - 1)];
            return (
              <rect
                {...props}
                width={16}
                height={16}
                rx={2}
                style={{ fill: fillColor }}
              />
            );
          }}
          style={{ color: "#a0aec0", backgroundColor: "transparent", fontFamily: "CoinbaseSans" }}
          monthLabels={["Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"]}
          weekLabels={["Sun", "Mon", "Tue", "W  ed", "Thu", "Fri", "Sat"]}
        />
      </div>
    </div>
  );
};

// ProfileCard Component
const ProfileCard = ({ user }: ProfileCardProps) => {
  const navigate = useNavigate();
  return (
    <div>
      <div className="container-main bg-night-black min-h-screen flex flex-col md:flex-row px-6 py-8 gap-6">
        {/* Left Container */}
        <div className="container-left w-full md:w-[25%] space-y-6">
          {/* User Info Card */}
          <div className="container-left-1 bg-black rounded-lg shadow-sm p-6 hover:bg-gray-900 transition-colors duration-200">
            <div className="container-left-1-1 flex items-center mb-6">
              <img
                src={imagesrc}
                alt="User avatar"
                className="w-14 h-14 rounded-full mr-4"
              />
              <div className="container-left-1-1-1 flex flex-col justify-between space-y-1">
                <div>
                  <p className="text-2xl font-semibold text-blue-700 font-coinbase-display">Triangle</p>
                  <p className="text-sm text-gray-400 font-coinbase-sans">@triangle</p>
                </div>
                <p className="text-sm text-gray-400 font-coinbase-sans">Rank: 1</p>
              </div>
            </div>
            <button className="bg-blue-700 text-white w-full px-4 py-2 rounded-md text-sm font-medium font-coinbase-sans hover:bg-blue-600 transition-colors duration-200"
            onClick={() => {
              navigate("/edit-profile");
            }}
            >
              Edit Profile
            </button>
            <div className="container-left-1-2 mt-6 space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-400 font-coinbase-sans">
                <FaMapMarkerAlt className="text-gray-400 w-4 h-4" />
                <span>India</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400 hover:text-blue-700 font-coinbase-sans transition-colors duration-200">
                <FaGithub className="text-gray-400 w-4 h-4" />
                <a href="https://github.com/triangle" target="_blank" rel="noopener noreferrer">
                  github.com/triangle
                </a>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400 hover:text-blue-700 font-coinbase-sans transition-colors duration-200">
                <FaTwitter className="text-gray-400 w-4 h-4" />
                <a href="https://twitter.com/triangle" target="_blank" rel="noopener noreferrer">
                  twitter.com/triangle
                </a>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400 hover:text-blue-700 font-coinbase-sans transition-colors duration-200">
                <FaLinkedin className="text-gray-400 w-4 h-4" />
                <a href="https://linkedin.com/triangle" target="_blank" rel="noopener noreferrer">
                  linkedin.com/triangle
                </a>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400 hover:text-blue-700 font-coinbase-sans transition-colors duration-200">
                <FaInstagram className="text-gray-400 w-4 h-4" />
                <a href="https://instagram.com/triangle" target="_blank" rel="noopener noreferrer">
                  instagram.com/triangle
                </a>
              </div>
            </div>
          </div>

          {/* Languages Card */}
          <div className="container-left-2 bg-black rounded-lg shadow-sm p-6 hover:bg-gray-900 transition-colors duration-200">
            <h1 className="text-2xl font-semibold text-blue-700 mb-4 font-coinbase-display">Languages</h1>
            <div className="space-y-2">
              <p className="flex justify-between text-sm text-gray-400 font-coinbase-sans">
                Golang <span className="text-gray-500">x<span className="text-gray-300 font-coinbase-sans font-bold text-lg"> 30</span></span>
              </p>
              <p className="flex justify-between text-sm text-gray-400 font-coinbase-sans">
                Python <span className="text-gray-500">x<span className="text-gray-300 font-coinbase-sans font-bold text-lg"> 10</span></span>
              </p>
              <p className="flex justify-between text-sm text-gray-400 font-coinbase-sans">
                C++ <span className="text-gray-500">x<span className="text-gray-300 font-coinbase-sans font-bold text-lg"> 10</span></span>
              </p>
              <p className="flex justify-between text-sm text-gray-400 font-coinbase-sans">
                JavaScript <span className="text-gray-500">x<span className="text-gray-300 font-coinbase-sans font-bold text-lg"> 10</span></span>
              </p>
            </div>
          </div>
        </div>

        {/* Right Container */}
        <div className="container-right w-full md:w-[70%] space-y-6">
          {/* Activity Card */}
          <div className="container-right-2 w-full">
            <UserActivityCard />
          </div>

          {/* Stats and Badges Row */}
          <div className="container-right-1 flex flex-col md:flex-row gap-6">
            <div className="container-right-1-1 w-full md:w-1/2 h-full">
              <DashboardStats />
            </div>
            <div className="container-right-1-2 w-full md:w-1/2 bg-black rounded-lg shadow-sm p-6 hover:bg-gray-900 transition-colors duration-200">
              <h3 className="text-2xl font-semibold text-blue-700 mb-4 font-coinbase-display">Badges Earned</h3>
              <div className="space-y-3">
                {badges.map((badge) => (
                  <div key={badge.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={badge.icon}
                        alt={`${badge.name} badge`}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="text-sm text-gray-300 font-coinbase-sans">{badge.name}</span>
                    </div>
                    <span className="text-sm text-gray-400 font-coinbase-sans">{badge.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Submissions Card */}
          <div className="container-right-3 h-auto md:h-[400px] w-full bg-black rounded-lg shadow-sm p-6 overflow-y-auto hover:bg-gray-900 transition-colors duration-200">
            <h3 className="text-2xl font-semibold text-blue-700 mb-4 font-coinbase-display">Recent Problems</h3>
            <div className="space-y-3">
              {dummyRecentSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className="flex justify-between items-center p-3 bg-gray-900 rounded-md"
                >
                  <div>
                    <p className="text-sm text-gray-300 font-coinbase-sans">{submission.title}</p>
                    <div className="text-xs text-gray-400 font-coinbase-sans mt-1 space-y-1">
                      <p className={`${submission.difficulty === "Easy" ? "text-green-400" : submission.difficulty === "Medium" ? "text-yellow-400" : "text-red-400"}`}>{submission.difficulty}</p>
                      <div className="flex items-center space-x-2">
                        {submission.category.map((category) => (
                          <p key={category} className="text-gray-400 font-coinbase-sans bg-gray-800 px-2 py-1 rounded-md">{category}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium font-coinbase-sans ${
                      submission.status === "Solved"
                        ? "bg-green-900 text-white"
                        : submission.status === "Attempted"
                        ? "bg-yellow-900 text-white"
                        : "bg-red-900 text-white"
                    }`}
                  >
                    {submission.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;