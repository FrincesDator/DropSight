import React, { useState, useEffect } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Container,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../../core/firebase/firebase-config";

const CustomDot = ({ cx, cy, value }) => {
  const color = value >= 5 ? "red" : "green";
  return (
    <>
      <circle cx={cx} cy={cy} r={6} fill="white" />
      <circle cx={cx} cy={cy} r={3} fill={color} />
    </>
  );
};

const CustomTooltip = ({ active, payload, selectedMonth }) => {
  if (active && payload && payload.length) {
    const { day, rate } = payload[0].payload;
    const date = new Date(2024, selectedMonth - 1, day);
    const formattedDate = date.toLocaleString("default", {
      month: "long",
      day: "numeric",
    });
    const formattedRate = rate.toFixed(2);

    return (
      <div
        style={{
          background: "#fff",
          padding: "10px",
          border: "1px solid #ccc",
        }}
      >
        <p style={{ color: "#000", margin: 0, fontWeight: "normal" }}>
          {formattedDate}
        </p>
        <p style={{ color: "#000", margin: 0, fontWeight: "normal" }}>
          Mortality Rate: {formattedRate}%
        </p>
      </div>
    );
  }
  return null;
};

const Mortality = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [mortalityData, setMortalityData] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [weeklyPercentages, setWeeklyPercentages] = useState([]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Detect if the screen is small

  useEffect(() => {
    const storedUser = localStorage.getItem("loggedInUser");
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const fetchMortalityData = async () => {
      if (!userData) return;

      try {
        const userRef = collection(db, "farmOwnerAccount");
        const userQuery = query(
          userRef,
          where("UserID", "==", userData.UserID)
        );
        const userSnapshot = await getDocs(userQuery);

        const monthsWithData = new Set();
        const allMortalityData = [];

        for (const doc of userSnapshot.docs) {
          const metricsRef = collection(doc.ref, "Metrics");
          const metricsSnapshot = await getDocs(metricsRef);

          metricsSnapshot.forEach((metricDoc) => {
            const data = metricDoc.data();
            const numberOfDeaths = data.numberOfDeaths;
            const totalPopulation = data.totalPopulation;
            const timestamp = data.timestamp?.toDate();
            const month = timestamp?.getMonth() + 1;
            const day = timestamp?.getDate();

            if (numberOfDeaths !== undefined && totalPopulation !== undefined) {
              const mortalityRate = (numberOfDeaths / totalPopulation) * 100;
              allMortalityData.push({ day, rate: mortalityRate, month });
              monthsWithData.add(month);
            }
          });
        }

        const sortedMonths = [...monthsWithData].sort((a, b) => a - b);
        setAvailableMonths(sortedMonths);
        setMortalityData(allMortalityData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchMortalityData();
  }, [userData]);

  // Filter and sort the mortality data based on the selected month and day
  const filteredData = mortalityData
    .filter((data) => data.month === selectedMonth)
    .sort((a, b) => a.day - b.day);

  // Calculate weekly percentage
  const calculateWeeklyPercentage = () => {
    const weeks = [[], [], [], [], []];
    filteredData.forEach(({ day, rate }) => {
      const weekNumber = Math.floor((day - 1) / 7);
      weeks[weekNumber].push(rate);
    });

    // Calculate average mortality rate for each week
    const weeklyAvg = weeks.map((weekData) => {
      const total = weekData.reduce((sum, rate) => sum + rate, 0);
      return weekData.length > 0 ? (total / weekData.length).toFixed(2) : 0;
    });

    setWeeklyPercentages(weeklyAvg);
  };

  useEffect(() => {
    if (filteredData.length > 0) {
      calculateWeeklyPercentage();
    }
  }, [filteredData]);

  if (loading) {
    return null;
  }

  return (
    <Container className="home-page" sx={{ pt: isMobile ? 3 : 0 }}>
      <Box sx={{ paddingRight: { lg: 5 }, paddingLeft: { lg: 5 } }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          borderBottom={3}
          pt={3}
          pb={0}
          borderColor="grey.300"
          width="100%"
        >
          <p className="heading1">Mortality Rate</p>
          <FormControl
            variant="outlined"
            sx={{ width: { sm: 200, md: 200, lg: 250 } }}
          >
            <InputLabel id="select-label" className="textbox-font">
              Select Month
            </InputLabel>
            <Select
              labelId="select-label"
              id="select"
              label="Select Month"
              className="textbox-font"
              onChange={(e) => setSelectedMonth(e.target.value)}
              value={selectedMonth}
            >
              {availableMonths.length > 0 ? (
                availableMonths.map((month) => (
                  <MenuItem key={month} value={month}>
                    {new Date(0, month - 1).toLocaleString("default", {
                      month: "long",
                    })}
                  </MenuItem>
                ))
              ) : (
                <MenuItem value="">No Data Available</MenuItem>
              )}
            </Select>
          </FormControl>
        </Box>

        <Box display="flex" justifyContent="space-between" pt={3}>
          <Box style={{ width: "100px" }}>
            {weeklyPercentages.map((percentage, index) => (
              <div key={index}>
                <p
                  style={{
                    fontWeight: "bold",
                    margin: 0,
                    fontSize: isMobile ? "12px" : "16px",
                  }}
                >
                  Week {index + 1}:
                </p>
                <p
                  style={{ marginTop: 0, fontSize: isMobile ? "12px" : "16px" }}
                >
                  {percentage}%
                </p>
              </div>
            ))}
          </Box>

          <Box display="flex" justifyContent="center" width="100%" pt={1}>
            <ResponsiveContainer width="100%" height={isMobile ? 300 : 350}>
              <LineChart
                data={filteredData}
                margin={{
                  top: isMobile ? 5 : 20,
                  bottom: 40,
                  left: isMobile ? 5 : 40,
                  right: isMobile ? 10 : 40,
                }}
              >
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: isMobile ? "12px" : "16px" }}
                  style={{
                    fontFamily: "Roboto, sans-serif",
                    fontWeight: 400,
                  }}
                />
                <YAxis
                  type="number"
                  domain={[0, 10]}
                  ticks={[0, 2, 4, 6, 8, 10]}
                  tickFormatter={(tick) => `${tick}%`}
                  tick={{ fontSize: isMobile ? "12px" : "16px" }}
                  style={{
                    fontFamily: "Roboto, sans-serif",
                    fontWeight: 400,
                  }}
                />
                <Tooltip
                  content={<CustomTooltip selectedMonth={selectedMonth} />}
                />{" "}
                <Line
                  type="linear"
                  dataKey="rate"
                  stroke="black"
                  strokeWidth={1}
                  dot={<CustomDot />}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default Mortality;
