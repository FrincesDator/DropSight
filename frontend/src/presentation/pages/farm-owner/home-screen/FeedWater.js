import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { collection, query, where, getDocs } from "firebase/firestore";
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
import { db } from "../../../../core/firebase/firebase-config";

const getWeekLabel = (startOfWeek, weekIndex) => {
  const startMonth = startOfWeek.toLocaleString("default", { month: "short" });
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  const endMonth = endOfWeek.toLocaleString("default", { month: "short" });

  return startMonth === endMonth
    ? `${startMonth}: Week ${weekIndex}`
    : `${startMonth}-${endMonth}: Week ${weekIndex}`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const [day, month] = label.split("-").map(Number);
    const formattedDate = new Date(2024, month - 1, day).toLocaleString(
      "default",
      {
        month: "long",
        day: "numeric",
      }
    );

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
        {payload.map((entry, index) => (
          <p
            key={index}
            style={{ color: "#000", margin: 0, fontWeight: "normal" }}
          >
            {`${entry.name}: ${entry.value} ${
              entry.name === "Feed Intake" ? "Kilograms" : "Litres"
            }`}
          </p>
        ))}
      </div>
    );
  }

  return null;
};

const MyBarChart = () => {
  const [feedIntakeData, setFeedIntakeData] = useState([]);
  const [waterIntakeData, setWaterIntakeData] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [availableWeeks, setAvailableWeeks] = useState([]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Detect if the screen is small

  useEffect(() => {
    const storedUser = localStorage.getItem("loggedInUser");
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!userData) return;

      try {
        const userRef = collection(db, "farmOwnerAccount");
        const userQuery = query(
          userRef,
          where("UserID", "==", userData.UserID)
        );
        const userSnapshot = await getDocs(userQuery);

        let earliestDate = null;
        const feedData = [];
        const waterData = [];
        const weeksWithData = new Map();

        for (const doc of userSnapshot.docs) {
          const metricsRef = collection(doc.ref, "Metrics");
          const metricsSnapshot = await getDocs(metricsRef);

          metricsSnapshot.forEach((metricDoc) => {
            const data = metricDoc.data();
            const recordDate = data.timestamp.toDate();

            if (!earliestDate || recordDate < earliestDate) {
              earliestDate = recordDate;
            }
          });
        }

        // If no records exist, exit early
        if (!earliestDate) return;

        // Set the first day of Week 1
        const startOfFirstWeek = new Date(
          earliestDate.getFullYear(),
          earliestDate.getMonth(),
          earliestDate.getDate()
        );

        // Re-fetch data to categorize by week
        for (const doc of userSnapshot.docs) {
          const metricsRef = collection(doc.ref, "Metrics");
          const metricsSnapshot = await getDocs(metricsRef);

          metricsSnapshot.forEach((metricDoc) => {
            const data = metricDoc.data();
            const recordDate = data.timestamp.toDate();

            // Calculate the week number since the start of records
            const daysSinceStart = Math.floor(
              (recordDate - startOfFirstWeek) / (1000 * 60 * 60 * 24)
            );
            const weekIndex = Math.floor(daysSinceStart / 7) + 1;

            // Generate week label
            const startOfWeek = new Date(
              startOfFirstWeek.getFullYear(),
              startOfFirstWeek.getMonth(),
              startOfFirstWeek.getDate() + 7 * (weekIndex - 1)
            );
            const weekLabel = getWeekLabel(startOfWeek, weekIndex);

            // Store week labels and categorize data by selected week
            if (!weeksWithData.has(weekIndex)) {
              weeksWithData.set(weekIndex, weekLabel);
            }

            const formattedDate = `${recordDate.getDate()}-${
              recordDate.getMonth() + 1
            }`;

            if (selectedWeek === null || selectedWeek === weekIndex) {
              feedData.push({
                date: formattedDate,
                Kilograms: data.feedIntake,
              });
              waterData.push({ date: formattedDate, Litres: data.waterIntake });
            }
          });
        }

        const sortByDate = (data) => {
          return data.sort((a, b) => {
            const [dayA, monthA] = a.date.split("-").map(Number);
            const [dayB, monthB] = b.date.split("-").map(Number);
            if (monthA === monthB) {
              return dayA - dayB; // Compare days if the months are the same
            }
            return monthA - monthB; // Compare months otherwise
          });
        };

        const sortedFeedData = sortByDate(feedData);
        const sortedWaterData = sortByDate(waterData);

        setFeedIntakeData(sortedFeedData);
        setWaterIntakeData(sortedWaterData);

        const weeksList = Array.from(weeksWithData.entries()).map(
          ([weekIndex, weekLabel]) => ({
            weekIndex,
            weekLabel,
          })
        );
        setAvailableWeeks(weeksList);

        // Set the selected week to the first available week if not already set
        if (selectedWeek === null && weeksList.length > 0) {
          setSelectedWeek(weeksList[0].weekIndex);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [userData, selectedWeek]);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <Container className="home-page">
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
          <p className="heading1">Feed and Water Intake</p>
          <FormControl
            variant="outlined"
            sx={{ width: { sm: 200, md: 200, lg: 250 } }}
          >
            <InputLabel id="select-label" className="textbox-font">
              Select Week
            </InputLabel>
            <Select
              labelId="select-label"
              id="select"
              label="Select Week"
              className="textbox-font"
              onChange={(e) => setSelectedWeek(e.target.value)}
              value={selectedWeek}
            >
              {availableWeeks.map(({ weekIndex, weekLabel }) => (
                <MenuItem key={weekIndex} value={weekIndex}>
                  {weekLabel}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box
          display="flex"
          flexDirection={isMobile ? "column" : "row"}
          justifyContent="center"
          width="100%"
          pt={1}
        >
          <ResponsiveContainer
            width={isMobile ? "100%" : "48%"}
            height={isMobile ? 200 : 350}
          >
            <BarChart
              data={feedIntakeData}
              margin={{ right: 10, left: 10, bottom: 12 }}
            >
              <XAxis
                dataKey="date"
                interval={0}
                label={{
                  value: "Date",
                  position: "insideBottom",
                  offset: -10,
                  fontSize: isMobile ? "12px" : "16px",
                }}
                tick={{ fontSize: isMobile ? "12px" : "16px" }}
              />
              <YAxis
                label={{
                  value: "Kilograms",
                  fontSize: isMobile ? "12px" : "16px",
                  angle: -90,
                  position: "insideLeft",
                }}
                tick={{ fontSize: isMobile ? "12px" : "16px" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={isMobile ? 40 : 75} />
              <Bar
                dataKey="Kilograms"
                fill="#B5C6A5"
                name="Feed Intake"
                label={{
                  position: "top",
                  offset: 20,
                  style: { fontSize: isMobile ? "12px" : "16px" },
                }}
              />
            </BarChart>
          </ResponsiveContainer>
          <ResponsiveContainer
            width={isMobile ? "100%" : "48%"}
            height={isMobile ? 200 : 350}
          >
            <BarChart
              data={waterIntakeData}
              margin={{ right: 10, left: 10, bottom: 12 }}
            >
              <XAxis
                dataKey="date"
                interval={0}
                label={{
                  value: "Date",
                  position: "insideBottom",
                  offset: -10,
                  fontSize: isMobile ? "12px" : "16px",
                }}
                tick={{ fontSize: isMobile ? "12px" : "16px" }}
              />
              <YAxis
                label={{
                  value: "GalLitresons",
                  fontSize: isMobile ? "12px" : "16px",
                  angle: -90,
                  position: "insideLeft",
                }}
                tick={{ fontSize: isMobile ? "12px" : "16px" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={isMobile ? 40 : 75} />
              <Bar
                dataKey="Litres"
                fill="#00BFFF"
                name="Water Intake"
                label={{
                  position: "top",
                  offset: 20,
                  style: { fontSize: isMobile ? "12px" : "16px" },
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    </Container>
  );
};

export default MyBarChart;
