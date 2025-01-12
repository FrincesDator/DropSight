import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Box, Card, CardContent, Stack, Typography, Divider } from "@mui/material";
import { db } from '../../../../core/firebase/firebase-config';
import { collection, getDocs } from 'firebase/firestore';
import "../../../../core/style/Dashboard.css";
import { useMediaQuery, useTheme } from "@mui/material";

const fullMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const abbreviatedMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const YearlyGrowthChart = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [data, setData] = useState([]);
  const [userDetails, setUserDetails] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userCreationData = Array(12).fill(null).map(() => []); 

        const farmOwnerSnapshot = await getDocs(collection(db, 'farmOwnerAccount'));
        const vetSnapshot = await getDocs(collection(db, 'veterinarianAccount'));

        const processUserData = (snapshot, userType) => {
          snapshot.forEach((doc) => {
            const userData = doc.data();
            if (userData.createdAt) {
              const createdAt = userData.createdAt.toDate();
              const month = createdAt.getMonth();
              userCreationData[month].push({
                name: `${userData.fName} ${userData.lName}`,
                createdAt: createdAt.toLocaleString(),
                userType,
              });
            }
          });
        };

        processUserData(farmOwnerSnapshot, 'Farm Owner');
        processUserData(vetSnapshot, 'Veterinarian');

        const chartData = (isMobile ? abbreviatedMonths : fullMonths).map((month, index) => ({
          name: month,
          value: userCreationData[index].length,
          details: userCreationData[index],
        }));

        setData(chartData);
      } catch (error) {
        console.error("Error fetching user data: ", error);
      }
    };

    fetchUserData();
  }, [isMobile]);

  const handlePointClick = (dataPoint) => {
    if (selectedMonth === dataPoint.name) {
      setSelectedMonth('');
      setUserDetails([]);
    } else {
      setSelectedMonth(dataPoint.name);
      setUserDetails(dataPoint.details);
    }
  };

  const customTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { name, value } = payload[0].payload;
      return (
        <div style={{ backgroundColor: 'white', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
          <p style={{ color: 'black', margin: 0 }}>
            Added <strong>{value}</strong> user(s) in <strong>{name}</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Box
      sx={{
        width: "100%",
        mx: "auto",
        display: "flex",
        justifyContent: "center",
        alignItems: 'flex-start',
      }}
    >
      <Card
        variant="elevation"
        elevation={2}
        sx={{
          borderRadius: "16px",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
          width: "100%",
          maxWidth: "800px",
        }}
      >
        <CardContent>
          <Stack spacing={2}>
            <p className="heading1">Yearly Growth Trend</p>
            <ResponsiveContainer width="100%" height={selectedMonth ? (isMobile ? 150 : 300) : (isMobile ? 200 : 350)}>
              <LineChart
                data={data}
                margin={{ top: isMobile ? 10 : 20, right: isMobile ? 0 : 10, left: isMobile ? -30 : 10, bottom: 20 }}
                onClick={(e) => {
                  if (e && e.activePayload && e.activePayload.length) {
                    handlePointClick(e.activePayload[0].payload);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                <XAxis
                  dataKey="name"
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  style={{ fontSize: isMobile ? '12px' : '15px' }}
                />
                <YAxis allowDecimals={false} style={{ fontSize: isMobile ? '12px' : '15px' }} />
                <Tooltip content={customTooltip} />
                <Line
                  type="linear"
                  dataKey="value"
                  stroke="#2D4746"
                  strokeWidth={3}
                  dot
                />
              </LineChart>
            </ResponsiveContainer>

            {selectedMonth && (
              <>
                <Divider sx={{ my: 2 }} />
                <Box>
                  <Typography variant="h6" gutterBottom>
                    User Details for {selectedMonth}
                  </Typography>
                  {userDetails.length > 0 ? (
                    userDetails.map((user, index) => (
                      <Typography key={index} style={{ marginBottom: '10px' }}>
                        {user.name} ({user.userType}) - Created At: {user.createdAt}
                      </Typography>
                    ))
                  ) : (
                    <Typography>No users for this month.</Typography>
                  )}
                </Box>
              </>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default YearlyGrowthChart;
