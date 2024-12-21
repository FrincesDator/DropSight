import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Container,
  TextField,
  Stack,
  Avatar,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  MenuItem,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { PhotoCamera } from "@mui/icons-material";
import { FarmAppearanceContext } from "../../farm-owner/settings/AppearanceContext";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../../../core/firebase/firebase-config";
import "../../../../core/style/Settings.css";

const User = () => {
  const { primaryColor } = useContext(FarmAppearanceContext);
  const textColor =
    primaryColor === "#2D4746" || primaryColor === "#EF6068"
      ? "white"
      : "black";
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    fName: "",
    lName: "",
    farmName: "",
    chickenHouseType: "",
    address: "",
    contactNum: "",
  });
  const [loading, setLoading] = useState(true); 
  const [dialogOpen, setDialogOpen] = useState(false); 

      const theme = useTheme();
      const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Detect if the screen is small

  // Fetch user data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("loggedInUser"));
        if (!storedUser || !storedUser.UserID) {
          console.error("UserID is missing in the stored user data.");
          return;
        }

        const farmOwnerAccountRef = collection(db, "farmOwnerAccount");
        const userQuery = query(
          farmOwnerAccountRef,
          where("UserID", "==", storedUser.UserID)
        );
        const querySnapshot = await getDocs(userQuery);

        if (querySnapshot.empty) {
          console.error("No matching user document found.");
          return;
        }

        const userDoc = querySnapshot.docs[0];
        const userDataFromFirestore = userDoc.data();

        setUserData({
          fName: userDataFromFirestore.fName || "",
          lName: userDataFromFirestore.lName || "",
          farmName: userDataFromFirestore.farmName || "",
          chickenHouseType: userDataFromFirestore.chickenHouseType || "",
          address: userDataFromFirestore.address || "",
          contactNum: userDataFromFirestore.contactNum || "",
        });
      } catch (error) {
        console.error("Error fetching user data from Firestore:", error);
      } finally {
        setLoading(false); 
      }
    };

    fetchUserData();
  }, []);

  const handleSaveChanges = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("loggedInUser"));
      const farmOwnerAccountRef = collection(db, "farmOwnerAccount");

      const userQuery = query(
        farmOwnerAccountRef,
        where("UserID", "==", storedUser.UserID)
      );
      const querySnapshot = await getDocs(userQuery);

      if (!querySnapshot.empty) {
        const userDocRef = querySnapshot.docs[0].ref;
        await updateDoc(userDocRef, { ...userData });
        setDialogOpen(true); 
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    navigate("/");
  };

  const closeDialog = () => {
    setDialogOpen(false);
  };

  if (loading) {
    return <p>Loading...</p>; 
  }

  return (
    <Container className="settings-page">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          gap: isMobile ? "5px" : "16px",
        }}
      >
        <Card
          variant="elevation"
          elevation={2}
          className="editprofile-settings-card"
        >
          <CardContent>
            <Box textAlign="center" mb={2}>
              <p className="heading1">Edit Profile</p>
            </Box>
            <Stack direction="column" spacing={2} alignItems="center" mb={2}>
              <Avatar sx={{ width: isMobile ? 80 : 100, height: isMobile ? 80 : 100, mb: 1 }}>
                {userData.fName.charAt(0)}
              </Avatar>
              <IconButton
                color="primary"
                aria-label="upload picture"
                component="label"
              >
                <input hidden accept="image/*" type="file" />
                <PhotoCamera />
              </IconButton>
            </Stack>
            <Stack direction="row" spacing={isMobile ? 0 : 2} mt={isMobile ? 0 : 2}>
              <TextField
                fullWidth
                label="First Name"
                margin="normal"
                variant="outlined"
                InputLabelProps={{ className: "textbox-font" }}
                value={userData.fName}
                onChange={(e) =>
                  setUserData({ ...userData, fName: e.target.value })
                }
                sx={{
                  transform: isMobile ? "scale(0.9)" : "scale(1)",
                }}
              />
              <TextField
                fullWidth
                label="Last Name"
                margin="normal"
                variant="outlined"
                InputLabelProps={{ className: "textbox-font" }}
                value={userData.lName}
                onChange={(e) =>
                  setUserData({ ...userData, lName: e.target.value })
                }
                sx={{
                  transform: isMobile ? "scale(0.9)" : "scale(1)",
                }}
              />
            </Stack>
            <TextField
              fullWidth
              label="Farm Name"
              margin="normal"
              variant="outlined"
              InputLabelProps={{ className: "textbox-font" }}
              value={userData.farmName}
              onChange={(e) =>
                setUserData({ ...userData, farmName: e.target.value })
              }
              sx={{
                transform: isMobile ? "scale(0.9)" : "scale(1)",
              }}
            />
            <TextField
              fullWidth
              label="Chicken Housing Type"
              margin="normal"
              variant="outlined"
              select 
              InputLabelProps={{ className: "textbox-font" }}
              value={userData.chickenHouseType || ""} 
              onChange={(e) =>
                setUserData({ ...userData, chickenHouseType: e.target.value })
              }
              sx={{
                transform: isMobile ? "scale(0.9)" : "scale(1)",
              }}
            >
              {/* Dropdown options */}
              <MenuItem value="Caged">Caged</MenuItem>
              <MenuItem value="Free-Range">Free-Range</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="Address"
              margin="normal"
              variant="outlined"
              InputLabelProps={{ className: "textbox-font" }}
              value={userData.address}
              onChange={(e) =>
                setUserData({ ...userData, address: e.target.value })
              }
              sx={{
                transform: isMobile ? "scale(0.9)" : "scale(1)",
              }}
            />
            <TextField
              fullWidth
              label="Contact Number"
              margin="normal"
              variant="outlined"
              InputLabelProps={{ className: "textbox-font" }}
              value={userData.contactNum}
              onChange={(e) =>
                setUserData({ ...userData, contactNum: e.target.value })
              }
              sx={{
                transform: isMobile ? "scale(0.9)" : "scale(1)",
              }}
            />
            <Box display="flex" justifyContent="center" mt={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveChanges}
                className="settings-button"
                style={{
                  "--primary-color": primaryColor,
                  "--text-color": textColor,
                }}
                
              >
                Save Changes
              </Button>
            </Box>
          </CardContent>
        </Card>
        <Button
          variant="contained"
          color="primary"
          className="logout-button"
          style={{
            "--primary-color": primaryColor,
            "--text-color": textColor,
          }}
          onClick={handleLogout}
        >
          Logout
        </Button>
        <Box height={40} />
      </Box>

      {/* Custom Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog}>
        <DialogTitle>Success</DialogTitle>
        <DialogContent>
          <Typography>Profile have been successfully updated!</Typography>
        </DialogContent>
        <Box textAlign="Right" mt={1} mb={2}>
          <Button onClick={closeDialog} color="primary">
            Close
          </Button>
        </Box>
      </Dialog>
    </Container>
  );
};

export default User;