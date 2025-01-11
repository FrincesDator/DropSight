import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer,
} from "recharts";
import {
  Container,
  MenuItem,
  Select,
  FormControl,
  Box,
  InputLabel,
  Card,
  Table,
  TableBody,
  TableCell,
  TableRow,
  CardContent,
  Stack,
} from "@mui/material";
import "../../../../core/style/Dashboard.css";
import { db } from "../../../../core/firebase/firebase-config";
import { collection, query, where, getDocs } from "firebase/firestore";

const fetchMonthlyData = async (month) => {
  const storedUser = localStorage.getItem("loggedInUser");
  const parsedUser = storedUser ? JSON.parse(storedUser) : null;
  const userId = parsedUser?.UserID;

  if (!userId) return [];

  const droppingsCollectionRef = collection(db, "detectedDroppings");
  const q = query(droppingsCollectionRef, where("UserID", "==", userId));
  const snapshot = await getDocs(q);

  const rawData = [];
  snapshot.forEach((doc) => {
    const data = doc.data();
    const date = data.date.toDate ? data.date.toDate() : new Date(data.date);
    const detections = data.detectionsCount || {};

    // Filter data by the selected month
    const monthName = date.toLocaleString("default", { month: "long" });
    if (monthName === month) {
      rawData.push({
        Healthy: detections.Healthy || 0,
        Salmonella: detections["Salmonella-like"] || 0,
        Newcastle: detections["NCD-like"] || 0,
        Coccidiosis: detections["Coccidiosis-like"] || 0,
      });
    }
  });

  const aggregatedData = rawData.reduce(
    (acc, curr) => {
      acc.Healthy += curr.Healthy;
      acc.Salmonella += curr.Salmonella;
      acc.Newcastle += curr.Newcastle;
      acc.Coccidiosis += curr.Coccidiosis;
      return acc;
    },
    { Healthy: 0, Salmonella: 0, Newcastle: 0, Coccidiosis: 0 }
  );

  if (
    aggregatedData.Healthy === 0 &&
    aggregatedData.Salmonella === 0 &&
    aggregatedData.Newcastle === 0 &&
    aggregatedData.Coccidiosis === 0
  ) {
    return [];
  }

  return [
    { name: "Healthy", value: aggregatedData.Healthy },
    { name: "Salmonella-like", value: aggregatedData.Salmonella },
    { name: "NCD-like", value: aggregatedData.Newcastle },
    { name: "Coccidiosis-like", value: aggregatedData.Coccidiosis },
  ];
};

const getAvailableMonths = async () => {
  const storedUser = localStorage.getItem("loggedInUser");
  const parsedUser = storedUser ? JSON.parse(storedUser) : null;
  const userId = parsedUser?.UserID;

  if (!userId) return [];

  const droppingsCollectionRef = collection(db, "detectedDroppings");
  const q = query(droppingsCollectionRef, where("UserID", "==", userId));
  const snapshot = await getDocs(q);

  const monthsWithData = new Set();

  snapshot.forEach((doc) => {
    const data = doc.data();
    const date = data.date.toDate ? data.date.toDate() : new Date(data.date);
    const monthName = date.toLocaleString("default", { month: "long" });
    monthsWithData.add(monthName);
  });

  return [...monthsWithData];
};

const COLORS = ["#4A7F2C", "#FFC107", "#F44336", "#0288D1"];
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
  value,
}) => {
  if (value === 0) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CustomLegend = ({ payload, showDrillDownData }) => {
  const legendFontSize = showDrillDownData ? "12px" : "14px";

  return (
    <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
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
              backgroundColor: entry.payload.fill,
              width: 12,
              height: 12,
              borderRadius: "50%",
              marginRight: 5,
            }}
          />
          <span
            style={{
              fontSize: legendFontSize,
              fontWeight: "600",
              color: "#333",
            }}
          >
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0].payload;

    return (
      <div
        style={{
          background: "#fff",
          padding: "10px",
          border: "1px solid #ccc",
        }}
      >
        <p style={{ color: "#000", margin: 0, fontWeight: "normal" }}>
          {`${value} case/s of ${name}`}
        </p>
      </div>
    );
  }
  return null;
};

