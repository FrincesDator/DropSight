import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Box, Card, CardContent, Stack, Typography, List, ListItem, ListItemText } from "@mui/material";
import { db } from '../../../../core/firebase/firebase-config';
import { collection, getDocs } from 'firebase/firestore';
import "../../../../core/style/Dashboard.css";
import { useMediaQuery, useTheme } from "@mui/material";

const COLORS = ['#2D4746', '#E95E2D'];

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
    >
      {`${value}`}
    </text>
  );
};

const UserDistributionChart = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [pieData, setPieData] = useState([
    { name: 'Farm Owner', value: 0 },
    { name: 'Veterinarian', value: 0 },
  ]);

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const farmOwnerSnapshot = await getDocs(collection(db, 'farmOwnerAccount'));
        const veterinarianSnapshot = await getDocs(collection(db, 'veterinarianAccount'));

        setPieData([
          { name: 'Farm Owner', value: farmOwnerSnapshot.size },
          { name: 'Veterinarian', value: veterinarianSnapshot.size },
        ]);
      } catch (error) {
        console.error('Error fetching data from Firestore: ', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const farmOwnersCollection = collection(db, "farmOwnerAccount");
        const veterinariansCollection = collection(db, "veterinarianAccount");

        const [farmOwnersDocs, veterinariansDocs] = await Promise.all([
          getDocs(farmOwnersCollection),
          getDocs(veterinariansCollection),
        ]);

        const fetchedUsers = [
          ...farmOwnersDocs.docs.map((doc) => ({
            userType: "Farm Owner",
            Password: doc.data().Password,
            UserID: doc.data().UserID,
            address: doc.data().address,
            chickenHouseType: doc.data().chickenHouseType,
            numHouse: doc.data().numHouse,
            capacity: doc.data().capacity,
            contactNum: doc.data().contactNum,
            email: doc.data().email,
            fName: doc.data().fName,
            farmName: doc.data().farmName,
            lName: doc.data().lName,
          })),
          ...veterinariansDocs.docs.map((doc) => ({
            userType: "Veterinarian",
            Password: doc.data().Password,
            UserID: doc.data().UserID,
            cNum: doc.data().cNum,
            email: doc.data().email,
            fName: doc.data().fName,
            lName: doc.data().lName,
            lNum: doc.data().lNum,
            validDate: doc.data().validDate,
          })),
        ];

        setUsers(fetchedUsers);
        console.log('Fetched Users:', fetchedUsers);
      } catch (error) {
        console.error("Error fetching users: ", error);
      }
    };

    fetchUsers();
  }, []);

  const handlePieClick = (data) => {
    if (data && data.name) {
      const category = selectedCategory === data.name ? null : data.name;
      setSelectedCategory(category);
      setFilteredUsers(category ? users.filter(user => user.userType === category) : []);
    }
  };

  const customTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { name, value } = payload[0];
      return (
        <div style={{ backgroundColor: 'white', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
          <p style={{ color: 'black', margin: 0, fontWeight: "normal" }}>
            {name}: <strong>{value}</strong> user/s
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Box borderColor="grey.300" display="flex" sx={{ width: "100%" }}>
      <Card
        variant="elevation"
        elevation={2}
        sx={{ borderRadius: "16px", boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)", flex: 1 }}
      >
        <CardContent>
          <Stack spacing={2}>
            <p className="heading1">User Distribution</p>
            <ResponsiveContainer width="100%" height={selectedCategory ? (isMobile ? 150 : 200) : (isMobile ? 250 : 350)}>
              <PieChart margin={{ top: -30, bottom: 5 }}>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={selectedCategory ? (isMobile ? 55 : 70) : (isMobile ? 100 : 150)}
                  label={renderCustomLabel}
                  labelLine={false}
                  onClick={handlePieClick}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" align="center" height={2} />
                <Tooltip content={customTooltip} />
              </PieChart>
            </ResponsiveContainer>
            {selectedCategory && (
              <Box>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  {`Users in ${selectedCategory}`}
                </Typography>
                <List>
                  {filteredUsers.map((user, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={`${user.fName} ${user.lName}`}
                        secondary={`Email: ${user.email}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default UserDistributionChart;
