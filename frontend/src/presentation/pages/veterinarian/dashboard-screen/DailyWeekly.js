import React, { useState, useEffect } from "react";
import { Container, Card, CardContent, Stack, FormControl, InputLabel, Select, MenuItem, Grid, Box } from "@mui/material";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../../core/firebase/firebase-config";
import DailyChart from "./Daily";
import WeeklyChart from "./Weekly";
 
 
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
 
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
 
  return isMobile;
};
 
 
const fetchMonthsAndData = async (selectedUserID) => {
  if (!selectedUserID) return { months: [], data: [] };
 
  const droppingsCollectionRef = collection(db, "detectedDroppings");
  const q = query(droppingsCollectionRef, where("UserID", "==", selectedUserID));
  const snapshot = await getDocs(q);
 
  const rawData = [];
  snapshot.forEach((doc) => {
    const data = doc.data();
    const date = data.date.toDate ? data.date.toDate() : new Date(data.date);
    const detections = data.detectionsCount || {};
 
    rawData.push({
      date,
      Healthy: detections.Healthy || 0,
      Salmonella: detections["Salmonella-like"] || 0,
      Newcastle: detections["NCD-like"] || 0,
      Coccidiosis: detections["Coccidiosis-like"] || 0,
    });
  });
 
  const groupedData = rawData.reduce((acc, curr) => {
    const month = curr.date.toLocaleString("default", { month: "long" });
    const weekNumber = Math.ceil(curr.date.getDate() / 7);
    const weekKey = `${month}: Week ${weekNumber}`;
 
    if (!acc[weekKey]) acc[weekKey] = [];
    acc[weekKey].push(curr);
 
    return acc;
  }, {});
 
  const processedData = Object.keys(groupedData).map((weekKey) => {
    const weekData = groupedData[weekKey];
    const dailyCounts = weekData.reduce((dayAcc, item) => {
      const day = item.date.getDate();
      dayAcc[day] = {
        Healthy: (dayAcc[day]?.Healthy || 0) + item.Healthy,
        Salmonella: (dayAcc[day]?.Salmonella || 0) + item.Salmonella,
        Newcastle: (dayAcc[day]?.Newcastle || 0) + item.Newcastle,
        Coccidiosis: (dayAcc[day]?.Coccidiosis || 0) + item.Coccidiosis,
      };
      return dayAcc;
    }, {});
 
    return { week: weekKey, dailyCounts };
  });
 
  const availableMonths = [
    ...new Set(rawData.map((d) => d.date.toLocaleString("default", { month: "long" }))),
  ];
 
 
  const monthOrder = [
    "January", "February", "March", "April", "May", "June", "July", "August",
    "September", "October", "November", "December"
  ];
 
 
  availableMonths.sort((a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b));
 
  return { months: availableMonths, data: processedData };
};
 
const DailyWeekly = ({ selectedFarm }) => {
  const [allData, setAllData] = useState([]);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [month, setMonth] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const isMobile = useIsMobile();
 
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedFarm) return;
      const { months, data } = await fetchMonthsAndData(selectedFarm);
      setAvailableMonths(months);
      setAllData(data);
      setMonth(months[0] || "");
      const initialFilteredData = months.length > 0
        ? data.filter((item) => item.week.startsWith(months[0]))
        : [];
      setFilteredData(initialFilteredData);
    };
 
    fetchData();
  }, [selectedFarm]);
 
  const handleMonthChange = (event) => {
    const selectedMonth = event.target.value;
    setMonth(selectedMonth);
    const filtered = allData.filter((item) => item.week.startsWith(selectedMonth));
    setFilteredData(filtered);
  };
 
  return (
    <Box className="chart-container" display="flex" justifyContent="center" width="100%">
      <Card
        variant="elevation"
        elevation={2}
        sx={{ borderRadius: "16px", boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)", width: "100%" }}
      >
        <CardContent>
          <Stack
            direction={isMobile ? "column" : "row"}
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <p className="heading1">Daily and Weekly Charts</p>
 
           
            <Box
              display="flex"
              justifyContent={isMobile ? "center" : "flex-start"}  
              mt={2}
              width={isMobile ? "100%" : "auto"}  
            >
              <FormControl variant="outlined" sx={{ width: isMobile ? "100%" : 200, maxWidth: 300 }}>
                <InputLabel className="textbox-font">Month</InputLabel>
                <Select value={month} onChange={handleMonthChange} label="Month" className="textbox-font">
                  {availableMonths.map((monthName, index) => (
                    <MenuItem key={index} value={monthName}>
                      {monthName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Stack>
 
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <DailyChart data={filteredData} />
            </Grid>
            <Grid item xs={12} md={6}>
              <WeeklyChart data={filteredData} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};
 
export default DailyWeekly;