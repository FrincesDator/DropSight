import React from "react";
import Account from "./Account";
import Appearance from "./Appearance";
import Help from "./Help";
import Grid from "@mui/material/Unstable_Grid2";
import { useMediaQuery, useTheme } from "@mui/material";

const Settings = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Detect if the screen is small

  return (
    <Grid container spacing={5} sx={{ maxWidth: "95%", margin: "0 auto" }}>
      {/* Left side: Appearance, Account, Security */}
      <Grid
        item
        xs={isMobile ? 12 : 6}
        sx={{ display: "flex", flexDirection: "column", gap: "20px" }}
      >
        <Appearance />
        <Account />
      </Grid>

      {/* Right side: Help */}
      <Grid
        item
        xs={isMobile ? 12 : 6}
        sx={{ display: "flex", flexDirection: "column", gap: "20px" }}
      >
        <Help />
      </Grid>
    </Grid>
  );
};

export default Settings;
