import React, { useEffect, useState } from "react";
import { Box, Container, Card } from "@mui/material";
import DeviceThermostatOutlinedIcon from "@mui/icons-material/DeviceThermostatOutlined";
import WaterDropOutlinedIcon from "@mui/icons-material/WaterDropOutlined";
import {
  database,
  databaseRef,
} from "../../../../core/firebase/firebase-camera";
import { onValue } from "firebase/database";
import { getAge } from "../../../../core/manage/ageManager";
import "../../../../core/style/Home.css";
import FeedWater from "./FeedWater";
import Mortality from "./Mortality";
import { useMediaQuery, useTheme } from "@mui/material";

const displayTemperature = (temperature, ageDays) => {
  if (isNaN(temperature) || isNaN(ageDays)) {
    return "Invalid Input";
  }

  const thresholds = {
    1: [29, 32],
    3: [27, 30],
    6: [25, 28],
    9: [25, 27],
    12: [25, 26],
    15: [24, 25],
  };

  const [low, high] = thresholds[ageDays] || [0, Infinity];

  if (temperature <= low) {
    return temperature + "°C - Low";
  } else if (temperature > low && temperature <= high) {
    return temperature + "°C - Normal";
  } else {
    return temperature + "°C - High";
  }
};

const displayHumidity = (humidity, ageDays) => {
  if (isNaN(humidity) || isNaN(ageDays)) {
    return "Invalid Input";
  }

  const thresholds = {
    1: [60, 70],
    3: [60, 70],
    6: [60, 70],
    9: [60, 70],
    12: [60, 70],
    15: [60, 70],
  };

  const [low, high] = thresholds[ageDays] || [0, Infinity];

  if (humidity < low) {
    return humidity + "% - Low";
  } else if (humidity >= low && humidity <= high) {
    return humidity + "% - Normal";
  } else {
    return humidity + "% - High";
  }
};

export default function HomeR() {
  const [temperature, setTemperature] = useState("Loading...");
  const [humidity, setHumidity] = useState("Loading...");
  const ageDays = getAge();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const tempRef = databaseRef(database, "DHT_11/Temperature");
    const humidityRef = databaseRef(database, "DHT_11/Humidity");

    // Listen for changes in temperature data
    const tempUnsubscribe = onValue(
      tempRef,
      (snapshot) => {
        const temp = snapshot.val();
        const displayTemp = displayTemperature(temp, ageDays);
        setTemperature(displayTemp);
      },
      (error) => {
        console.error("Error fetching temperature data:", error);
      }
    );

    // Listen for changes in humidity data
    const humidityUnsubscribe = onValue(
      humidityRef,
      (snapshot) => {
        const hum = snapshot.val();
        const displayHum = displayHumidity(hum, ageDays);
        setHumidity(displayHum);
      },
      (error) => {
        console.error("Error fetching humidity data:", error);
      }
    );

    // Clean up listeners on component unmount
    return () => {
      tempUnsubscribe();
      humidityUnsubscribe();
    };
  }, [ageDays]);

  return (
    <Container className="home-page">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          pt: 3,
          pb: 3,
          pr: { sm: 3, md: 3, lg: 6 },
          pl: { sm: 3, md: 3, lg: 6 },
          minHeight: "100vh",
          borderLeft: isMobile ? "none" : "3px solid",
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: { sm: 3, md: 3, lg: 5 },
            justifyContent: "center",
            flexWrap: "wrap",
            marginBottom: -5,
          }}
        >
          {[
            {
              title: "Temperature",
              subheader: temperature,
              icon: (
                <DeviceThermostatOutlinedIcon
                  sx={{
                    fontSize: { sm: 40, md: 50, lg: 50 },
                  }}
                />
              ),
            },
            {
              title: "Humidity",
              subheader: humidity,
              icon: (
                <WaterDropOutlinedIcon
                  sx={{
                    fontSize: { sm: 40, md: 45, lg: 45 },
                  }}
                />
              ),
            },
          ].map((card, index) => (
            <Card
              key={index}
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                width: { sm: 180, md: 220, lg: 300 },
                height: { sm: 80, md: 100, lg: 120 },
                padding: 2,
                borderRadius: "16px",
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Box sx={{ mr: 2 }}>{card.icon}</Box>
              <Box sx={{ textAlign: "center" }}>
                <p className="card-title" style={{ marginBottom: "4px" }}>
                  {card.title}
                </p>
                <p className="card-subheader" style={{ marginTop: "0px" }}>
                  {card.subheader}
                </p>
              </Box>
            </Card>
          ))}
        </Box>

        <Box
          sx={{
            borderRadius: "16px",
            p: isMobile ? 0 : 2,
            mb: -8,
          }}
        >
          <FeedWater />
        </Box>

        <Box
          sx={{
            borderRadius: "16px",
            p: isMobile ? 0 : 2,
          }}
        >
          <Mortality />
        </Box>
      </Box>
    </Container>
  );
}
