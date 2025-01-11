import React from "react";
import { Grid, Box, Stack } from "@mui/material";
import YearlyGrowthChart from "./UserGrowth";
import UserDistributionChart from "./UserDistribution";
import ManageAccount from "./ManageAccount";
import "../../../../core/style/Dashboard.css"; 
import { useMediaQuery, useTheme } from "@mui/material";
 
const AdminPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Check if screen is small (mobile)
 
  return (
    <Grid
      container
      spacing={4}
      className="chart-container"
      justifyContent="center"
      sx={{
        px: isMobile ? 2 : 10, 
        pt: isMobile ? 2 : 4, 
        display: "flex",
        alignItems: "stretch", 
        flexDirection: isMobile ? "column" : "row", 
      }}
    >
      {/* Left Column: Yearly Growth Chart */}
      <Grid
        item
        xs={12}
        md={8}
        justifyContent="center"
        sx={{
          display: "flex",
          flexDirection: "column",
          order: isMobile ? 2 : 1, 
        }}
      >
        <Stack spacing={4} sx={{ height: "100%" }}>
          {/* Yearly Growth Chart */}
          <Box sx={{ width: "100%", flexGrow: 1 }}>
            <YearlyGrowthChart />
          </Box>
        </Stack>
      </Grid>
 
      {/* Right Column: User Distribution Chart */}
      <Grid
        item
        xs={12}
        md={4}
        sx={{
          display: "flex",
          flexDirection: "column",
          order: isMobile ? 1 : 2, 
        }}
      >
        <Box
          sx={{
            width: "100%",
            flexGrow: 1,
            display: "flex",
            alignItems: "stretch",
          }}
        >
          <UserDistributionChart />
        </Box>
      </Grid>
 
      {/* Manage Account */}
      <Grid
        item
        xs={12}
        sx={{
          order: 3, 
          mt: isMobile ? -7 : 4, 
        }}
      >
        <ManageAccount />
      </Grid>
    </Grid>
  );
};
 
export default AdminPage;