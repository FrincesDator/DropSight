import React, { useEffect, useContext } from "react";
import { db } from "./../../../../core/firebase/firebase-config";
import { VetAppearanceContext } from "./AppearanceContext";
import { getDoc, doc, setDoc } from "firebase/firestore";
import {
  Container,
  Box,
  Grid,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  MenuItem,
  Card,
  CardContent,
  FormLabel,
  useMediaQuery,
  useTheme,
} from "@mui/material";

const AppearancePage = () => {
  const { theme, setTheme, primaryColor, setPrimaryColor, colorOptions } =
    useContext(VetAppearanceContext);
  const theme2 = useTheme();
  const isMobile = useMediaQuery(theme2.breakpoints.down("sm")); // Detect if the screen is small

  useEffect(() => {
    const storedUser = localStorage.getItem("loggedInUser");

    if (storedUser) {
      const userData = JSON.parse(storedUser);
      const userID = userData.UserID;

      const fetchAppearanceSettings = async () => {
        const userRef = doc(db, "appearanceSettings", userID);

        try {
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            const { theme, primaryColor } = docSnap.data();
            setTheme(theme);
            setPrimaryColor(primaryColor);

            document.documentElement.setAttribute("data-theme", theme);
            document.body.style.setProperty("--primary-color", primaryColor);
          } else {
            await setDoc(userRef, {
              theme: "light",
              primaryColor: "#FFFFFF",
            });

            document.documentElement.setAttribute("data-theme", "light");
            document.body.style.setProperty("--primary-color", "#FFFFFF");
          }
        } catch (error) {
          console.error("Error fetching appearance settings:", error);
        }
      };

      fetchAppearanceSettings();
    }
  }, [setTheme, setPrimaryColor]);

  // Function to update appearance settings in Firestore
  const updateAppearanceSettings = async (newTheme, newPrimaryColor) => {
    const storedUser = localStorage.getItem("loggedInUser");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      const userID = userData.UserID;
      const userRef = doc(db, "appearanceSettings", userID); // Use appearanceSettings collection

      try {
        // Update Firestore with new settings
        await setDoc(
          userRef,
          {
            theme: newTheme,
            primaryColor: newPrimaryColor,
          },
          { merge: true }
        );
      } catch (error) {
        console.error("Error updating appearance settings:", error);
      }
    }
  };

  // Update Firestore whenever the theme or primary color changes
  const handleThemeChange = (event) => {
    const newTheme = event.target.value;
    setTheme(newTheme);
    updateAppearanceSettings(newTheme, primaryColor);
  };

  const handlePrimaryColorChange = (event) => {
    const newPrimaryColor = event.target.value;
    setPrimaryColor(newPrimaryColor);
    updateAppearanceSettings(theme, newPrimaryColor);
  };

  const colorBoxStyle = (color) => ({
    width: 16,
    height: 16,
    borderRadius: "50%",
    backgroundColor: color,
    display: "inline-block",
    marginRight: 8,
    border: "1px solid #ddd",
  });

  return (
    <Container className="settings-page">
      <Box>
        <Card variant="elevation" elevation={2} className="settings-card">
          <CardContent>
            <p className="heading1">Appearance Settings</p>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl component="fieldset" fullWidth margin="normal">
                  <FormLabel className="heading2">Change Theme</FormLabel>
                  <RadioGroup row value={theme} onChange={handleThemeChange}>
                    <FormControlLabel
                      value="light"
                      control={<Radio />}
                      label="Light"
                      sx={{
                        transform: isMobile ? "scale(0.8)" : "scale(1)",
                      }}
                      className="textbox-font"
                    />
                    <FormControlLabel
                      value="dark"
                      control={<Radio />}
                      label="Dark"
                      sx={{
                        transform: isMobile ? "scale(0.8)" : "scale(1)",
                      }}
                      className="textbox-font"
                    />
                  </RadioGroup>
                </FormControl>

                <FormControl component="fieldset" fullWidth margin="normal">
                  <FormLabel className="heading2">App Bar Color</FormLabel>
                  <TextField
                    select
                    value={primaryColor}
                    onChange={handlePrimaryColorChange}
                    variant="outlined"
                    fullWidth
                    InputProps={{ className: "textbox-font" }}
                  >
                    {colorOptions.map((color, index) => (
                      <MenuItem
                        key={index}
                        value={color}
                        className="textbox-font"
                      >
                        <Box sx={colorBoxStyle(color)} />
                        {color === "#FFFFFF" && "White"}
                        {color === "#EF6068" && "Red"}
                        {color === "#F5CB5C" && "Yellow"}
                        {color === "#2D4746" && "Green"}
                        {color !== "#FFFFFF" &&
                          color !== "#EF6068" &&
                          color !== "#F5CB5C" &&
                          color !== "#2D4746" &&
                          color}
                      </MenuItem>
                    ))}
                  </TextField>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default AppearancePage;
