import React, { useState, useContext, useEffect } from "react";
import { Container, Box, TextField, Button, Grid, Card, CardContent } from "@mui/material";
import { VetAppearanceContext } from "./AppearanceContext";
import "../../../../core/style/Settings.css";
import { db } from "../../../../core/firebase/firebase-config";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { hashPassword } from "../../../../core/util/passwordEncrypt";

const AccountSettingsPage = () => {
  const { primaryColor } = useContext(VetAppearanceContext);
  const textColor =
    primaryColor === "#2D4746" || primaryColor === "#EF6068"
      ? "white"
      : "black";

  const [email, setEmail] = useState("");
  const [originalEmail, setOriginalEmail] = useState(""); // State to hold the original email
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
        collection(db, "veterinarianAccount"),
        where("UserID", "==", userID)
      );
      const querySnapshot = await getDocs(q);

      // If the document is found, update the email state
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.email) {
          setEmail(data.email); // Populate the email field
          setOriginalEmail(data.email); // Store the original email
        }
      });
    } catch (error) {
      console.error("Error fetching user email:", error);
    }
  };

  const handleEmailFocus = () => {
    setEmail(""); // Clear the email field when focused
  };

  const handleEmailBlur = () => {
    if (email.trim() === "") {
      setEmail(originalEmail); // Revert to original email if input is empty
    }
  };

  const handleSaveChanges = async () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      // Get the current logged-in user ID from localStorage
      const storedUser = localStorage.getItem("loggedInUser");
      if (storedUser) {
        const user = JSON.parse(storedUser);

        // Query to find the user's document ID
        const q = query(
          collection(db, "veterinarianAccount"),
          where("UserID", "==", user.UserID)
        );
        const querySnapshot = await getDocs(q);

        // Update the email and hashed password in Firestore
        querySnapshot.forEach(async (document) => {
          const docRef = doc(db, "veterinarianAccount", document.id); // Correctly use the doc function
          const hashedPassword = hashPassword(newPassword); // Hash the new password
          await updateDoc(docRef, {
            email: email, // Update email
            Password: hashedPassword, // Save the hashed password
          });
          // Automatically refresh the page after successful change
          window.location.reload();
        });
      }
    } catch (error) {
      console.error("Error updating user data:", error);
      // Optional: handle error display
    }
  };

  return (
    <Container className="settings-page">
      <Box>
        <Card
          variant="elevation"
          elevation={2}
          className="settings-card"
        >
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
                  onFocus={handleEmailFocus} // Clear the email field on focus
                  onBlur={handleEmailBlur} // Revert to original email on blur
                  InputProps={{
                    className: "textbox-font",
                    style: { color: "#B8B8B8" }, // Set text color to match placeholder
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
