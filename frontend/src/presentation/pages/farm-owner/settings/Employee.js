import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Box,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { FarmAppearanceContext } from "./AppearanceContext";
import {
  doc,
  setDoc,
  getDocs,
  collection,
  query,
  where,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../../../core/firebase/firebase-config";
import "../../../../core/style/Settings.css";

import { hashPassword } from "../../../../core/util/passwordEncrypt";

const EmployeePage = () => {
  const { primaryColor } = useContext(FarmAppearanceContext);
  const textColor =
    primaryColor === "#2D4746" || primaryColor === "#EF6068"
      ? "white"
      : "black";

  const [employeeNames, setEmployeeNames] = useState([""]);
  const [userData, setUserData] = useState(null);
  const [existingEmployees, setExistingEmployees] = useState([]);

  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Detect if the screen is small

  useEffect(() => {
    const storedUser = localStorage.getItem("loggedInUser");
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
      fetchExistingEmployees(JSON.parse(storedUser).UserID);
    }
  }, []);

  const fetchExistingEmployees = async (userId) => {
    try {
      const employeeQuery = query(
        collection(db, "Employee"),
        where("farmID", "==", userId)
      );
      const employeeSnapshot = await getDocs(employeeQuery);

      if (!employeeSnapshot.empty) {
        const employees = employeeSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setExistingEmployees(employees);
      } else {
        console.log("No employees found for this farm owner.");
        setExistingEmployees([]);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const handleEmployeeNameChange = (index, value) => {
    const newEmployeeNames = [...employeeNames];
    newEmployeeNames[index] = value;
    setEmployeeNames(newEmployeeNames);
  };

  const handleSaveChanges = async () => {
    if (!userData) {
      console.error("No user data found.");
      return;
    }

    const loggedInUserId = userData.UserID;

    // Validate if all Employee Names are filled
    const invalidNames = employeeNames.filter((name) => !name.trim());
    if (invalidNames.length > 0) {
      setErrorMessage("Please provide valid Employee Names before saving.");
      setErrorDialogOpen(true);
      return;
    }

    try {
      // Fetch all existing employee names from the database
      const allEmployeesSnapshot = await getDocs(collection(db, "Employee"));
      const allEmployeeNames = allEmployeesSnapshot.docs.map((doc) =>
        doc.data().EmployeeName.toLowerCase()
      );

      for (const name of employeeNames) {
        if (allEmployeeNames.includes(name.trim().toLowerCase())) {
          setErrorMessage(
            `The name "${name}" is already taken. Please choose a different name.`
          );
          setErrorDialogOpen(true);
          return;
        }
      }

      const currentYear = new Date().getFullYear().toString().slice(-2);

      const employeeQuery = query(
        collection(db, "Employee"),
        where("farmID", "==", loggedInUserId)
      );
      const employeeSnapshot = await getDocs(employeeQuery);

      const existingCount = employeeSnapshot.size;

      const newEmployees = [];

      for (const [index, name] of employeeNames.entries()) {
        const employeeNumber = (existingCount + index + 1)
          .toString()
          .padStart(4, "0");
        const newEmployeeId = `E${currentYear}-${employeeNumber}`;

        const hashedPassword = hashPassword(newEmployeeId);

        const employeeData = {
          EmployeeID: newEmployeeId,
          EmployeeName: name,
          Password: hashedPassword,
          farmID: loggedInUserId,
        };

        try {
          const employeeDocRef = doc(collection(db, "Employee"));
          await setDoc(employeeDocRef, employeeData);
          newEmployees.push(employeeData);
        } catch (error) {
          console.error("Error adding employee:", error);
        }
      }

      fetchExistingEmployees(loggedInUserId);
      setEmployeeNames([""]);
      console.log("Employees added successfully!");
    } catch (error) {
      console.error("An error occurred while saving employees:", error);
    }
  };

  const handleRemoveEmployee = async (employeeId) => {
    try {
      const employeeDocRef = doc(db, "Employee", employeeId);
      await deleteDoc(employeeDocRef);

      if (userData) {
        fetchExistingEmployees(userData.UserID);
      }
    } catch (error) {
      console.error("Error removing employee:", error);
    }
  };

  return (
    <Container
      className="settings-page"
      style={{ marginTop: isMobile ? "20px" : "64px" }}
    >
      <Box>
        <Card variant="elevation" elevation={2} className="settings-card">
          <CardContent>
            <p
              className="heading1"
              style={{
                marginTop: isMobile ? "0px" : "20px",
                marginBottom: "40px",
              }}
            >
              Employee Access Settings
            </p>

            <Grid container spacing={3}>
              {existingEmployees.map((emp) => (
                <Grid
                  item
                  xs={12}
                  key={emp.id}
                  style={{
                    marginBottom: isMobile ? "10px" : "20px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Card variant="elevation" elevation={2} style={{ flex: 1 }}>
                    <CardContent>
                      {/* Employee ID Label and Value */}
                      <Typography
                        style={{
                          fontSize: isMobile ? "13px" : "1.2rem",
                          fontWeight: "bold",
                          flexGrow: 1,
                        }}
                      >
                        Employee ID:{" "}
                        <span style={{ fontWeight: "normal" }}>
                          {emp.EmployeeID}
                        </span>
                      </Typography>

                      {/* Employee Name Label and Value */}
                      <Typography
                        style={{
                          fontSize: isMobile ? "12px" : "1.2rem",
                          fontWeight: "bold",
                          marginTop: "5px",
                        }}
                      >
                        Name:{" "}
                        <span style={{ fontWeight: "normal" }}>
                          {emp.EmployeeName}
                        </span>
                      </Typography>
                    </CardContent>
                  </Card>
                  <Button
                    variant="contained"
                    style={{
                      backgroundColor: "red",
                      color: "white",
                      marginLeft: "10px",
                      fontSize: isMobile ? "12px" : "1rem",
                    }}
                    onClick={() => handleRemoveEmployee(emp.id)}
                  >
                    Remove
                  </Button>
                </Grid>
              ))}

              {employeeNames.map((name, index) => (
                <Grid
                  item
                  xs={12}
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginTop: isMobile ? "5px" : "20px",
                  }}
                >
                  <TextField
                    fullWidth
                    label={`Name of Employee`}
                    variant="outlined"
                    margin="normal"
                    value={name}
                    onChange={(e) =>
                      handleEmployeeNameChange(index, e.target.value)
                    }
                    placeholder="First Name | Last Name"
                    InputProps={{
                      className: "textbox-font",
                    }}
                    InputLabelProps={{
                      className: "textbox-font",
                      shrink: true,
                    }}
                    inputProps={{
                      style: {
                        fontFamily: "Libre Franklin",
                        transform: isMobile ? "scale(0.8)" : "scale(1)",
                      },
                    }}
                  />
                </Grid>
              ))}

              <Grid item xs={12}>
                <Box
                  display="flex"
                  justifyContent="center"
                  mt={2}
                  style={{ marginTop: "20px" }}
                >
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
                    ADD EMPLOYEE
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>

      <Dialog
        open={errorDialogOpen}
        onClose={() => setErrorDialogOpen(false)}
        aria-labelledby="error-dialog-title"
        aria-describedby="error-dialog-description"
      >
        <DialogTitle id="error-dialog-title">Error</DialogTitle>
        <DialogContent>
          <DialogContentText id="error-dialog-description">
            {errorMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setErrorDialogOpen(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EmployeePage;
