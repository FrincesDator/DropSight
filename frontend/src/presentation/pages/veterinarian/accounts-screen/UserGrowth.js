import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Box, Card, CardContent, Stack } from "@mui/material";
import { db } from '../../../../core/firebase/firebase-config'; 
import { collection, getDocs } from 'firebase/firestore'; 
import "../../../../core/style/Dashboard.css"; 
import { useMediaQuery, useTheme } from "@mui/material"; 
 
// Full months for display
const fullMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
 
// Abbreviated months for mobile display
const abbreviatedMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
 
const YearlyGrowthChart = () => {
  // Use hooks inside the component body
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Check if screen is small (mobile)
 
  const [data, setData] = useState([]);
 
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userCreationData = Array(12).fill(0);
 
        const farmOwnerSnapshot = await getDocs(collection(db, 'farmOwnerAccount'));
 
        const vetSnapshot = await getDocs(collection(db, 'veterinarianAccount'));
 
        const processUserData = (snapshot) => {
          snapshot.forEach((doc) => {
            const userData = doc.data();
            if (userData.createdAt) {
              const createdAt = userData.createdAt.toDate(); 
              const month = createdAt.getMonth(); 
              userCreationData[month] += 1; 
            }
          });
        };
 
        processUserData(farmOwnerSnapshot);
        processUserData(vetSnapshot);
 
        const chartData = (isMobile ? abbreviatedMonths : fullMonths).map((month, index) => ({
          name: month,
          value: Math.round(userCreationData[index]), 
        }));
 
        setData(chartData); 
 
      } catch (error) {
        console.error("Error fetching user data: ", error);
      }
    };
 
    fetchUserData();
  }, [isMobile]); 
 
  const customTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const month = payload[0].payload.name; 
      const value = payload[0].value; 
      return (
        <div style={{ backgroundColor: 'white', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
          <p style={{ color: 'black', margin: 0, fontWeight: "normal" }}>
            Added <strong>{value}</strong> number of user/s in <strong>{month}</strong>
          </p>
        </div>
      );
    }
    return null;
  };
 
  return (
    <Box
      borderColor="grey.300"
      display="flex"
      sx={{
        width: "100%",
        mx: "auto",
        justifyContent: isMobile ? 'center' : 'flex-start', 
        alignItems: 'center', 
      }}
    >
      <Card
        variant="elevation"
        elevation={2}
        sx={{ borderRadius: "16px", boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)", flex: 1 }}
      >
        <CardContent>
          <Stack spacing={2}>
            <p className="heading1">Yearly Growth Trend</p>
            <ResponsiveContainer width="100%" height={isMobile ? 200 : 350}> 
              <LineChart data={data} margin={{ top: isMobile ? 10 : 20, right: isMobile ? 0 : 10, left: isMobile ? -30 : 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                <XAxis
                  dataKey="name"
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  style={{ fontSize: isMobile ? '12px' : '15px' }}
                />
                <YAxis allowDecimals={false} style={{ fontSize: isMobile ? '12px' : '15px' }}/>
                <Tooltip content={customTooltip} />
                <Line
                  type="linear"
                  dataKey="value"
                  stroke="#2D4746"
                  strokeWidth={3}
                  dot={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};
 
export default YearlyGrowthChart;
 