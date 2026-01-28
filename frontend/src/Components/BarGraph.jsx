import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend
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


const BarGraph = ({ data, title }) => {
  const chartData = [
    data.reduce((acc, curr) => {
      acc[curr.option] = curr.count;
      return acc;
    }, { name: "Responses" })
  ];

  return (
    <div style={{ width: "100%", height: 350 }}>
      {title && <h3 style={{ textAlign: "center" }}>{title}</h3>}

      <ResponsiveContainer>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />

          {data.map((item, index) => (
            <Bar
              key={item.option}
              dataKey={item.option}
              fill={COLORS[index % COLORS.length]}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarGraph;