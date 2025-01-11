import React, { useState } from "react";
import { Container, Button, Stack } from "@mui/material";
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
 
const DailyChart = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const daysPerPage = isMobile ? 4 : 7;
 
 
  if (!data || data.length === 0) return null;
 
 
  const chartData = data.flatMap((item) =>
    Object.keys(item.dailyCounts).map((day) => ({
      day,
      ...item.dailyCounts[day],
    }))
  );
 
 
  const paginatedData = [];
  for (let i = 0; i < chartData.length; i += daysPerPage) {
    paginatedData.push(chartData.slice(i, i + daysPerPage));
  }
 
 
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
 
 
  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const { Healthy, Salmonella, Newcastle, Coccidiosis } =
        payload[0].payload;
      return (
        <div
          style={{
            backgroundColor: "#fff",
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        >
          <p>Day {label} Detected Droppings:</p>
          <p>Healthy: {Healthy}</p>
          <p>Salmonella: {Salmonella}</p>
          <p>Newcastle: {Newcastle}</p>
          <p>Coccidiosis: {Coccidiosis}</p>
        </div>
      );
    }
    return null;
  };
 
  return (
    <Container
      className="chart-container"
      sx={{
        padding: isMobile ? "0" : "16px",
      }}
    >
      <p
        className="heading2"
        style={{
          fontSize: isMobile ? "1rem" : "1.5rem",
          textAlign: isMobile ? "center" : "left",
        }}
      >
        Daily Assessment
      </p>
      <ResponsiveContainer width="100%" height={isMobile ? 180 : 250}>
        <BarChart
          data={currentPageData}
          margin={{ bottom: isMobile ? 30 : 50 }}
        >
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip content={customTooltip} />
          <Legend
            wrapperStyle={{
              fontSize: isMobile ? "0.7rem" : "1rem",
              bottom: 0,
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
 
      <Stack
        direction="row"
        justifyContent="center"
        spacing={2}
        mt={2}
        sx={{ flexWrap: isMobile ? "wrap" : "nowrap" }}
      >
        <Button
          variant="outlined"
          onClick={handlePrevious}
          disabled={currentPage === 0}
          size={isMobile ? "small" : "medium"}
        >
          {"<"}
        </Button>
        <Button
          variant="outlined"
          onClick={handleNext}
          disabled={currentPage === paginatedData.length - 1}
          size={isMobile ? "small" : "medium"}
        >
          {">"}
        </Button>
      </Stack>
    </Container>
  );
};
 
export default DailyChart;
 