import React, { useState } from "react";
import { collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import { db } from "../../../core/firebase/firebase-config";
import axios from "axios";
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, TextField } from "@mui/material";
import { hashPassword } from "../../../core/util/passwordEncrypt";
 
const ForgotPassword = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorDialogMessage, setErrorDialogMessage] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]); // State to hold OTP inputs
  const [generatedOtp, setGeneratedOtp] = useState(""); // Store the generated OTP
  const [newPassword, setNewPassword] = useState(""); // New password input
  const [confirmPassword, setConfirmPassword] = useState(""); // Confirm password input
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false); // Open the password dialog after OTP verification
 
  // Handle success dialog close
  const handleCloseSuccessDialog = () => {
    setSuccessDialogOpen(false);
    handleClearAndClose(); // Optionally clear email and close modal
  };
 
  // Send code to the email address
  const handleSendCode = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 
    if (!email) {
      setErrorDialogMessage("Please enter your email.");
      setErrorDialogOpen(true);
      return;
    } else if (!emailRegex.test(email)) {
      setErrorDialogMessage("Please enter a valid email address.");
      setErrorDialogOpen(true);
      return;
    }
 
    try {
      // Check if email exists in Firestore collections
      const farmQuery = query(
        collection(db, "farmOwnerAccount"),
        where("email", "==", email)
      );
      const farmSnapshot = await getDocs(farmQuery);
 
      if (!farmSnapshot.empty) {
        // Email found in farmOwnerAccount, proceed to send code
        await sendCodeToEmail(email);
        return;
      }
 
      const vetQuery = query(
        collection(db, "veterinarianAccount"),
        where("email", "==", email)
      );
      const vetSnapshot = await getDocs(vetQuery);
 
      if (!vetSnapshot.empty) {
        // Email found in veterinarianAccount, proceed to send code
        await sendCodeToEmail(email);
        return;
      }
 
      // No account found
      setErrorDialogMessage("No account found with this email.");
      setErrorDialogOpen(true);
    } catch (error) {
      setErrorDialogMessage("An error occurred. Please try again.");
      setErrorDialogOpen(true);
    }
  };
 
  // Send code to the email address and generate OTP
  const sendCodeToEmail = async (email) => {
    try {
      // Generate a 4-digit OTP
      const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedOtp(verificationCode); // Store the OTP for later verification
 
      console.log("Generated OTP: ", verificationCode); // Log the generated OTP for debugging
 
      // Make a POST request to the backend to send the verification code
      await axios.post("http://localhost:5000/send-code", { email, verificationCode });
 
      setSuccessDialogOpen(true); // Open success dialog
    } catch (error) {
      setErrorDialogMessage("Failed to send the verification code. Please try again.");
      setErrorDialogOpen(true);
    }
  };
 
  const handleCloseErrorDialog = () => {
    setErrorDialogOpen(false);
  };
 
  const handleClearAndClose = () => {
    setEmail(""); // Clear email input
    setOtp(["", "", "", ""]); // Clear OTP inputs
    setGeneratedOtp(""); // Clear generated OTP
    onClose(); // Close the modal
  };
 
  const handleOtpChange = (e, index) => {
    const newOtp = [...otp];
    newOtp[index] = e.target.value;
    setOtp(newOtp);
  };
 
  // Handle OTP verification
  const handleVerifyOtp = async () => {
    const enteredOtp = otp.join("").trim();
 
    console.log("Entered OTP: ", enteredOtp); // Log the entered OTP for debugging
 
    if (enteredOtp === "") {
      setErrorDialogMessage("Please enter the OTP.");
      setErrorDialogOpen(true);
      return;
    }
 
    try {
      // Make a POST request to verify the OTP on the server
      const response = await axios.post("http://localhost:5000/verify-otp", {
        email,
        enteredOtp,
      });
 
      // Handle successful OTP verification
      if (response.status === 200) {
        alert("OTP verified successfully!");
        setSuccessDialogOpen(false); // Close OTP dialog
        setPasswordDialogOpen(true); // Open password reset dialog
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setErrorDialogMessage(error.response.data.message || "Incorrect OTP. Please try again.");
      } else {
        setErrorDialogMessage("An error occurred. Please try again.");
      }
      setErrorDialogOpen(true);
    }
  };
 
  // Handle password change
  const handlePasswordChange = async () => {
  if (newPassword === "" || confirmPassword === "") {
    setErrorDialogMessage("Please fill in both password fields.");
    setErrorDialogOpen(true);
    return;
  }
 
  if (newPassword !== confirmPassword) {
    setErrorDialogMessage("Passwords do not match.");
    setErrorDialogOpen(true);
    return;
  }
 
  try {
    // Hash the new password
    const hashedPassword = hashPassword(newPassword);
 
    // First, check if email exists in 'farmOwnerAccount'
    const farmQuery = query(
      collection(db, "farmOwnerAccount"),
      where("email", "==", email)
    );
    const farmSnapshot = await getDocs(farmQuery);
 
    if (!farmSnapshot.empty) {
      const userDoc = farmSnapshot.docs[0]; // Get the document
      const userRef = doc(db, "farmOwnerAccount", userDoc.id);
     
      // Update the password field with the hashed password
      await updateDoc(userRef, { Password: hashedPassword });
      alert("Password updated successfully!");
      setPasswordDialogOpen(false);
      handleClearAndClose();
      return;
    }
 
    // If no user found in farmOwnerAccount, check in veterinarianAccount
    const vetQuery = query(
      collection(db, "veterinarianAccount"),
      where("email", "==", email)
    );
    const vetSnapshot = await getDocs(vetQuery);
 
    if (!vetSnapshot.empty) {
      const userDoc = vetSnapshot.docs[0]; // Get the document
      const userRef = doc(db, "veterinarianAccount", userDoc.id);
     
      // Update the password field with the hashed password
      await updateDoc(userRef, { Password: hashedPassword });
      alert("Password updated successfully!");
      setPasswordDialogOpen(false);
      handleClearAndClose();
      return;
    }
 
    setErrorDialogMessage("No account found with this email.");
    setErrorDialogOpen(true);
 
  } catch (error) {
    console.error("Error updating password: ", error);
    setErrorDialogMessage("An error occurred while updating the password. Please try again.");
    setErrorDialogOpen(true);
  }
};
 
 
 
  if (!isOpen) return null;
 
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Forgot Password</h2>
        <p>Please enter your email to receive a verification code:</p>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            padding: "10px",
            fontSize: "16px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            width: "100%",
            boxSizing: "border-box",
          }}
        />
 
        <button onClick={handleSendCode} className="send-reset-button">
          Send Verification Code
        </button>
        <button onClick={handleClearAndClose} className="close-modal-button">
          Close
        </button>
 
        {/* Success Dialog for OTP */}
        <Dialog open={successDialogOpen} onClose={handleCloseSuccessDialog}>
          <DialogTitle>Verification</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Enter the 4-digit OTP code sent to your email:
            </DialogContentText>
 
            <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
              {otp.map((digit, index) => (
                <TextField
                  key={index}
                  value={digit}
                  onChange={(e) => handleOtpChange(e, index)}
                  inputProps={{ maxLength: 1 }}
                  style={{
                    width: "50px",
                    height: "48px",
                    margin: "0 10px",
                    textAlign: "center",
                    fontSize: "20px",
                    display: "inline-block", // Ensure they align horizontally
                  }}
                />
              ))}
            </div>
            <Button
              onClick={handleVerifyOtp}
              style={{
                marginTop: "20px",
                width: "100%",
                backgroundColor: "#4CAF50",
                color: "white",
                padding: "10px",
                borderRadius: "5px",
              }}
            >
              Verify OTP
            </Button>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseSuccessDialog} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
 
        {/* Error Dialog */}
        <Dialog open={errorDialogOpen} onClose={handleCloseErrorDialog}>
          <DialogTitle>Error</DialogTitle>
          <DialogContent>
            <DialogContentText>{errorDialogMessage}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseErrorDialog} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
 
        {/* Password Reset Dialog */}
        <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)}>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Enter your new password and confirm it:
            </DialogContentText>
            <TextField
              type="password"
              label="New Password"
              fullWidth
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{ marginBottom: "20px" }}
            />
            <TextField
              type="password"
              label="Confirm Password"
              fullWidth
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Button
              onClick={handlePasswordChange}
              style={{
                marginTop: "20px",
                width: "100%",
                backgroundColor: "#4CAF50",
                color: "white",
                padding: "10px",
                borderRadius: "5px",
              }}
            >
              Update Password
            </Button>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPasswordDialogOpen(false)} color="primary">
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};
 
export default ForgotPassword;