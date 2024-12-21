import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Container, MenuItem, Select, FormControl, Box, InputLabel, Card, CardContent, Stack, } from "@mui/material";
import "../../../../core/style/Dashboard.css";
import { db } from "../../../../core/firebase/firebase-config";
import { collection, query, where, getDocs } from "firebase/firestore";
 
// Array to ensure months are in the correct order
const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
 
// Function to fetch yearly data
const fetchYearlyData = async (userId) => {
  const droppingsCollectionRef = collection(db, "detectedDroppings");
  const q = query(droppingsCollectionRef, where("UserID", "==", userId));
  const snapshot = await getDocs(q);
 
  const yearlyData = {};
 
  snapshot.forEach((doc) => {
    const data = doc.data();
    const date = data.date.toDate ? data.date.toDate() : new Date(data.date);
    const year = date.getFullYear();
    const month = date.toLocaleString("default", { month: "short" });

    // Initialize the year if not exists
    if (!yearlyData[year]) {
      yearlyData[year] = [];
    }
 
    // Aggregate the monthly data for the year
    const detections = data.detectionsCount || {};
    const existingData = yearlyData[year].find(item => item.month === month);
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
    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', }}>
      {payload.map((entry, index) => (
        <div key={`item-${index}`} style={{ display: 'flex', alignItems: 'center', marginRight: 10 }}>
          <div style={{
            backgroundColor: entry.payload.stroke,
            width: 12,
            height: 12,
            borderRadius: '50%',
            marginRight: 5
          }} />
          <span style={{ fontSize: 14, fontWeight: '600', color: '#333' }}>{entry.value}</span>
        </div>
      ))}
    </div>
  );
};



// Custom tooltip content
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
 
export default function YearlyChart() {
  const [selectedYear, setSelectedYear] = useState("");
  const [chartData, setChartData] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);

 
  useEffect(() => {
    const storedUser = localStorage.getItem("loggedInUser");
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    const userId = parsedUser?.UserID;
 
    if (userId) {
      const fetchData = async () => {
        const yearlyData = await fetchYearlyData(userId);
        const years = Object.keys(yearlyData);
        setAvailableYears(years);
        const defaultYearData = yearlyData[years[0]] || [];
        const sortedData = defaultYearData.sort((a, b) =>
          monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month)
        );
        setSelectedYear(years[0]); 
        setChartData(sortedData);
      };
      fetchData();
    }
  }, []);
 
  const handleYearChange = (event) => {
    const year = event.target.value;
    setSelectedYear(year);
    const storedUser = localStorage.getItem("loggedInUser");
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    const userId = parsedUser?.UserID;
 
    if (userId) {
      fetchYearlyData(userId).then((yearlyData) => {
        const yearData = yearlyData[year] || [];
        const sortedData = yearData.sort((a, b) =>
          monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month)
        );
        setChartData(sortedData);
      });
    }
  };
 
  return (
    <Card variant="elevation"
    elevation={2} sx={{ boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)", flex: 1,  borderRadius: "16px"}}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
          <Container className="chart-container">
            <p className="heading1">Yearly Overall Health Score</p>
            <Box display="flex" alignItems="center">
              <FormControl variant="outlined" sx={{ width: { sm: 200, md: 200, lg: 250 }, ml: 2 }}>
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
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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