import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Card,
  CardMedia,
  Container,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../../../core/firebase/firebase-config";
import { getAge, setAge } from "../../../../core/manage/ageManager";
import feedIntakeImage from "../../../../assets/images/feedIntake.png";
import mortalityImage from "../../../../assets/images/mortality.png";
import waterIntakeImage from "../../../../assets/images/waterIntake.png";
import ageImage from "../../../../assets/images/age.png";
import weightImage from "../../../../assets/images/weight.png";
import { Fab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { FarmAppearanceContext } from "../../farm-owner/settings/AppearanceContext";
import {
  calculateMortalityRate,
  displayMortalityRate,
  displayWaterIntake,
  displayFeedIntake,
  displayAverageWeight,
} from "./calculations";
import { useMediaQuery, useTheme } from "@mui/material";

export default function HomeL() {
  const { primaryColor } = useContext(FarmAppearanceContext);
  const textColor =
    primaryColor === "#2D4746" || primaryColor === "#EF6068"
      ? "white"
      : "black";
  const [cardData, setCardData] = useState({
    numberOfDeaths: "No Deaths",
    age: getAge(),
    waterIntake: "No Input",
    feedIntake: "No Input",
    averageWeight: "No Input",
  });

  const [totalPopulation, setTotalPopulation] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState("");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Check if screen is small (mobile)

  // Fetch the user data from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("loggedInUser");
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
  }, []);

  // Fetch the total population based on the user's farm account
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userData || !userData.UserID) return;

      // Query to find the document with the matching UserID in the farmOwnerAccount collection
      const q = query(
        collection(db, "farmOwnerAccount"),
        where("UserID", "==", userData.UserID)
      );

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        const docSnap = querySnapshot.docs[0].data();

        if (docSnap.totalPopulation) {
          setTotalPopulation(docSnap.totalPopulation);
        } else {
          console.log("No totalPopulation field in document.");
        }

        return docRef;
      } else {
        console.log("No matching document found.");
      }
    };

    fetchUserData();
  }, [userData]);

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!userData || !userData.UserID) return;

      let unsubscribe = null;

      try {
        const q = query(
          collection(db, "farmOwnerAccount"),
          where("UserID", "==", userData.UserID)
        );

        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const userDocRef = querySnapshot.docs[0].ref;

          const metricsQuery = query(
            collection(userDocRef, "Metrics"),
            orderBy("timestamp", "desc"),
            limit(1)
          );

          unsubscribe = onSnapshot(metricsQuery, (snapshot) => {
            if (!snapshot.empty) {
              const latestData = snapshot.docs[0].data();
              setAge(latestData.age || "No Input");
              setLastUpdated(
                latestData.timestamp
                  ? new Date(
                      latestData.timestamp.seconds * 1000
                    ).toLocaleString()
                  : "Unknown"
              );

              setCardData({
                numberOfDeaths: latestData.numberOfDeaths ?? "No Deaths",
                age: latestData.age ?? "No Input",
                waterIntake: latestData.waterIntake || "No Input",
                feedIntake: latestData.feedIntake || "No Input",
                averageWeight: latestData.averageWeight || "No Input",
              });
            }
          });
        } else {
          console.log("No matching document found in farmOwnerAccount.");
        }
      } catch (error) {
        console.error("Error fetching metrics: ", error);
      }

      return unsubscribe;
    };

    const unsubscribeFn = fetchMetrics();

    return () => {
      if (typeof unsubscribeFn === "function") {
        unsubscribeFn();
      }
    };
  }, [userData]);

  const handleKeyDown = async (event) => {
    if (event.key === "Enter") {
      setIsEditing(false);
      event.preventDefault();

      if (!userData || !userData.UserID) return;

      const q = query(
        collection(db, "farmOwnerAccount"),
        where("UserID", "==", userData.UserID)
      );

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;

        try {
          await updateDoc(docRef, {
            totalPopulation: totalPopulation,
          });
        } catch (error) {
          console.error("Error updating total population: ", error);
        }
      } else {
        console.log("No matching document found.");
      }
    }
  };

  return (
    <Container className="home-page">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          padding: 2,
          width: "100%",
        }}
      >
        <p
          className="heading1"
          style={{ marginBottom: "-10px", marginTop: "10px" }}
        >
          Daily Metrics
        </p>

        <Box marginBottom="-30px">
          <TextField
            id="total-population"
            label="Total Population"
            variant="outlined"
            fullWidth
            value={totalPopulation}
            onChange={(e) => setTotalPopulation(e.target.value)}
            disabled={!isEditing}
            InputLabelProps={{
              className: "textbox-font",
            }}
            InputProps={{
              className: "textbox-font",
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setIsEditing(true)}
                    edge="end"
                    sx={{
                      color: "#A1A5B0",
                      transform: isMobile ? "scale(0.8)" : "scale(1)",
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            onKeyDown={handleKeyDown}
            sx={{ marginBottom: 2, borderRadius: "8px" }}
          />
        </Box>

        <Box>
          <p
            className="timestamp-text"
            style={{ marginBottom: isMobile ? "-10px" : "10px" }}
          >
            Last updated: {lastUpdated}
          </p>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: isMobile ? "row" : "column",
            flexWrap: "wrap",
            gap: isMobile ? 1.5 : 2.5,
            justifyContent: "center",
            alignItems: "center",
            margin: "0 auto",
          }}
        >
          {[
            {
              title: "Mortality Rate",
              subheader: displayMortalityRate(
                calculateMortalityRate(
                  Number(cardData.numberOfDeaths),
                  Number(totalPopulation)
                )
              ),
              image: mortalityImage,
            },
            {
              title: "Age",
              subheader: `${cardData.age} day/s old`,

              image: ageImage,
            },
            {
              title: "Water Intake",
              subheader: displayWaterIntake(
                parseFloat(cardData.waterIntake),
                Number(cardData.age),
                Number(totalPopulation)
              ),
              image: waterIntakeImage,
            },
            {
              title: "Feed Intake",
              subheader: displayFeedIntake(
                parseFloat(cardData.feedIntake),
                Number(cardData.age),
                Number(totalPopulation)
              ),
              image: feedIntakeImage,
            },
            {
              title: "Average Weight",
              subheader: displayAverageWeight(
                parseFloat(cardData.waterIntake),
                Number(cardData.age),
                Number(totalPopulation)
              ),
              image: weightImage,
            },
          ].map((card, index) => (
            <Card
              key={index}
              variant="elevation"
              elevation={2}
              sx={{
                borderRadius: "16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 2,
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                transition: "0.3s",
                width: isMobile ? "calc(50% - .5rem)" : "100%",
                marginBottom: isMobile ? -1 : 2,
              }}
            >
              <Box sx={{ textAlign: "left" }}>
                <p className="card-title" style={{ marginBottom: "4px" }}>
                  {card.title}
                </p>
                <p className="card-subheader" style={{ marginTop: "0px" }}>
                  {card.subheader}
                </p>
              </Box>
              {card.image && (
                <CardMedia
                  component="img"
                  sx={{
                    width: isMobile ? "30%" : 60,
                    height: isMobile ? "30%" : 60,
                    objectFit: "contain",
                  }}
                  image={card.image}
                  alt={card.title}
                />
              )}
            </Card>
          ))}
        </Box>

        <Box sx={{ position: "fixed", bottom: 16, right: 16 }}>
          <Link to="/f/metrics" style={{ textDecoration: "none" }}>
            <Fab
              variant="extended"
              color="primary"
              sx={{
                backgroundColor: primaryColor,
                "&:hover": { backgroundColor: "white" },
                color: textColor,
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
              }}
            >
              <AddIcon sx={{ marginRight: 1 }} /> Metrics
            </Fab>
          </Link>
        </Box>
      </Box>
    </Container>
  );
}
