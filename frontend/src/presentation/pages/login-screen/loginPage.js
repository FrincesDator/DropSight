import React, { useState, useEffect, useContext } from "react";
import "../../../core/style/login-screenN.css";
import loginBG from "../../../assets/images/loginBG.png";
import logoW from "../../../assets/images/LogoW.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../core/firebase/firebase-config";
import { NotificationContext } from "../farm-owner/notification-screen/NotificationContext";
import { comparePassword } from "../../../core/util/passwordEncrypt";
import ForgotPasswordModal from "../login-screen/forgotPassword";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from "@mui/material";
 
const LoginPage = () => {
  const [password, setPassword] = useState("");
  const [userID, setUserID] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openErrorDialog, setOpenErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isTermsAgreed, setIsTermsAgreed] = useState(false);
 
  const navigate = useNavigate();
  const { setUserData } = useContext(NotificationContext);
 
  // Check if the user has already agreed to the terms, based on their userID
  useEffect(() => {
    const storedTermsAgreement = localStorage.getItem(userID + "_termsAgreed");
    if (storedTermsAgreement === "true") {
      setIsTermsAgreed(true);
    }
  }, [userID]); // Dependency on userID, so it updates when the user logs in
 
  const handleErrorDialogOpen = (message) => {
    setErrorMessage(message);
    setOpenErrorDialog(true);
  };
 
  const handleErrorDialogClose = () => setOpenErrorDialog(false);
 
  const handleLogin = async () => {
    if (!isTermsAgreed) {
      handleErrorDialogOpen("Please agree to the terms and conditions before logging in.");
      return;
    }
  
    const roles = {
      adminAccount: "/admin/dashboard",
      farmOwnerAccount: "/f/home",
      veterinarianAccount: "/v/admin",
      employeeAccount: "/e/metrics",
    };
  
    let userRole = null;
    let loggedInUser = null;
  
    try {
      for (let role in roles) {
        let q;
        if (role === "employeeAccount") {
          q = query(
            collection(db, "Employee"),
            where("EmployeeID", "==", userID)
          );
        } else {
          q = query(
            collection(db, role),
            where("UserID", "==", userID)
          );
        }
  
        const querySnapshot = await getDocs(q);
  
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data();
  
          // Compare plain text password or use hashed password comparison
          if (password === userData.Password) {
            userRole = role;
            loggedInUser = userData;
            break;
          } else {
            const passwordMatch = comparePassword(password, userData.Password);
            if (passwordMatch) {
              userRole = role;
              loggedInUser = userData;
              break;
            }
          }
        }
      }
  
      if (userRole) {
        // Save user data and role in local storage
        localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
        localStorage.setItem("userRole", userRole);
  
        // Set user data in context (if applicable)
        setUserData(loggedInUser);
  
        // Redirect to appropriate role-specific page
        navigate(roles[userRole]);
      } else {
        handleErrorDialogOpen("Login failed: Invalid UserID or password.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      handleErrorDialogOpen("An error occurred while attempting to log in. Please try again.");
    }
  };
 
  const handleTermsChange = (event) => {
    const checked = event.target.checked;
    setIsTermsAgreed(checked);
 
    // Store the user's agreement state under their userID in localStorage
    if (userID) {
      localStorage.setItem(userID + "_termsAgreed", checked ? "true" : "false");
    }
  };
 
  return (
    <div className="login-container">
      <div className="login-bg" style={{ backgroundImage: `url(${loginBG})` }} />
      <div className="login-content">
        <img src={logoW} alt="Logo" className="logo" style={{ width: 60, height: 60, position: "absolute", top: 30, left: 50 }} />
        <h1 className="dropSight">DropSight</h1>
  
        <div className="input-group">
          <input
            type="text"
            id="userId"
            className="input-field"
            placeholder="User ID"
            value={userID}
            onChange={(e) => setUserID(e.target.value)} // update userID
          />
        </div>
  
        <div className="input-group password-group">
          <div className="custom-password-field">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              className="input-field"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </button>
          </div>
        </div>
  
        <button className="forgot-password-button" onClick={() => setIsModalOpen(true)}>
          Forgot Password?
        </button>
  
        <div className="terms-privacy-section">
          <input
            type="checkbox"
            id="termsCheckbox"
            checked={isTermsAgreed}
            onChange={handleTermsChange} // Handle checkbox state change
          />
          <label htmlFor="termsCheckbox" className="terms-label">
            I agree to the{" "}
            <Link to="/terms&condition" className="terms-link">
              Terms and Conditions
            </Link>
          </label>
        </div>
  
        <button
          className="login-button"
          onClick={handleLogin}
        >
          Login
        </button>
      </div>
  
      <ForgotPasswordModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
  
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
    </div>
  );
};
 
export default LoginPage;