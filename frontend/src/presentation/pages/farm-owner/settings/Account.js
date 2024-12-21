import React, { useState, useContext, useEffect } from "react";
import {
  Container,
  Box,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import { FarmAppearanceContext } from "./AppearanceContext";
import "../../../../core/style/Settings.css";
import { db } from "../../../../core/firebase/firebase-config";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { hashPassword } from "../../../../core/util/passwordEncrypt";

const AccountSettingsPage = () => {
  const { primaryColor } = useContext(FarmAppearanceContext);
  const textColor =
    primaryColor === "#2D4746" || primaryColor === "#EF6068"
      ? "white"
      : "black";

  const [email, setEmail] = useState("");
  const [originalEmail, setOriginalEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Get the current logged-in user ID from localStorage
    const storedUser = localStorage.getItem("loggedInUser");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserData(user);

      // Fetch the current user's email from Firestore
      fetchUserEmail(user.UserID);
    }
  }, []);

  const fetchUserEmail = async (userID) => {
    try {
      // Query the Firestore collection to find the document with matching UserID
      const q = query(
        collection(db, "farmOwnerAccount"),
        where("UserID", "==", userID)
      );
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.email) {
          setEmail(data.email);
          setOriginalEmail(data.email);
        }
      });
    } catch (error) {
      console.error("Error fetching user email:", error);
    }
  };

  const handleEmailFocus = () => {
    setEmail("");
  };

  const handleEmailBlur = () => {
    if (email.trim() === "") {
      setEmail(originalEmail);
    }
  };

  const handleSaveChanges = async () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const storedUser = localStorage.getItem("loggedInUser");
      if (storedUser) {
        const user = JSON.parse(storedUser);

        const q = query(
          collection(db, "farmOwnerAccount"),
          where("UserID", "==", user.UserID)
        );
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach(async (document) => {
          const docRef = doc(db, "farmOwnerAccount", document.id);
          const hashedPassword = hashPassword(newPassword);
          await updateDoc(docRef, {
            email: email,
            Password: hashedPassword,
          });
          window.location.reload();
        });
      }
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  };

  return (
    <Container className="settings-page">
      <Box>
        <Card variant="elevation" elevation={2} className="settings-card">
          <CardContent>
            <p className="heading1">Account Settings</p>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Change Email"
                  type="email"
                  variant="outlined"
                  margin="normal"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={handleEmailFocus}
                  onBlur={handleEmailBlur}
                  InputProps={{
                    className: "textbox-font",
                    style: { color: "#B8B8B8" },
                  }}
                  InputLabelProps={{
                    className: "textbox-font",
                  }}
                  autoComplete="off"
                  name="email-change"
                />

                <TextField
                  fullWidth
                  label="New Password"
                  type="password"
                  variant="outlined"
                  margin="normal"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  InputProps={{
                    className: "textbox-font",
                  }}
                  InputLabelProps={{
                    className: "textbox-font",
                  }}
                  autoComplete="new-password"
                  name="new-password-change"
                />
                <TextField
                  fullWidth
                  label="Confirm New Password"
                  type="password"
                  variant="outlined"
                  margin="normal"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  InputProps={{
                    className: "textbox-font",
                  }}
                  InputLabelProps={{
                    className: "textbox-font",
                  }}
                  autoComplete="new-password"
                  name="confirm-password-change"
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
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default AccountSettingsPage;
