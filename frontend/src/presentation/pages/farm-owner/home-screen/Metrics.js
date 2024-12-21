import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  FilledInput,
  InputAdornment,
  Box,
  Grid,
  Button,
  FormControl,
  Container,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  collection,
  addDoc,
  getDoc,
  setDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../../../../core/firebase/firebase-config";
import { FarmAppearanceContext } from "../settings/AppearanceContext";

const Metrics = ({ onSubmit = () => {} }) => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({
    age: "",
    waterIntake: "",
    feedIntake: "",
    averageWeight: "",
    numberOfDeaths: "",
  });
  const [totalPopulation, setTotalPopulation] = useState("");
  const [userData, setUserData] = useState(null);
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
  const [openErrorDialog, setOpenErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  const handleSuccessDialogOpen = () => setOpenSuccessDialog(true);
  const handleSuccessDialogClose = () => {
    setOpenSuccessDialog(false);
    navigate("/f/home");
  };

  const handleErrorDialogOpen = (message) => {
    setErrorMessage(message);
    setOpenErrorDialog(true);
  };
  const handleErrorDialogClose = () => setOpenErrorDialog(false);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Detect if the screen is small

  // Fetch user data from local storage
  useEffect(() => {
    const storedUser = localStorage.getItem("loggedInUser");
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
  }, []);

  // Fetch total population
  useEffect(() => {
    const fetchTotalPopulation = async () => {
      try {
        // Ensure userData is loaded before proceeding
        if (!userData || !userData.UserID) {
          handleErrorDialogOpen("User data not available.");
          return;
        }

        // Query the farmOwnerAccount collection to find the user's document
        const userMetricsQuery = query(
          collection(db, "farmOwnerAccount"),
          where("UserID", "==", userData.UserID)
        );
        const userMetricsSnapshot = await getDocs(userMetricsQuery);

        if (userMetricsSnapshot.empty) {
          handleErrorDialogOpen("No user document found.");
          return;
        }

        // Get the user's document reference
        const userDocRef = userMetricsSnapshot.docs[0].ref;

        // Fetch the user's totalPopulation
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setTotalPopulation(userDocSnap.data().totalPopulation || "");
        } else {
          handleErrorDialogOpen(
            "User document does not have total population."
          );
        }
      } catch (error) {
        handleErrorDialogOpen("Error fetching total population.");
      }
    };

    // Only fetch once the userData is available
    if (userData) {
      fetchTotalPopulation();
    }
  }, [userData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (Number(value) < 0) {
      handleErrorDialogOpen("Negative values are not allowed.");
      return;
    }

    setMetrics({
      ...metrics,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const age = Number(metrics.age);
    const waterIntake = Number(metrics.waterIntake);
    const feedIntake = Number(metrics.feedIntake);
    const averageWeight = Number(metrics.averageWeight);
    const numberOfDeaths = Number(metrics.numberOfDeaths);

    const totalPopulationNumber = Number(totalPopulation);
    if (numberOfDeaths > totalPopulationNumber) {
      handleErrorDialogOpen("Number of deaths cannot exceed total population.");
      return;
    }

    if (
      isNaN(age) ||
      isNaN(waterIntake) ||
      isNaN(feedIntake) ||
      isNaN(averageWeight) ||
      isNaN(numberOfDeaths)
    ) {
      handleErrorDialogOpen("Please enter valid numbers for all fields.");
      return;
    }

    try {
      const newTotalPopulation = Number(totalPopulation) - numberOfDeaths;

      // Query the user document to get reference
      const userMetricsQuery = query(
        collection(db, "farmOwnerAccount"),
        where("UserID", "==", userData.UserID)
      );
      const userMetricsSnapshot = await getDocs(userMetricsQuery);
      const userDocRef = userMetricsSnapshot.docs[0]?.ref;

      if (userDocRef) {
        await setDoc(
          userDocRef,
          { totalPopulation: newTotalPopulation.toString() },
          { merge: true }
        );

        await addDoc(collection(userDocRef, "Metrics"), {
          age,
          waterIntake,
          feedIntake,
          averageWeight,
          numberOfDeaths,
          totalPopulation: Number(totalPopulation),
          timestamp: new Date(),
        });

        setTotalPopulation(newTotalPopulation.toString());

        handleSuccessDialogOpen();
        onSubmit(metrics); 
      } else {
        throw new Error("User document not found.");
      }
    } catch (error) {
      handleErrorDialogOpen("Error saving metrics, please try again.");
    }
  };

  useEffect(() => {
    if (!userData) return;

    const fetchLatestMetric = async () => {
      try {
        const userMetricsQuery = query(
          collection(db, "farmOwnerAccount"),
          where("UserID", "==", userData.UserID)
        );

        const userMetricsSnapshot = await getDocs(userMetricsQuery);

        if (!userMetricsSnapshot.empty) {
          const userDocRef = userMetricsSnapshot.docs[0].ref;

          const metricsQuery = query(
            collection(userDocRef, "Metrics"),
            orderBy("timestamp", "desc"),
            limit(1)
          );

          const unsubscribe = onSnapshot(metricsQuery, (snapshot) => {
            if (!snapshot.empty) {
              const latestMetric = snapshot.docs[0].data();
              setLastUpdated(
                latestMetric.timestamp
                  ? new Date(
                      latestMetric.timestamp.seconds * 1000
                    ).toLocaleString()
                  : "Unknown"
              );
            }
          });

          return () => unsubscribe();
        } else {
          setLastUpdated("No metrics available.");
        }
      } catch (error) {
        console.error("Error fetching latest metric:", error);
        setLastUpdated("Error fetching timestamp.");
      }
    };

    fetchLatestMetric();
  }, [userData]);

  useEffect(() => {
    const fetchEarliestMetric = async () => {
      if (!userData) return;

      try {
        const userMetricsQuery = query(
          collection(db, "farmOwnerAccount"),
          where("UserID", "==", userData.UserID)
        );

        const userMetricsSnapshot = await getDocs(userMetricsQuery);

        if (!userMetricsSnapshot.empty) {
          const userDocRef = userMetricsSnapshot.docs[0].ref;

          const metricsQuery = query(
            collection(userDocRef, "Metrics"),
            orderBy("timestamp", "asc"),
            limit(1)
          );

          const earliestSnapshot = await getDocs(metricsQuery);
          if (!earliestSnapshot.empty) {
            const earliestMetric = earliestSnapshot.docs[0].data();
            const earliestDate = new Date(
              earliestMetric.timestamp.seconds * 1000
            );
            const today = new Date();
            const ageInDays = Math.floor(
              (today - earliestDate) / (1000 * 60 * 60 * 24) + 1
            );

            setMetrics((prevMetrics) => ({
              ...prevMetrics,
              age: ageInDays.toString(),
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching earliest metric:", error);
      }
    };

    fetchEarliestMetric();
  }, [userData]);

  const { primaryColor } = useContext(FarmAppearanceContext);
  const textColor =
    primaryColor === "#2D4746" || primaryColor === "#EF6068"
      ? "white"
      : "black";

  return (
    <Container className="home-page">
      <Box
        sx={{
          paddingLeft: isMobile ? 2 : 30,
          paddingRight: isMobile ? 2 : 30,
          paddingTop: 3,
          paddingBottom: 3, 
        }}
      >
        <Card
          variant="outlined"
          sx={{
            flex: 1,
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
            padding: isMobile ? 0.5 : 3,
          }}
        >
          <CardContent
            sx={{
              marginTop: -5,
            }}
          >
            <p className="heading1" style={{ marginBottom: -20 }}>
              Monitoring Form
            </p>
            <p className="simple-text2">
              Record and track key metrics related to your livestock on a daily
              basis.
            </p>

            <form onSubmit={handleSubmit}>
              <FormControl sx={{ m: 1, width: "100%" }} variant="filled">
                <p className="heading3">Age</p>
                <FilledInput
                  name="age"
                  onChange={handleChange}
                  disabled
                  endAdornment={
                    <InputAdornment position="end">
                      <span className="txtfield-normal">
                        {metrics.age} days
                      </span>
                    </InputAdornment>
                  }
                  sx={{ height: { xs: 45, md: 45, lg: 60 } }}
                />
              </FormControl>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <FormControl sx={{ m: 1, width: "100%" }} variant="filled">
                    <p className="heading3">Feed Intake</p>
                    <FilledInput
                      name="feedIntake"
                      value={metrics.feedIntake}
                      onChange={handleChange}
                      endAdornment={
                        <InputAdornment>
                          <p className="txtfield-normal">kilograms</p>
                        </InputAdornment>
                      }
                      sx={{ height: { xs: 45, md: 45, lg: 60 } }}
                    />
                  </FormControl>
                </Grid>

                <Grid item xs={6}>
                  <FormControl sx={{ m: 1, width: "100%" }} variant="filled">
                    <p className="heading3">Water Intake</p>
                    <FilledInput
                      name="waterIntake"
                      value={metrics.waterIntake}
                      onChange={handleChange}
                      endAdornment={
                        <InputAdornment>
                          <p className="txtfield-normal">litres</p>
                        </InputAdornment>
                      }
                      sx={{ height: { xs: 45, md: 45, lg: 60 } }}
                    />
                  </FormControl>
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <FormControl sx={{ m: 1, width: "100%" }} variant="filled">
                    <p className="heading3">Average Weight</p>
                    <FilledInput
                      name="averageWeight"
                      value={metrics.averageWeight}
                      onChange={handleChange}
                      endAdornment={
                        <InputAdornment>
                          <p className="txtfield-normal">kilograms</p>
                        </InputAdornment>
                      }
                      sx={{ height: { xs: 45, md: 45, lg: 60 } }}
                    />
                  </FormControl>
                </Grid>

                <Grid item xs={6}>
                  <FormControl sx={{ m: 1, width: "100%" }} variant="filled">
                    <p className="heading3">Number of Deaths</p>
                    <FilledInput
                      name="numberOfDeaths"
                      value={metrics.numberOfDeaths}
                      onChange={handleChange}
                      endAdornment={
                        <InputAdornment>
                          <p className="txtfield-normal">heads</p>
                        </InputAdornment>
                      }
                      sx={{ height: { xs: 45, md: 45, lg: 60 } }}
                    />
                  </FormControl>
                </Grid>
              </Grid>

              <Box display="flex" justifyContent="center" mt={2}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  className="home-button"
                  style={{
                    "--primary-color": primaryColor,
                    "--text-color": textColor,
                  }}
                >
                  Save and Continue
                </Button>
              </Box>
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                style={{ marginBottom: "10px", textAlign: "center" }}
              >
                <p className="timestamp-text">Last updated: {lastUpdated}</p>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Box>

      {/* Success Dialog */}
      <Dialog open={openSuccessDialog} onClose={handleSuccessDialogClose}>
        <DialogTitle>Success</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Metrics have been successfully updated!
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSuccessDialogClose} color="primary">
            Back Home
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Dialog */}
      <Dialog open={openErrorDialog} onClose={handleErrorDialogClose}>
        <DialogTitle>Error</DialogTitle>
        <DialogContent>
          <DialogContentText>{errorMessage}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleErrorDialogClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Metrics;
