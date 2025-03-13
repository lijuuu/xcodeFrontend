import HeatMap from "@uiw/react-heat-map";
import React from "react";

// Generate heatmap data (last 365 days)
const generateHeatmapData = () => {
  const today = new Date();
  return Array.from({ length: 365 }, (_, index) => {
    const date = new Date();
    date.setDate(today.getDate() - index);
    const count = Math.floor(Math.random() * 5);
    return {
      date: date.toISOString().split("T")[0],
      count,
    };
  });
};

// UserActivityCard Component
const UserActivityCard = () => {
  const heatmapData = generateHeatmapData();
  // Use turquoise gradient from reference image
  const activityColors = ["#182422", "#164F45", "#1D7D6A", "#1D7D6A", "#3CE7B2"];

  return (
    <div className="bg-[#1D1D1D] p-6 rounded-xl shadow-lg border border-gray-800 hover:border-gray-700 transition-all duration-300">
      <h3 className="text-xl font-semibold text-white mb-6 font-coinbase-display">Activity</h3>
      <div className="w-full h-auto">
        <HeatMap
          className="w-full h-full"
          value={heatmapData}
          startDate={new Date("2024-03-08")}
          endDate={new Date("2025-03-07")}
          rectSize={14}
          space={4}
          rectRender={(props, data) => {
            const intensity = data?.count || 0;
            const fillColor = activityColors[Math.min(intensity, activityColors.length - 1)];
            return (
              <rect
                {...props}
                width={14}
                height={14}
                rx={2}
                style={{ fill: fillColor }}
              />
            );
          }}
          style={{ color: "#a0aec0", backgroundColor: "transparent", fontFamily: "CoinbaseSans" }}
          monthLabels={["Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"]}
          weekLabels={["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]}
        />
      </div>
    </div>
  );
};

export default UserActivityCard;