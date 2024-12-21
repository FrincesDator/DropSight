import * as React from "react";
import Grid from "@mui/material/Unstable_Grid2";
import HomeL from "./HomeL";
import HomeR from "./HomeR";
import { useMediaQuery, useTheme } from "@mui/material";

export default function Home() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Check if screen is small (mobile)

  return (
    <Grid container spacing={2}>
      {isMobile ? (
        <>
          <HomeL />
          <HomeR />
        </>
      ) : (
        <>
          <Grid item xs={4} md={4} lg={3}>
            <HomeL />
          </Grid>
          <Grid item xs={8} md={8} lg={9}>
            <HomeR />
          </Grid>
        </>
      )}
    </Grid>
  );
}
