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
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { PhotoCamera } from "@mui/icons-material";
import { VetAppearanceContext } from "../../veterinarian/settings/AppearanceContext";
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
  const { primaryColor } = useContext(VetAppearanceContext);
  const textColor =
    primaryColor === "#2D4746" || primaryColor === "#EF6068"
      ? "white"
      : "black";
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [userData, setUserData] = useState({
    fName: "",
    lName: "",
    district: "",
    lNum: "",
    cNum: "",
  });

  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("loggedInUser"));
        if (!storedUser || !storedUser.UserID) {
          console.error("UserID is missing in the stored user data.");
          return;
        }

        const veterinarianAccountRef = collection(db, "veterinarianAccount");
        const userQuery = query(
          veterinarianAccountRef,
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
          district: userDataFromFirestore.district || "",
          lNum: userDataFromFirestore.lNum || "",
          cNum: userDataFromFirestore.cNum || "",
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
      const veterinarianAccountRef = collection(db, "veterinarianAccount");

      const userQuery = query(
        veterinarianAccountRef,
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
              <Avatar
                sx={{
                  width: isMobile ? 80 : 100,
                  height: isMobile ? 80 : 100,
                  mb: 1,
                }}
              >
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
            <Stack
              direction="row"
              spacing={isMobile ? 0 : 2}
              mt={isMobile ? -2 : 2}
            >
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
              label="District"
              margin="normal"
              variant="outlined"
              InputLabelProps={{ className: "textbox-font" }}
              value={userData.district}
              onChange={(e) =>
                setUserData({ ...userData, district: e.target.value })
              }
              sx={{
                transform: isMobile ? "scale(0.9)" : "scale(1)",
              }}
            />
            <TextField
              fullWidth
              label="License Number"
              margin="normal"
              variant="outlined"
              InputLabelProps={{ className: "textbox-font" }}
              value={userData.lNum}
              onChange={(e) =>
                setUserData({ ...userData, lNum: e.target.value })
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
              value={userData.cNum}
              onChange={(e) =>
                setUserData({ ...userData, cNum: e.target.value })
              }
              sx={{
                transform: isMobile ? "scale(0.9)" : "scale(1)",
              }}
            />
            <Box display="flex" justifyContent="center" mt={2} mb={-5}>
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

      <Dialog open={dialogOpen} onClose={closeDialog}>
        <DialogTitle>Success</DialogTitle>
        <DialogContent>
          <Typography>Profile has been successfully updated!</Typography>
        </DialogContent>
        <Box textAlign="right" mt={1} mb={2}>
          <Button onClick={closeDialog} color="primary">
            Close
          </Button>
        </Box>
      </Dialog>
    </Container>
  );
};

export default User;
