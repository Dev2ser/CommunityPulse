import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#4f46e5", // indigo
  "#22c55e", // green
  "#eab308", // yellow
  "#ef4444", // red
  "#06b6d4", // cyan
  "#a855f7", // purple
  "#f97316", // orange
];

const PieChartComponent = ({ data, title }) => {
  const chartData = data.map(item => ({
    name: item.option,
    value: item.count,
  }));

  return (
    <div style={{ width: "100%", height: 350 }}>
      {title && (
        <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>
          {title}
        </h3>
      )}

      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={110}
            label
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>

          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChartComponent;
