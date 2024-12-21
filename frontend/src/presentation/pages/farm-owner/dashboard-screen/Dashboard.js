import React, { useState, useEffect, useContext } from "react";
import { Grid, Box, Card, CardContent, Stack, CardMedia, Typography, useMediaQuery } from "@mui/material";
import "../../../../core/style/Dashboard.css";
import DailyWeekly from "./DailyWeekly";
import MonthlyChart from "./Monthly";
import YearlyChart from "./Yearly";
import MLdisplay from "./MLdisplay";
import axios from "axios";
import { FarmAppearanceContext } from "../settings/AppearanceContext";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../../core/firebase/firebase-config";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import rainy from "../../../../assets/images/rainy.png";
import sunny from "../../../../assets/images/sunny.png";
import snowy from "../../../../assets/images/snowy.png";
import cloudy from "../../../../assets/images/cloudy.png";
import rainyBackground from "../../../../assets/gif/rainy.gif";
import cloudyBackground from "../../../../assets/gif/cloudy.gif";
import snowyBackground from "../../../../assets/gif/snowy.gif";
import sunnyBackground from "../../../../assets/gif/sunny.gif";
import humidityIcon from "../../../../assets/images/humidity.png";
import windIcon from "../../../../assets/images/wind.png";
import chickenPop from "../../../../assets/images/chickenPop.png";
import totalMortalityImage from "../../../../assets/images/totalMortality.png";
import goodBG from "../../../../assets/images/goodBG.png";
import alarmingBG from "../../../../assets/images/alarmingBG.png";
import warningBG from "../../../../assets/images/warningBG.png";
import arrowUp from "../../../../assets/images/arrowUp.png";
 