const MonthlyChart = () => {
  const [selectedMonth, setSelectedMonth] = useState("");
  const [monthlyData, setMonthlyData] = useState([]);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [drillDownData, setDrillDownData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isCategorySelected, setIsCategorySelected] = useState(false);

  useEffect(() => {
    const fetchAvailableMonths = async () => {
      const monthsWithData = await getAvailableMonths();
      const sortedMonths = monthsWithData.sort((a, b) => {
        return months.indexOf(a) - months.indexOf(b);
      });
      setAvailableMonths(sortedMonths);
    };
    fetchAvailableMonths();
  }, []);

  useEffect(() => {
    if (availableMonths.length > 0) {
      setSelectedMonth(availableMonths[0]);
    }
  }, [availableMonths]);

  useEffect(() => {
    if (selectedMonth) {
      const fetchData = async () => {
        const data = await fetchMonthlyData(selectedMonth);
        setMonthlyData(data);
      };
      fetchData();
    }
  }, [selectedMonth]);

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const handlePieClick = async (data) => {
    if (data) {
      const { name } = data;
      if (isCategorySelected && selectedCategory === name) {
        setDrillDownData([]);
        setIsCategorySelected(false);
        setSelectedCategory("");
      } else {
        const detailedData = await fetchDetailedData(selectedMonth, name);
        console.log("Detailed data fetched:", detailedData);
        setDrillDownData(detailedData);
        setSelectedCategory(name);
        setIsCategorySelected(true);
      }
    }
  };

  const fetchDetailedData = async (month, category) => {
    const storedUser = localStorage.getItem("loggedInUser");
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    const userId = parsedUser?.UserID;

    if (!userId) return [];

    const droppingsCollectionRef = collection(db, "detectedDroppings");
    const q = query(droppingsCollectionRef, where("UserID", "==", userId));
    const snapshot = await getDocs(q);

    const detailedData = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      const date = data.date.toDate ? data.date.toDate() : new Date(data.date);
      const detections = data.detectionsCount || {};

      const monthName = date.toLocaleString("default", { month: "long" });
      if (monthName === month && detections[category] > 0) {
        detailedData.push({
          dateProcessed: date.toLocaleDateString(),
          temperature: data.temp || "N/A",
          humidity: data.humidity || "N/A",
        });
      }
    });

    return detailedData;
  };

  return (
    <Box
      borderColor="grey.300"
      display="flex"
      sx={{ width: { xs: "100%", sm: "50%", md: "35%" } }}
    >
      <Card
        variant="elevation"
        elevation={2}
        sx={{
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
          flex: 1,
          borderRadius: "16px",
        }}
      >
        <CardContent>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={1}
            mb="0"
          >
            <Container className="chart-container">
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={-3}
                borderColor="grey.300"
                width="100%"
              >
                <p className="heading1">Monthly Overall Health Score</p>
                <FormControl
                  variant="outlined"
                  sx={{ width: { sm: 200, md: 200, lg: 250 } }}
                >
                  <InputLabel id="month-select-label" className="textbox-font">
                    Month
                  </InputLabel>
                  <Select
                    labelId="month-select-label"
                    id="month-select"
                    value={selectedMonth}
                    onChange={handleMonthChange}
                    label="Month"
                    className="textbox-font"
                  >
                    {availableMonths.map((month, index) => (
                      <MenuItem key={index} value={month}>
                        {month}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Container>
          </Stack>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Container className="chart-container">
              <ResponsiveContainer
                width={drillDownData.length > 0 ? "80%" : "100%"}
                height={drillDownData.length > 0 ? 300 : 300}
              >
                <PieChart>
                  <Pie
                    data={monthlyData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={drillDownData.length > 0 ? 80 : 120}
                    labelLine={false}
                    fill="#8884d8"
                    label={renderCustomizedLabel}
                    onClick={(data) => handlePieClick(data)}
                  >
                    {monthlyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    content={
                      <CustomLegend
                        showDrillDownData={drillDownData.length > 0}
                      />
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            </Container>
          </Box>
          {drillDownData.length > 0 && (
            <Box mt={4}>
              <p style={{ color: "#000", margin: 0, fontWeight: "bold" }}>
                {`Details for ${selectedCategory}`}
              </p>
              <Table>
                <TableBody>
                  {drillDownData.map((data, index) => (
                    <React.Fragment key={index}>
                      <TableRow>
                        <TableCell>{`Case ${index + 1} Details:`}</TableCell>
                        <TableCell>{`Date: ${data.dateProcessed}`}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Temperature</TableCell>
                        <TableCell>{data.temperature} °C</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Humidity</TableCell>
                        <TableCell>{data.humidity} °C</TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default MonthlyChart;
