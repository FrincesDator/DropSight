import React, { useState } from "react";
import { Container, Button, Stack } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

// DailyChart component accepts data as a prop
const DailyChart = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const daysPerPage = 7;

  // Check for empty data and handle rendering logic
  if (!data || data.length === 0) return <p>No data available</p>;

  // Prepare the chart data (flatten the daily counts into an array for rendering)
  const chartData = data.flatMap((item) =>
    Object.keys(item.dailyCounts).map((day) => ({
      day,
      ...item.dailyCounts[day],
    }))
  );

  // Split the chart data into chunks of 7 days each
  const paginatedData = [];
  for (let i = 0; i < chartData.length; i += daysPerPage) {
    paginatedData.push(chartData.slice(i, i + daysPerPage));
  }

  // Get the data for the current page
  const currentPageData = paginatedData[currentPage] || [];

  const handleNext = () => {
    if (currentPage < paginatedData.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

// Custom tooltip content
const customTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const { Healthy, Salmonella, Newcastle, Coccidiosis } = payload[0].payload;
    return (
      <div className="custom-tooltip" style={{ backgroundColor: "#fff", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}>
        <p style={{ marginBottom: "-10px" }}>Day {label} Detected Droppings:</p>
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
      <p className="heading2">Daily Assessment</p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={currentPageData}>
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip content={customTooltip} />
          <Legend />
          <Bar dataKey="Healthy" fill="#4A7F2C" />
          <Bar dataKey="Salmonella" fill="#FFC107" />
          <Bar dataKey="Newcastle" fill="#F44336" />
          <Bar dataKey="Coccidiosis" fill="#0288D1" />
        </BarChart>
      </ResponsiveContainer>
      <Stack direction="row" justifyContent="center" spacing={2} mt={2}>
        <Button variant="outlined" onClick={handlePrevious} disabled={currentPage === 0}>
          {"<"}
        </Button>
        <Button
          variant="outlined"
          onClick={handleNext}
          disabled={currentPage === paginatedData.length - 1}
        >
          {">"}
        </Button>
      </Stack>
    </Container>
  );
};

export default DailyChart;