function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date()); // For Calendar
  const [healthTitle, setHealthTitle] = useState("Unknown");
  const [weather, setWeather] = useState({
    temp: null,
    description: "",
    wind: null,
    humidity: null,
  });
  const [totalPopulation, setTotalPopulation] = useState(0); // State for total chicken population
  const [totalMortality, setTotalMortality] = useState(0); // State for total mortality
 
  const API_KEY = "1b08a4d06c786690477c4230fcc4a1ae";
  const city = "Lucena, PH";
 
  // Fetch the total chicken population from Firestore
  useEffect(() => {
    const fetchTotalPopulation = async () => {
      const storedUser = localStorage.getItem("loggedInUser");
      if (!storedUser) return;
 
      const userData = JSON.parse(storedUser);
      const q = query(
        collection(db, "farmOwnerAccount"),
        where("UserID", "==", userData.UserID)
      );
 
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0].data();
        if (docSnap.totalPopulation) {
          setTotalPopulation(docSnap.totalPopulation);
        } else {
          console.log("No totalPopulation field in document.");
        }
      } else {
        console.log("No matching document found.");
      }
    };
 
    fetchTotalPopulation();
  }, []);
 
  useEffect(() => {
    const fetchTotalMortality = async () => {
      const storedUser = localStorage.getItem("loggedInUser");
      if (!storedUser) return;
 
      const userData = JSON.parse(storedUser);
 
      // First, get the farmOwnerAccount document for the user
      const q = query(
        collection(db, "farmOwnerAccount"),
        where("UserID", "==", userData.UserID)
      );
 
      const userSnapshot = await getDocs(q);
      if (!userSnapshot.empty) {
        const userDoc = userSnapshot.docs[0]; // Get the first matching document
        const userDocId = userDoc.id; // Document ID to access the nested Metrics collection
 
        // Now query the nested Metrics collection
        const metricsCollection = collection(
          db,
          `farmOwnerAccount/${userDocId}/Metrics`
        );
        const metricsSnapshot = await getDocs(metricsCollection);
        let totalDeaths = 0;
 
        metricsSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.numberOfDeaths) {
            totalDeaths += data.numberOfDeaths; // Summing up the deaths
          }
        });
 
        setTotalMortality(totalDeaths); // Set the total mortality state
      } else {
        console.log("No user document found for the specified UserID.");
      }
    };
 
    fetchTotalMortality();
  }, []); // Empty dependency array to run this once after the initial render
 
  // State for health status and disease
  const [healthStatus, setHealthStatus] = useState("healthy");
  const [disease, setDisease] = useState("");
 
  // Map health status to corresponding background images
  const backgroundImages = {
    healthy: goodBG,
    alarming: alarmingBG,
    warning: warningBG,
  };
 
  // Map health status to corresponding titles
  const statusText = {
    healthy: "HEALTHY!",
    alarming: "ALARMING!",
    warning: "WARNING!",
  };
 
  // Map health status to corresponding details, including disease (bolded)
  const statusDetails = {
    healthy: "The farm is in excellent condition with no signs of disease.",
    alarming: `An alarming amount of <b>${disease}</b> diseases has been classified.`,
    warning: `A few <b>${disease}</b> diseases have been classified. Attention needed.`,
  };
 
  useEffect(() => {
    const fetchHealthStatus = async () => {
      const storedUser = localStorage.getItem("loggedInUser");
      if (!storedUser) return;
 
      const userData = JSON.parse(storedUser);
 
      // Query the `detectedDroppings` collection for the user's data
      const droppingsCollectionRef = collection(db, "detectedDroppings");
      const q = query(
        droppingsCollectionRef,
        where("UserID", "==", userData.UserID)
      );
      const snapshot = await getDocs(q);
 
      let totalDroppings = 0;
      let concerningDroppings = 0;
      const diseasesDetectedSet = new Set(); // To store unique diseases
 
      // Aggregate detection counts
      snapshot.forEach((doc) => {
        const data = doc.data();
        const detections = data.detectionsCount || {};
 
        totalDroppings += Object.values(detections).reduce(
          (sum, count) => sum + (count || 0),
          0
        );
 
        ["Salmonella-like", "NCD-like", "Coccidiosis-like"].forEach((key) => {
          if (detections[key]) {
            concerningDroppings += detections[key];
            diseasesDetectedSet.add(key.replace("-like", "")); // Add unique disease name
          }
        });
      });
 
      // Convert unique diseases into a comma-separated string
      const uniqueDiseases = Array.from(diseasesDetectedSet).join(", ");
      setDisease(uniqueDiseases);
 
      // Determine health status
      if (concerningDroppings === 0) {
        setHealthStatus("healthy");
      } else if (concerningDroppings >= (totalDroppings - concerningDroppings) / 2) {
        setHealthStatus("alarming");
      } else {
        setHealthStatus("warning");
      }
    };
 
    fetchHealthStatus();
  }, []);
 
  const cardStyle = {
    width: "658px",
    height: "200px",
    backgroundImage: `url(${backgroundImages[healthStatus]})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    position: "relative",
    transition: "all 0.3s ease",
    color: "#fff", // Consistent white text color
  };
 
  const bottomBarContainerStyle = {
    width: "100%",
    height: "20px",
    backgroundColor: "#F5F5F5",
    position: "absolute",
    bottom: "0",
    borderBottomLeftRadius: "8px",
    borderBottomRightRadius: "8px",
    transition: "height 0.3s ease",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  };
 
  const bottomBarHoverStyle = {
    ...bottomBarContainerStyle,
    height: "80px",
  };
 
  const titleStyle = {
    fontSize: "25px",
    marginBottom: "8px",
    transition: "all 0.3s ease",
  };
 
  const titleHoverStyle = {
    ...titleStyle,
    fontSize: "35px",
    transform: "translateY(-10px)",
  };
 
  const subtitleStyle = {
    fontSize: "15px",
    opacity: 1,
    transition: "opacity 0.3s ease",
  };
 
  const subtitleHoverStyle = {
    ...subtitleStyle,
    opacity: 0,
  };
 
  const bottomBarTextStyle = {
    fontSize: "14px",
    color: "#333",
    opacity: 0,
    transition: "opacity 0.3s ease",
  };
 
  const bottomBarTextVisibleStyle = {
    ...bottomBarTextStyle,
    opacity: 1,
  };
 
  // State for hover effect
  const [isHovered, setIsHovered] = useState(false);
  const [isBottomHovered, setIsBottomHovered] = useState(false);
 
 
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );
        const data = await response.json();
 
        if (response.ok) {
          setWeather({
            temp: data.main.temp,
            description: data.weather[0].description,
            wind: data.wind.speed,
            humidity: data.main.humidity,
          });
        } else {
          console.error("Error fetching weather data:", data.message);
        }
      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    };
 
    fetchWeather();
  }, [city, API_KEY]);
 
  const getWeatherIcon = (description) => {
    if (!description) return null;
 
    const lowerCaseDescription = description.toLowerCase().trim();
 
    if (lowerCaseDescription.includes("rain")) {
      return <img width="50" height="50" src={rainy} alt="rain" />;
    } else if (lowerCaseDescription.includes("cloud")) {
      return <img width="50" height="50" src={cloudy} alt="clouds" />;
    } else if (
      lowerCaseDescription.includes("sun") ||
      lowerCaseDescription.includes("clear")
    ) {
      return <img width="50" height="50" src={sunny} alt="sun" />;
    } else if (lowerCaseDescription.includes("snow")) {
      return <img width="50" height="50" src={snowy} alt="snow" />;
    } else {
      return <img width="50" height="50" src={cloudy} alt="default" />;
    }
  };
 
  const cardBackgroundStyle = {
    background: `url(${weather.description.toLowerCase().includes("rain")
      ? rainyBackground
      : weather.description.toLowerCase().includes("cloud")
        ? cloudyBackground
        : weather.description.toLowerCase().includes("snow")
          ? snowyBackground
          : weather.description.toLowerCase().includes("sun")
            ? sunnyBackground
            : rainyBackground
      }) no-repeat center center`,
    backgroundSize: "cover",
    width: "680px",
    height: "300px",
    borderRadius: "16px",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
  };
 
  const arrowStyle = {
    width: "25px", // Adjust the size of the arrow image
    position: "absolute",
    bottom: "7px", // Position it near the bottom of the card
    left: "28px", // Center it horizontally
    transform: "translateX(-50%)", // Correct centering offset
    cursor: "pointer", // Indicate interactivity
    transition: "all 0.3s ease", // Smooth transition for the movement
  };
 
  const bottomCardStyle = {
    backgroundColor: "white",
    width: "100%",
    height: "80px",
    borderBottomLeftRadius: "16px",
    borderBottomRightRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 20px",
  };
 
  const textSectionStyle = {
    display: "flex",
    flexDirection: "column", // Stack elements vertically
    alignItems: "flex-start", // Align to the left
    marginLeft: "40px",
  };
 
  const iconSectionStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginRight: "40px",
  };
 
  const { primaryColor } = useContext(FarmAppearanceContext);
  const textColor =
    primaryColor === "#2D4746" || primaryColor === "#EF6068"
      ? "white"
      : "black";
 
      const isMobile = useMediaQuery('(max-width: 600px)');
 
      return (
        <div>
          {/* Main Box with padding and borders */}
          <Box
            sx={{
              marginTop: -10,
              paddingLeft: { xs: "0px", sm: "20px" },
              paddingRight: { xs: "0px", sm: "20px" },
              paddingTop: "90px",
              borderLeft: "20px solid transparent",
              borderRight: "20px solid transparent",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <Grid container spacing={2} justifyContent="center" sx={{ padding: 2 }}>
              {/* Weather Card */}
              <Grid item xs={12} md={6}>
                {isMobile ? (
                  // Mobile view for Weather Card (Left-aligned with stacked content)
                  <Card
                    sx={{
                      ...cardBackgroundStyle,
                      width: "100%", // Full width on small screens
                      height: "auto", // Adjust height for mobile
                      padding: "16px", // Adjust padding for mobile
                      display: "flex", // Flex layout for stacking content
                      flexDirection: "column", // Stack content vertically
                      alignItems: "flex-start", // Align content to the left
                    }}
                  >
                    <Box sx={textSectionStyle}>
                      <Typography
                        variant="h4"
                        component="div"
                        sx={{
                          fontSize: "22px", // Smaller font size for mobile
                          marginBottom: "8px", // Adjust margin for mobile
                         
                        }}
                      >
                        {weather.temp !== null ? `${weather.temp}°` : "Loading..."}
                      </Typography>
                    </Box>
     
                    {/* Wind and Humidity Info */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column", // Stack wind and humidity vertically
                        alignItems: "flex-start", // Left-align
                        marginBottom: "8px", // Adjust margin for mobile
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", marginBottom: "4px" }}>
                        <img
                          src={windIcon}
                          alt="wind"
                          width="20"
                          height="20"
                          style={{ marginRight: "8px" }}
                        />
                        <Typography variant="body2" sx={{ color: "black", fontSize: "14px" }}>
                          {weather.wind} m/s
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <img
                          src={humidityIcon}
                          alt="humidity"
                          width="20"
                          height="20"
                          style={{ marginRight: "8px" }}
                        />
                        <Typography variant="body2" sx={{ color: "black", fontSize: "14px" }}>
                          {weather.humidity}%
                        </Typography>
                      </Box>
                    </Box>
     
                    {/* Weather Icon and Description */}
                    <Box sx={iconSectionStyle}>
                      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        {getWeatherIcon(weather.description)}
                        <Typography variant="body2" sx={{ color: "black", fontSize: "14px", marginTop: "8px" }}>
                          {weather.description}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                ) : (
                  // Desktop view for Weather Card (Original code)
                  <Card
                    sx={{
                      ...cardBackgroundStyle,
                      width: { xs: "100%", sm: "100%", md: "680px" }, // Full width on small screens
                      height: { xs: "250px", sm: "300px" }, // Adjust height for smaller screens
                    }}
                  >
                    <Card sx={{ ...bottomCardStyle, height: { xs: "60px", md: "80px" } }} elevation={0}>
                      <Box sx={textSectionStyle}>
                        <Typography
                          variant="h4"
                          component="div"
                          sx={{
                            fontSize: { xs: "25px", md: "35px" }, // Smaller font for small screens
                          }}
                        >
                          {weather.temp !== null ? `${weather.temp}°` : "Loading..."}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          marginBottom: "8px",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", marginBottom: "4px" }}>
                          <img
                            src={windIcon}
                            alt="wind"
                            width="20"
                            height="20"
                            style={{ marginRight: "8px" }}
                          />
                          <Typography variant="body2" sx={{ color: "gray", fontSize: "12px" }}>
                            {weather.wind} m/s
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <img
                            src={humidityIcon}
                            alt="humidity"
                            width="20"
                            height="20"
                            style={{ marginRight: "8px" }}
                          />
                          <Typography variant="body2" sx={{ color: "gray", fontSize: "12px" }}>
                            {weather.humidity}%
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={iconSectionStyle}>
                        {getWeatherIcon(weather.description)}
                        <Typography variant="body2" sx={{ color: "gray", fontSize: "12px" }}>
                          {weather.description}
                        </Typography>
                      </Box>
                    </Card>
                  </Card>
                )}
              </Grid>
     
              {/* Health Status and Stats */}
              <Grid item xs={12} md={6}>
                <Stack spacing={2} direction="column" sx={{ width: "100%" }}>
                  {/* Health Status */}
                  <div
                    style={{
                      ...cardStyle,
                      width: "100%", // Full width for smaller screens
                      height: isMobile ? "180px" : "200px", // Adjust height for mobile
                    }}
                  >
                    <h3 style={isHovered ? titleHoverStyle : titleStyle}>
                      {statusText[healthStatus]}
                    </h3>
                    <p style={isHovered ? subtitleHoverStyle : subtitleStyle}>FARM HEALTH STATUS</p>
                    <div
                      style={isHovered ? bottomBarHoverStyle : bottomBarContainerStyle}
                      onMouseEnter={() => {
                        setIsHovered(true);
                        setIsBottomHovered(true);
                      }}
                      onMouseLeave={() => {
                        setIsHovered(false);
                        setIsBottomHovered(false);
                      }}
                    >
                      <span
                        style={isHovered ? bottomBarTextVisibleStyle : bottomBarTextStyle}
                        dangerouslySetInnerHTML={{
                          __html: statusDetails[healthStatus],
                        }}
                      ></span>
                    </div>
                    <img
                      src={arrowUp}
                      alt="Scroll Indicator"
                      style={{
                        ...arrowStyle,
                        bottom: isBottomHovered ? "67px" : "7px",
                      }}
                    />
                  </div>
     
                  {/* Mortality and Population */}
                  <Stack
                    spacing={2}
                    direction={{ xs: "column", md: "row" }}  // Column layout on mobile, row on desktop
                    sx={{ width: "100%" }}
                  >
                    {[
                      { title: "Mortality", value: totalMortality, image: totalMortalityImage },
                      { title: "Population", value: totalPopulation, image: chickenPop }
                    ].map(({ title, value, image }) => (
                      <Card
                        className="chart-container"
                        key={title}
                        variant="elevation"
                        elevation={2}
                        sx={{
                          borderRadius: "16px",
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                          transition: "0.3s",
                          width: { xs: "100%", sm: "48%" }, // 100% width for mobile, 48% for desktop
                          height: "85px",
                          padding: 2,
                          marginBottom: isMobile ? "10px" : "0px", // Add margin for mobile
                        }}
                      >
                        <Box sx={{ textAlign: "left", flex: 1 }}>
                          <p className="heading3">{title}</p>
                          <p className="heading4">{value}</p>
                        </Box>
     
                        <CardMedia
                          component="img"
                          sx={{
                            width: 60,
                            height: 60,
                            objectFit: "contain",
                            marginLeft: 2,
                          }}
                          image={image}
                          alt={title}
                        />
                      </Card>
                    ))}
                  </Stack>
                </Stack>
              </Grid>
     
              {/* Additional Sections */}
              <Grid item xs={12}>
                <Stack spacing={5} direction="row">
                  <MLdisplay />
                </Stack>
              </Grid>
     
              <Grid item xs={12}>
                <Stack spacing={5} direction="row">
                  <DailyWeekly />
                </Stack>
              </Grid>
     
              {/* Monthly and Yearly Charts */}
              <Grid item xs={12}>
                <Stack
                  spacing={5}
                  direction={{ xs: "column", md: "row" }}  // Stack vertically on small screens, horizontally on medium screens and up
                >
                  <MonthlyChart />
                  <YearlyChart />
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </div>
      );
     
 
}
 
export default Dashboard;