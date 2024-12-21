import React from "react";
import { Container } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

const WeeklyChart = ({ data }) => {
  if (!data || data.length === 0) return null;

  const chartData = data.map((item) => {
    const weeklyTotals = Object.values(item.dailyCounts).reduce(
      (acc, dailyData) => {
        acc.Healthy += dailyData.Healthy || 0;
        acc.Salmonella += dailyData.Salmonella || 0;
        acc.Newcastle += dailyData.Newcastle || 0;
        acc.Coccidiosis += dailyData.Coccidiosis || 0;
        return acc;
      },
      { Healthy: 0, Salmonella: 0, Newcastle: 0, Coccidiosis: 0 }
    );

    return { week: item.week, ...weeklyTotals };
  });

  // Custom tooltip content
const customTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const { Healthy, Salmonella, Newcastle, Coccidiosis } = payload[0].payload;
    return (
      <div className="custom-tooltip" style={{ backgroundColor: "#fff", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}>
        <p style={{ marginBottom: "-10px" }}>Detected Droppings in {label}</p>
        <p style={{ marginBottom: "-15px", fontWeight: "normal" }}>Healthy: {Healthy}</p>
        <p style={{ marginBottom: "-15px", fontWeight: "normal" }}>Salmonella: {Salmonella}</p>
        <p style={{ marginBottom: "-15px", fontWeight: "normal" }}>Newcastle: {Newcastle}</p>
        <p style={{ marginBottom: "10px", fontWeight: "normal" }}>Coccidiosis: {Coccidiosis}</p>
      </div>
    );
  }
  return null;
};

  return (
    <Container className="chart-container">
      <p className="heading2">Weekly Assessment</p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData}>
          <XAxis dataKey="week" />
          <YAxis />
          <Tooltip content={customTooltip} />
          <Legend />
          <Bar dataKey="Healthy" fill="#4A7F2C" />
          <Bar dataKey="Salmonella" fill="#FFC107" />
          <Bar dataKey="Newcastle" fill="#F44336" />
          <Bar dataKey="Coccidiosis" fill="#0288D1" />
        </BarChart>
      </ResponsiveContainer>
    </Container>
  );
};

export default WeeklyChart;
