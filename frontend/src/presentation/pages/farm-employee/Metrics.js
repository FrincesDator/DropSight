import React, { useState, useEffect, useCallback } from "react";
import { 
  FilledInput, InputAdornment, Box, Grid, Button, FormControl, Container, 
  Card, CardContent, Dialog, DialogActions, DialogContent, DialogContentText, 
  DialogTitle, AppBar, Toolbar, IconButton 
} from "@mui/material";
import { collection, addDoc, setDoc, query, where, getDocs, onSnapshot, orderBy, limit, } from "firebase/firestore";
import { db } from "../../../core/firebase/firebase-config";
import { useNavigate } from "react-router-dom";
import logo from "../../../assets/images/LOGO2.png";
import LogoutIcon from "@mui/icons-material/Logout";


const Metrics = ({ onSubmit = () => { } }) => {
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

  const navigate = useNavigate();

  const handleSuccessDialogOpen = () => setOpenSuccessDialog(true);
  const handleSuccessDialogClose = () => setOpenSuccessDialog(false);

  const handleErrorDialogOpen = (message) => {
    setErrorMessage(message);
    setOpenErrorDialog(true);
  };
  const handleErrorDialogClose = () => setOpenErrorDialog(false);

  const fetchTotalPopulation = useCallback(async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("loggedInUser"));
      const farmID = storedUser?.farmID;

      if (!farmID) {
        handleErrorDialogOpen("Farm ID not found.");
        return;
      }

      const userMetricsQuery = query(
        collection(db, "farmOwnerAccount"),
        where("UserID", "==", farmID)
      );

      const userMetricsSnapshot = await getDocs(userMetricsQuery);

      if (!userMetricsSnapshot.empty) {
        const userDoc = userMetricsSnapshot.docs[0].data();
        const fetchedPopulation = userDoc.totalPopulation || "";
        setTotalPopulation(fetchedPopulation);
      } else {
        handleErrorDialogOpen("No matching document found in farmOwnerAccount.");
      }
    } catch (error) {
      handleErrorDialogOpen("Error fetching total population.");
      console.error("Fetch error:", error);
    }
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("loggedInUser");
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
      fetchTotalPopulation();
    }
  }, [fetchTotalPopulation]);

  const handleChange = (e) => {
    setMetrics({
      ...metrics,
      [e.target.name]: e.target.value,
    });
  };

  const addNotification = async (newMetrics) => {
    const userId = userData?.farmID;
    try {
      await addDoc(collection(db, "notifications"), {
        message: "Metrics Updated by " + userData.EmployeeID,
        newMetrics,
        timestamp: new Date(),
        userId,
        viewed: false,
      });
    } catch (error) {
      console.error("Error adding notification:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const age = Number(metrics.age);
    const waterIntake = Number(metrics.waterIntake);
    const feedIntake = Number(metrics.feedIntake);
    const averageWeight = Number(metrics.averageWeight);
    const numberOfDeaths = Math.max(0, Number(metrics.numberOfDeaths));

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
      const newTotalPopulation = Math.max(0, Number(totalPopulation) - numberOfDeaths);
      const storedUser = JSON.parse(localStorage.getItem("loggedInUser"));
      const farmID = storedUser?.farmID;

      const userMetricsQuery = query(
        collection(db, "farmOwnerAccount"),
        where("UserID", "==", farmID)
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
        setErrorMessage("");
        handleSuccessDialogOpen();
        onSubmit(metrics);

        await addNotification(metrics);
      } else {
        handleErrorDialogOpen("User document not found.");
      }
    } catch (error) {
      console.error("Error saving metrics:", error);
      handleErrorDialogOpen("Error saving metrics, please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("userRole");
    navigate("/");
  };

  useEffect(() => {
      const storedUser = JSON.parse(localStorage.getItem("loggedInUser"));
      const farmID = storedUser?.farmID;
    
      if (!userData) return;
    const fetchLatestMetric = async () => {
      try {
        const userMetricsQuery = query(
          collection(db, "farmOwnerAccount"),
          where("UserID", "==", farmID)
        );

        const userMetricsSnapshot = await getDocs(userMetricsQuery);

        if (!userMetricsSnapshot.empty) {
          const userDocRef = userMetricsSnapshot.docs[0].ref;

          // Listen to the `Metrics` subcollection
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

          // Cleanup listener on unmount
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
          where("UserID", "==", userData.farmID)
        );

        const userMetricsSnapshot = await getDocs(userMetricsQuery);
        if (!userMetricsSnapshot.empty) {
          const userDocRef = userMetricsSnapshot.docs[0].ref;

          // Query earliest metric
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
              ((today - earliestDate) / (1000 * 60 * 60 * 24)+1)
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

  return (
    <Container className="home-page">
      <AppBar>
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static" sx={{ bgcolor: "#2D4746" }}>
            <Toolbar>
              <img
                src={logo}
                alt="Logo"
                style={{ height: 40, marginRight: "auto" }}
              />
              <IconButton onClick={handleLogout}>
                <LogoutIcon sx={{ color: "white" }} />
              </IconButton>
            </Toolbar>
          </AppBar>
        </Box>
      </AppBar>
      <Box
        sx={{
          paddingLeft: { xs: 2, sm: 3, md: 15 },
          paddingRight: { xs: 2, sm: 3, md: 15 },
          paddingTop: 10,
          paddingBottom: 3,
        }}
      >
        <Card
          variant="outlined"
          sx={{
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
            padding: { xs: 2, md: 3 },
          }}
        >
          <CardContent>
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
                  sx={{ height: { xs: 45, md: 60 } }}
                />
              </FormControl>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
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
                      sx={{ height: { xs: 45, md: 60 } }}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
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
                      sx={{ height: { xs: 45, md: 60 } }}
                    />
                  </FormControl>
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
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
                      sx={{ height: { xs: 45, md: 60 } }}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
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
                      sx={{ height: { xs: 45, md: 60 } }}
                    />
                  </FormControl>
                </Grid>
              </Grid>

              <Box mt={3} display="flex" justifyContent="center">
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{
                    bgcolor: "#2D4746",
                    paddingX: 5,
                    paddingY: 1.5,
                    borderRadius: 2,
                  }}
                >
                  Submit
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

      <Dialog open={openSuccessDialog} onClose={handleSuccessDialogClose}>
        <DialogTitle>Success</DialogTitle>
        <DialogContent>
          <DialogContentText>Metrics saved successfully.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSuccessDialogClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

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
