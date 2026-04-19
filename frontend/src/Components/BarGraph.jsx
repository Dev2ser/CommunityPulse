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
  "#5f8fd8", // balanced blue
  "#72b98f", // fresh green
  "#cda95f", // warm amber
  "#d37f7f", // soft red
  "#61a9bf", // teal
  "#9b81cb", // violet
  "#d29160", // orange
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
          <CartesianGrid strokeDasharray="3 3" stroke="#e6ebf1" />
          <XAxis dataKey="name" tickMargin={8} tick={{ fill: "#6f7783", fontSize: 12 }} />
          <YAxis allowDecimals={false} width={32} tick={{ fill: "#6f7783", fontSize: 12 }} />
          <Tooltip cursor={{ fill: "rgba(95, 143, 216, 0.1)" }} />
          <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: 12 }} />

          {data.map((item, index) => (
            <Bar
              key={item.option}
              dataKey={item.option}
              fill={COLORS[index % COLORS.length]}
              stroke="rgba(34, 44, 58, 0.16)"
              strokeWidth={1}
              fillOpacity={0.95}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarGraph;
