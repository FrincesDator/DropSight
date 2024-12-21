import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Container, MenuItem, Select, FormControl, Box, InputLabel, Card, CardContent, Stack } from "@mui/material";
import "../../../../core/style/Dashboard.css";
import { db } from "../../../../core/firebase/firebase-config";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useMediaQuery, useTheme } from "@mui/material";
 
const monthOrder = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
 
const fetchYearlyData = async (selectedUserID) => {
  const droppingsCollectionRef = collection(db, "detectedDroppings");
  const q = query(droppingsCollectionRef, where("UserID", "==", selectedUserID));
  const snapshot = await getDocs(q);
 
  const yearlyData = {};
 
  snapshot.forEach((doc) => {
    const data = doc.data();
    const date = data.date.toDate ? data.date.toDate() : new Date(data.date);
    const year = date.getFullYear();
    const month = date.toLocaleString("default", { month: "short" });
 
    if (!yearlyData[year]) {
      yearlyData[year] = [];
    }
 
    const detections = data.detectionsCount || {};
    const existingData = yearlyData[year].find((item) => item.month === month);
    if (existingData) {
      existingData.Healthy += detections.Healthy || 0;
      existingData.Salmonella += detections["Salmonella-like"] || 0;
      existingData.Newcastle += detections["NCD-like"] || 0;
      existingData.Coccidiosis += detections["Coccidiosis-like"] || 0;
    } else {
      yearlyData[year].push({
        month,
        Healthy: detections.Healthy || 0,
        Salmonella: detections["Salmonella-like"] || 0,
        Newcastle: detections["NCD-like"] || 0,
        Coccidiosis: detections["Coccidiosis-like"] || 0,
      });
    }
  });
 
  return yearlyData;
};
 
const CustomLegend = (props) => {
  const { payload } = props;
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        padding: "0 10px",
        fontSize: "12px",
      }}
    >
      {payload.map((entry, index) => (
        <div
          key={`item-${index}`}
          style={{
            display: "flex",
            alignItems: "center",
            marginRight: 10,
            marginBottom: 5,
          }}
        >
          <div
            style={{
              backgroundColor: entry.payload.stroke,
              width: 12,
              height: 12,
              borderRadius: "50%",
              marginRight: 5,
            }}
          />
          <span style={{ fontSize: "12px", fontWeight: "600", color: "#333" }}>
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};
 
const customTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const { Healthy, Salmonella, Newcastle, Coccidiosis } = payload[0].payload;
 
    const date = new Date(`${label} 1, 2020`);
    const monthName = date.toLocaleString("default", { month: "long" });
 
    return (
      <div className="custom-tooltip" style={{ backgroundColor: "#fff", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}>
        <p style={{ marginBottom: "-10px" }}>Detected Droppings in {monthName}</p>
        <p style={{ marginBottom: "-15px", fontWeight: "normal" }}>Healthy: {Healthy}</p>
        <p style={{ marginBottom: "-15px", fontWeight: "normal" }}>Salmonella: {Salmonella}</p>
        <p style={{ marginBottom: "-15px", fontWeight: "normal" }}>Newcastle: {Newcastle}</p>
        <p style={{ marginBottom: "10px", fontWeight: "normal" }}>Coccidiosis: {Coccidiosis}</p>
      </div>
    );
  }
  return null;
};
 
export default function YearlyChart({ selectedFarm }) {
  const [selectedYear, setSelectedYear] = useState("");
  const [chartData, setChartData] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
 
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedFarm) return;
 
      const yearlyData = await fetchYearlyData(selectedFarm);
      const years = Object.keys(yearlyData);
 
      if (years.length > 0) {
        setAvailableYears(years);
        const defaultYear = years[0];
        setSelectedYear(defaultYear);
        const defaultYearData = yearlyData[defaultYear];
        const sortedData = defaultYearData.sort(
          (a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month)
        );
        setChartData(sortedData);
      }
    };
 
    fetchData();
  }, [selectedFarm]);
 
  const handleYearChange = async (event) => {
    const year = event.target.value;
    setSelectedYear(year);
 
    const yearlyData = await fetchYearlyData(selectedFarm);
    const yearData = yearlyData[year] || [];
    const sortedData = yearData.sort(
      (a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month)
    );
    setChartData(sortedData);
  };
 
  return (
    <Card
      variant="elevation"
      elevation={2}
      sx={{ borderRadius: "16px", boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)", flex: 1 }}
    >
      <CardContent>
        <Stack
          direction={isMobile ? "column" : "row"} // Stack column on mobile, row on desktop
          justifyContent="space-between"
          alignItems="center"
          spacing={1}
        >
          <Container className="chart-container">
            <p className="heading1">Yearly Overall Health Score</p>
            <Box display="flex" alignItems="center" justifyContent={isMobile ? "center" : "flex-start"} width={isMobile ? "100%" : "auto"} mt={isMobile ? 2 : 0}>
              <FormControl variant="outlined" sx={{ width: isMobile ? "100%" : 200, maxWidth: 300 }}>
                <InputLabel className="textbox-font">Year</InputLabel>
                <Select
                  id="year-dropdown"
                  value={selectedYear}
                  onChange={handleYearChange}
                  className="textbox-font"
                >
                  {availableYears.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Container>
        </Stack>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Container className="chart-container">
            <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip content={customTooltip} />
                <Legend content={<CustomLegend />} />
                <Line type="monotone" dataKey="Healthy" stroke="#4A7F2C" />
                <Line type="monotone" dataKey="Salmonella" stroke="#FFC107" />
                <Line type="monotone" dataKey="Newcastle" stroke="#F44336" />
                <Line type="monotone" dataKey="Coccidiosis" stroke="#0288D1" />
              </LineChart>
            </ResponsiveContainer>
          </Container>
        </Box>
      </CardContent>
    </Card>
  );
}
 