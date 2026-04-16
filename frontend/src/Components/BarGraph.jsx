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
    <div style={{ width: "100%", height: "clamp(260px, 48vw, 350px)" }}>
      {title && <h3 style={{ textAlign: "center" }}>{title}</h3>}

      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tickMargin={8} />
          <YAxis allowDecimals={false} width={32} />
          <Tooltip />
          <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: 12 }} />

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
