import React from "react";
import { Container } from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useMediaQuery, useTheme } from "@mui/material";
 
const WeeklyChart = ({ data }) => {
 
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
 
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
 
 
  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const { Healthy, Salmonella, Newcastle, Coccidiosis } =
        payload[0].payload;
      return (
        <div
          className="custom-tooltip"
          style={{
            backgroundColor: "#fff",
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            fontSize: isMobile ? "0.8rem" : "1rem",
          }}
        >
          <p style={{ marginBottom: "5px" }}>Detected Droppings in {label}</p>
          <p style={{ marginBottom: "3px" }}>Healthy: {Healthy}</p>
          <p style={{ marginBottom: "3px" }}>Salmonella: {Salmonella}</p>
          <p style={{ marginBottom: "3px" }}>Newcastle: {Newcastle}</p>
          <p style={{ marginBottom: "0" }}>Coccidiosis: {Coccidiosis}</p>
        </div>
      );
    }
    return null;
  };
 
  return (
    <Container className="chart-container">
      <p
        className="heading2"
        style={{
          fontSize: isMobile ? "1rem" : "1.5rem",
          textAlign: isMobile ? "center" : "left",
        }}
      >
        Weekly Assessment
      </p>
      <ResponsiveContainer width="100%" height={isMobile ? 250 : 400}>
        {" "}
       
        <BarChart
          data={chartData}
          margin={{
            top: 10,
            right: isMobile ? 10 : 20,
            left: isMobile ? 10 : 20,
            bottom: isMobile ? 30 : 50,
          }}
        >
          <XAxis
            dataKey="week"
            tick={{ fontSize: isMobile ? 10 : 12 }}
          />
          <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} />
          <Tooltip content={customTooltip} />
          <Legend
            wrapperStyle={{
              fontSize: isMobile ? "0.8rem" : "1rem",
              textAlign: "center",
            }}
            layout="horizontal"
            align="center"
            verticalAlign="bottom"
          />
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