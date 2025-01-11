import React, { useState, useEffect, useContext } from "react";
import {
  Grid,
  Box,
  Card,
  CardContent,
  Stack,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import "../../../../core/style/Dashboard.css";
import DailyWeekly from "./DailyWeekly";
import YearlyChart from "./Yearly";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { VetAppearanceContext } from "../settings/AppearanceContext";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../../core/firebase/firebase-config";
import DataDisplay from "./dataDisplay";
 
import goodBG from "../../../../assets/images/goodBG.png";
import alarmingBG from "../../../../assets/images/alarmingBG.png";
import warningBG from "../../../../assets/images/warningBG.png";
import arrowUp from "../../../../assets/images/arrowUp.png";
 
import { useMediaQuery, useTheme } from "@mui/material";
 
function Dashboard() {
  const [selectedFarm, setSelectedFarm] = useState("");
  const [selectedUserID, setSelectedUserID] = useState("");
  const [farms, setFarms] = useState([]);
  const [farmData, setFarmData] = useState({});
  const [totalMortality, setTotalMortality] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
 
 
  useEffect(() => {
    const fetchFarms = async () => {
      const farmSnapshot = await getDocs(collection(db, "farmOwnerAccount"));
      const farmList = farmSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFarms(farmList);
 
      if (farmList.length > 0) {
       
        setSelectedFarm(farmList[0].id);
      }
    };
 
    fetchFarms();
  }, []);
 
 
  const [healthStatus, setHealthStatus] = useState("healthy");
  const [disease, setDisease] = useState("");
 
  const backgroundImages = {
    healthy: goodBG,
    alarming: alarmingBG,
    warning: warningBG,
  };
 
 
  const statusText = {
    healthy: "HEALTHY!",
    alarming: "ALARMING!",
    warning: "WARNING!",
  };
 
 
  const statusDetails = {
    healthy: "The farm is in excellent condition with no signs of disease.",
    alarming: `An alarming amount of <b>${disease}</b> diseases has been classified.`,
    warning: `A few <b>${disease}</b> diseases have been classified. Attention needed.`,
  };
 
  useEffect(() => {
    if (!selectedFarm) return;
 
    const fetchFarmData = async () => {
      const farmDoc = farms.find((farm) => farm.id === selectedFarm);
      if (!farmDoc) return;
      setSelectedUserID(farmDoc.UserID);
      setFarmData({
        totalPopulation: farmDoc.totalPopulation || 0,
      });
 
     
      const metricsCollection = collection(
        db,
        `farmOwnerAccount/${farmDoc.id}/Metrics`
      );
      const metricsSnapshot = await getDocs(metricsCollection);
      let totalDeaths = 0;
 
      metricsSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.numberOfDeaths) {
          totalDeaths += data.numberOfDeaths;
        }
      });
 
      setTotalMortality(totalDeaths);
 
     
      const detectionCollectionRef = collection(
        db,
        `farmOwnerAccount/${farmDoc.id}/HealthData`
      );
      const q = query(
        detectionCollectionRef,
        where("UserID", "==", farmDoc.UserID)
      );
      const snapshot = await getDocs(q);
 
      const detectionCounts = {
        Healthy: 0,
        Coccidiosis: 0,
        Newcastle: 0,
        Salmonella: 0,
      };
 
      snapshot.forEach((doc) => {
        const data = doc.data();
        const detections = data.detectionsCount || {};
 
        detectionCounts.Healthy += detections.Healthy || 0;
        detectionCounts.Coccidiosis += detections["Coccidiosis-like"] || 0;
        detectionCounts.Newcastle += detections["NCD-like"] || 0;
        detectionCounts.Salmonella += detections["Salmonella-like"] || 0;
      });
 
      const maxCategory = Object.keys(detectionCounts).reduce((a, b) =>
        detectionCounts[a] > detectionCounts[b] ? a : b
      );
      setHealthStatus(maxCategory || "Unknown");
 
     
      const droppingsCollectionRef = collection(db, "detectedDroppings");
      const droppingsQuery = query(
        droppingsCollectionRef,
        where("UserID", "==", farmDoc.UserID)
      );
      const droppingsSnapshot = await getDocs(droppingsQuery);
 
      let totalDroppings = 0;
      let concerningDroppings = 0;
      const diseasesDetectedSet = new Set();
 
      droppingsSnapshot.forEach((doc) => {
        const data = doc.data();
        const detections = data.detectionsCount || {};
 
       
        totalDroppings += Object.values(detections).reduce(
          (sum, count) => sum + (count || 0),
          0
        );
 
       
        ["Salmonella-like", "NCD-like", "Coccidiosis-like"].forEach((key) => {
          if (detections[key]) {
            concerningDroppings += detections[key];
            diseasesDetectedSet.add(key.replace("-like", ""));
          }
        });
      });
 
      const uniqueDiseases = Array.from(diseasesDetectedSet).join(", ");
      setDisease(uniqueDiseases);
 
     
      if (concerningDroppings === 0) {
        setHealthStatus("healthy");
      } else if (
        concerningDroppings >=
        (totalDroppings - concerningDroppings) / 2
      ) {
        setHealthStatus("alarming");
      } else {
        setHealthStatus("warning");
      }
    };
 
    fetchFarmData();
  }, [selectedFarm, farms]);
 
  const cardStyle = {
    width: "700px",
    height: "250px",
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
    color: "#fff",
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
 
 
  const [isHovered, setIsHovered] = useState(false);
  const [isBottomHovered, setIsBottomHovered] = useState(false);
 
  const arrowStyle = {
    width: "25px",
    position: "absolute",
    bottom: "7px",
    left: "28px",
    transform: "translateX(-50%)",
    cursor: "pointer",
    transition: "all 0.3s ease",
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
 
 
  const renderData = (data) => {
    return data || "No data";
  };
 
  const handleFarmChange = (event) => {
    setSelectedFarm(event.target.value);
  };
 
  const { primaryColor } = useContext(VetAppearanceContext);
  const textColor =
    primaryColor === "#2D4746" || primaryColor === "#EF6068"
      ? "white"
      : "black";
 
  return (
    <div>
      <Box sx={{ padding: "30px 40px 10px 40px" }}>
       
        <Box sx={{ marginBottom: 4 }}>
          <Grid container item xs={12} justifyContent="Right">
            <FormControl variant="outlined" sx={{ width: 350 }}>
              <InputLabel id="farm-select-label">Select Farm</InputLabel>
              <Select
                labelId="farm-select-label"
                id="farm-select"
                value={selectedFarm}
                onChange={handleFarmChange}
                label="Select Farm"
              >
                {farms.map((farm) => (
                  <MenuItem key={farm.id} value={farm.id}>
                    {farm.farmName || `${farm.id}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Box>
 
       
        <Box sx={{ marginBottom: 4 }}>
          <Grid
            item
            xs={12}
            container
            spacing={isMobile ? 1 : 2}
            alignItems="center"
            justifyContent={isMobile ? "flex-start" : "center"}
          >
           
            <Grid
              item
              xs={12}
              md={isMobile ? 12 : 6}
              sx={{ marginBottom: isMobile ? 2 : 0 }}
            >
              <div
                style={{
                  ...cardStyle,
                  width: isMobile ? "100%" : cardStyle.width,
                }}
              >
                <h3 style={isHovered ? titleHoverStyle : titleStyle}>
                  {statusText[healthStatus]}
                </h3>
                <p style={isHovered ? subtitleHoverStyle : subtitleStyle}>
                  FARM HEALTH STATUS
                </p>
                <div
                  style={
                    isHovered ? bottomBarHoverStyle : bottomBarContainerStyle
                  }
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
                    style={
                      isHovered ? bottomBarTextVisibleStyle : bottomBarTextStyle
                    }
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
            </Grid>
 
           
            <Grid
              item
              xs={12}
              md={6}
              sx={{
                width: "100%",
                margin: "0 auto",
              }}
            >
              <Stack
                spacing={2}
                direction={isMobile ? "row" : "column"}
                justifyContent={isMobile ? "space-between" : "center"}
                alignItems={isMobile ? "center" : "stretch"}
                sx={{
                  flexWrap: isMobile ? "nowrap" : "wrap",
                }}
              >
                <Card
                  key="Mortality"
                  variant="elevation"
                  elevation={2}
                  sx={{
                    boxShadow: "0px 6px 16px rgba(0, 0, 0, 0.1)",
                    height: 110,
                    lineHeight: 1,
                    borderRadius: "16px",
                    width: isMobile ? "48%" : "100%",
                    maxWidth: "350px",
                  }}
                >
                  <CardContent>
                    <p className="heading3">Mortality</p>
                    <p className="simple-text">{renderData(totalMortality)}</p>
                  </CardContent>
                </Card>
                <Card
                  key="Chicken Population"
                  variant="elevation"
                  elevation={2}
                  sx={{
                    boxShadow: "0px 6px 16px rgba(0, 0, 0, 0.1)",
                    height: 110,
                    lineHeight: 1,
                    borderRadius: "16px",
                    width: isMobile ? "48%" : "100%",
                    maxWidth: "350px",
                  }}
                >
                  <CardContent>
                    <p className="heading3">Chicken Population</p>
                    <p className="simple-text">
                      {renderData(farmData.totalPopulation)}
                    </p>
                  </CardContent>
                </Card>
              </Stack>
            </Grid>
          </Grid>
        </Box>
 
       
        <Box sx={{ marginBottom: 4 }}>
          <Grid item xs={12}>
            <Stack spacing={2}>
              <DataDisplay selectedUserID={selectedUserID} />
            </Stack>
          </Grid>
        </Box>
 
       
        <Box sx={{ marginBottom: 4 }}>
          <Grid item xs={12}>
            <Stack spacing={5} direction="row">
              <DailyWeekly selectedFarm={selectedUserID} />
            </Stack>
          </Grid>
        </Box>
 
       
        <Box sx={{ marginBottom: 4 }}>
          <Grid item xs={12}>
            <Stack spacing={5} direction="row">
              <YearlyChart selectedFarm={selectedUserID} />
            </Stack>
          </Grid>
        </Box>
      </Box>
    </div>
  );
}
 
export default Dashboard;