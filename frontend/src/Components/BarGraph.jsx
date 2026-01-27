import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

const BarGraph = ({ data, title }) => {
  return (
    <div style={{ width: "100%", height: 350 }}>
      {title && <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>{title}</h3>}
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="option" />
          <YAxis allowDecimals={false} />

          <Tooltip />
          <Legend />

          <Bar dataKey="count" fill="#86c779" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarGraph;