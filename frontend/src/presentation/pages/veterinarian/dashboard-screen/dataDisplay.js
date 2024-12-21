import React, { useEffect, useState, useContext } from "react";
import {
  Card,
  Box,
  Button,
  Container,
  Grid,
  TextField,
  IconButton,
} from "@mui/material";
import { ref, getDownloadURL } from "firebase/storage";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db, storage } from "../../../../core/firebase/firebase-config";
import "../../../../core/style/data.css";
import { VetAppearanceContext } from "../../veterinarian/settings/AppearanceContext";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate, useLocation } from "react-router-dom";
 
import { useMediaQuery, useTheme } from "@mui/material";
 
const DataDisplay = ({ selectedUserID }) => {
  const { primaryColor } = useContext(VetAppearanceContext);
  const textColor =
    primaryColor === "#2D4746" || primaryColor === "#EF6068"
      ? "white"
      : "black";
  const location = useLocation();
  const [imageDataPairs, setImageDataPairs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [otherText, setOtherText] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);
  const [isResponseAvailable, setIsResponseAvailable] = useState(false);
  const [timestamp, setTimestamp] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
 
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedUserID) {
        console.error("No selectedUserID provided");
        return;
      }
 
      try {
        const droppingsCollectionRef = collection(db, "vetData");
        const q = query(
          droppingsCollectionRef,
          where("userID", "==", selectedUserID)
        );
        const snapshot = await getDocs(q);
 
        if (snapshot.empty) {
          setImageDataPairs([]);
          setCurrentIndex(0);
          setIsDisabled(true);
          setIsResponseAvailable(false);
          return;
        }
 
       
        const filteredData = snapshot.docs.map((doc) => {
          const docData = doc.data();
          return { ...docData, id: doc.id, timestamp: docData.timestamp };
        });
 
       
        const sortedData = filteredData.sort((a, b) => {
          const timestampA = new Date(a.timestamp);
          const timestampB = new Date(b.timestamp);
          return timestampB - timestampA;
        });
 
        const imageDataWithUrls = await Promise.all(
          sortedData.map(async (item) => {
            if (!item.imageName) {
              return { ...item, imageUrl: null };
            }
            try {
              const imageRef = ref(storage, `dataProcessed/${item.imageName}`);
              const url = await getDownloadURL(imageRef);
              return { ...item, imageUrl: url };
            } catch (error) {
              console.error("Error fetching image URL:", error);
              return { ...item, imageUrl: null };
            }
          })
        );
 
        setImageDataPairs(imageDataWithUrls);
        setCurrentIndex(0);
 
       
        const firstItemResponse = imageDataWithUrls[0]?.response ?? null;
        setIsResponseAvailable(firstItemResponse === null);
        setIsDisabled(firstItemResponse !== null);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
 
    fetchData();
  }, [selectedUserID]);
 
  const handleNext = () => {
    if (currentIndex < imageDataPairs.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };
 
  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };
 
  const handleViewData = () => {
    const selectedData = imageDataPairs[currentIndex];
    navigate("/v/viewdata", { state: { selectedData } });
  };
 
  const handleButtonClick = (response) => {
    const currentTimestamp = new Date().toLocaleString();
    setTimestamp(currentTimestamp);
    if (imageDataPairs[currentIndex]?.response === null) {
     
      updateResponseInFirestore(response);
      setIsDisabled(true);
      setIsResponseAvailable(false);
    } else {
     
      updateResponseInFirestore(response);
      setIsDisabled(true);
      setIsResponseAvailable(false);
    }
  };
 
 
  const handleEditClick = (response) => {
    setIsDisabled(false);
    setIsResponseAvailable(true);
  };
 
  const handleOtherTextChange = (e) => {
    const newText = e.target.value;
    setOtherText(newText);  
  };
 
  const handleOtherTextFinish = async () => {
    if (imageDataPairs[currentIndex]?.response === null) {
      setIsDisabled(true);
      const currentTimestamp = new Date().toLocaleString();
      setTimestamp(currentTimestamp);
      await updateResponseInFirestore(otherText);
      setIsResponseAvailable(false);
    }
  };
 
  const updateResponseInFirestore = async (response) => {
    if (!selectedUserID) {
      console.error("No selectedUserID provided");
      return;
    }
 
    const selectedData = imageDataPairs[currentIndex];
 
    const currentTimestamp = new Date().toLocaleString();
 
    try {
      const docRef = doc(db, "vetData", selectedData.id);
      await updateDoc(docRef, {
        response: response,
        responseTimestamp: currentTimestamp,
      });
    } catch (error) {
      console.error("Error updating response:", error);
    }
  };
 
  return (
    <Box
      className="chart-container"
      borderColor="grey.300"
      display="flex"
      sx={{ width: "100%" }}
    >
      <Card
        variant="elevation"
        elevation={2}
        sx={{
          borderRadius: "16px",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
          flex: 1,
        }}
      >
        <Box
          display="flex"
          flexDirection={isMobile ? "column" : "row"}
          justifyContent="space-between"
          width="100%"
          sx={{
            padding: isMobile ? "8px" : "16px",
          }}
        >
         
          <Box
            flex={1}
            sx={{
              padding: isMobile ? "8px" : "16px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
           
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="space-between"
              alignItems="center"
              mt={2}
              borderColor="grey.300"
              width="100%"
            >
              {imageDataPairs.length > 0 && (
                <Grid container spacing={isMobile ? 1 : 2}>
                  {" "}
                  {/* Row for navigation buttons */}
                  <Grid item xs={12}>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{
                        width: "100%",
                        padding: isMobile ? "0 8px" : "0 16px",
                      }}
                    >
                      <Button
                        variant="contained"
                        onClick={handleBack}
                        disabled={currentIndex === 0}
                        sx={{
                          backgroundColor: "#d3d3d3",
                          "&:hover": {
                            backgroundColor: "#b0b0b0",
                          },
                          color: "black",
                          width: isMobile ? "30%" : "auto",
                          fontSize: isMobile ? "12px" : "inherit",
                        }}
                      >
                        Back
                      </Button>
 
                     
                      <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        sx={{
                          flexGrow: 1,
                          textAlign: "center",
                          margin: isMobile ? "0" : "0 16px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: isMobile ? "12px" : "16px",
                            fontWeight: "bold",
                          }}
                        >
                          Page {currentIndex + 1} of {imageDataPairs.length}
                        </span>
                      </Box>
 
                      <Button
                        variant="contained"
                        onClick={handleNext}
                        disabled={currentIndex === imageDataPairs.length - 1}
                        sx={{
                          backgroundColor: "#d3d3d3",
                          "&:hover": {
                            backgroundColor: "#b0b0b0",
                          },
                          color: "black",
                          width: isMobile ? "30%" : "auto",
                          fontSize: isMobile ? "12px" : "inherit",
                        }}
                      >
                        Next
                      </Button>
                    </Box>
                  </Grid>
                 
                  <Grid
                    item
                    xs={12}
                    container
                    justifyContent="space-between"
                    flexDirection={isMobile ? "row" : "column"}
                    spacing={isMobile ? 1 : 2}
                  >
                   
                    <Grid item xs={12} display="flex" justifyContent="center">
                      <Box
                        sx={{
                          width: "100%",
                          maxWidth: isMobile ? "200px" : "300px",
                          height: isMobile ? "200px" : "300px",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          overflow: "hidden",
                        }}
                      >
                        <img
                          src={imageDataPairs[currentIndex].imageUrl}
                          alt={`Detected Dropping ${currentIndex + 1}`}
                          style={{
                            maxWidth: "100%",
                            maxHeight: "100%",
                            objectFit: "contain",
                            borderRadius: "8px",
                          }}
                        />
                      </Box>
                    </Grid>
 
                 
                    <Grid
                      item
                      xs={12}
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      sx={{
                        height: "auto",
                        marginTop: isMobile ? "8px" : "0",
                      }}
                    >
                      <Button
                        variant="contained"
                        sx={{
                          backgroundColor: "#f5f5f5",
                          color: "black",
                          width: isMobile ? "120px" : "150px",
                          height: isMobile ? "40px" : "50px",
                          fontWeight: "bold",
                          fontSize: isMobile ? "12px" : "16px",
                          "&:hover": {
                            backgroundColor: "white",
                          },
                        }}
                        onClick={handleViewData}
                      >
                        View Data
                      </Button>
                    </Grid>
                  </Grid>
                 
                  <Grid item xs={12}>
                    <Box
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      sx={{
                        paddingX: "16px",
                        marginTop: "16px",
                        width: "100%",
                        overflowX: isMobile ? "auto" : "visible",
                      }}
                    >
                      <table
                        style={{
                          width: "100%",
                          textAlign: "center",
                          borderCollapse: "collapse",
                          tableLayout: isMobile ? "auto" : "fixed",
                        }}
                      >
                        <thead>
                          <tr style={{ color: textColor }}>
                            <th
                              style={{
                                border: "1px solid #ccc",
                                padding: isMobile ? "8px" : "5px",
                                fontSize: isMobile ? "12px" : "16px",
                              }}
                            >
                              Coccidiosis-like
                            </th>
                            <th
                              style={{
                                border: "1px solid #ccc",
                                padding: isMobile ? "8px" : "5px",
                                fontSize: isMobile ? "12px" : "16px",
                              }}
                            >
                              NCD-like
                            </th>
                            <th
                              style={{
                                border: "1px solid #ccc",
                                padding: isMobile ? "8px" : "5px",
                                fontSize: isMobile ? "12px" : "16px",
                              }}
                            >
                              Salmonella-like
                            </th>
                            <th
                              style={{
                                border: "1px solid #ccc",
                                padding: isMobile ? "8px" : "5px",
                                fontSize: isMobile ? "12px" : "16px",
                              }}
                            >
                              Healthy
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td
                              style={{
                                border: "1px solid #ccc",
                                padding: isMobile ? "8px" : "5px",
                                fontSize: isMobile ? "12px" : "16px",
                              }}
                            >
                              {imageDataPairs[currentIndex].detectedDroppings[
                                "Coccidiosis-like"
                              ] || "--"}
                            </td>
                            <td
                              style={{
                                border: "1px solid #ccc",
                                padding: isMobile ? "8px" : "5px",
                                fontSize: isMobile ? "12px" : "16px",
                              }}
                            >
                              {imageDataPairs[currentIndex].detectedDroppings[
                                "NCD-like"
                              ] || "--"}
                            </td>
                            <td
                              style={{
                                border: "1px solid #ccc",
                                padding: isMobile ? "8px" : "5px",
                                fontSize: isMobile ? "12px" : "16px",
                              }}
                            >
                              {imageDataPairs[currentIndex].detectedDroppings[
                                "Salmonella-like"
                              ] || "--"}
                            </td>
                            <td
                              style={{
                                border: "1px solid #ccc",
                                padding: isMobile ? "8px" : "5px",
                                fontSize: isMobile ? "12px" : "16px",
                              }}
                            >
                              {imageDataPairs[currentIndex].detectedDroppings[
                                "Healthy"
                              ] || "--"}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </Box>
                  </Grid>
                </Grid>
              )}
            </Box>
          </Box>
 
         
          <Box
            flex={1}
            sx={{
              padding: "16px",
              paddingLeft: isMobile ? "16px" : "40px",
              paddingRight: isMobile ? "16px" : "40px",
              borderLeft: isMobile ? "none" : "3px solid #ccc",
            }}
          >
            {/* Edit Icon */}
            <Box
              display="flex"
              justifyContent="flex-end"
              sx={{ position: "relative" }}
            >
              <IconButton
                sx={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  color: "black",
                }}
                onClick={handleEditClick}
              >
                <EditIcon />
              </IconButton>
            </Box>
 
            {/* Response Section */}
            <Box
              className="dataset-display"
              display="flex"
              flexDirection="column"
              alignItems="flex-start"
              justifyContent="center"
              sx={{ marginTop: "48px" }}
            >
              <Box
                display="flex"
                justifyContent="flex-start"
                alignItems="center"
              >
                <span
                  style={{
                    fontSize: isMobile ? "16px" : "20px",
                    fontWeight: "bold",
                  }}
                >
                  Response:
                </span>
              </Box>
 
              <Box
                display="flex"
                flexDirection={isMobile ? "column" : "column"}
                alignItems="center"
                justifyContent="center"
                mt={2}
                sx={{ width: "100%" }}
              >
                <Box
                  display="flex"
                  justifyContent="space-between"
                  width="100%"
                  mb={2}
                  flexDirection={isMobile ? "column" : "row"}
                >
                  <Button
                    style={{
                      color:
                        isDisabled || !isResponseAvailable
                          ? "#b0b0b0"
                          : textColor,
                      fontSize: isMobile ? "14px" : "16px",
                      marginBottom: isMobile ? "8px" : "0",
                    }}
                    variant="contained"
                    sx={{ flex: isMobile ? 1 : "unset", marginRight: "8px" }}
                    onClick={() => handleButtonClick("Coccidiosis")}
                    disabled={isDisabled || !isResponseAvailable}
                  >
                    Coccidiosis
                  </Button>
 
                  <Button
                    style={{
                      color:
                        isDisabled || !isResponseAvailable
                          ? "#b0b0b0"
                          : textColor,
                      fontSize: isMobile ? "14px" : "16px",
                      marginBottom: isMobile ? "8px" : "0",
                    }}
                    variant="contained"
                    sx={{ flex: isMobile ? 1 : "unset", marginRight: "8px" }}
                    onClick={() => handleButtonClick("Healthy")}
                    disabled={isDisabled || !isResponseAvailable}
                  >
                    Healthy
                  </Button>
 
                  <Button
                    style={{
                      color:
                        isDisabled || !isResponseAvailable
                          ? "#b0b0b0"
                          : textColor,
                      fontSize: isMobile ? "14px" : "16px",
                      marginBottom: isMobile ? "8px" : "0",
                    }}
                    variant="contained"
                    sx={{ flex: isMobile ? 1 : "unset", marginRight: "8px" }}
                    onClick={() => handleButtonClick("Salmonella")}
                    disabled={isDisabled || !isResponseAvailable}
                  >
                    Salmonella
                  </Button>
 
                  <Button
                    style={{
                      color:
                        isDisabled || !isResponseAvailable
                          ? "#b0b0b0"
                          : textColor,
                      fontSize: isMobile ? "14px" : "16px",
                      marginBottom: isMobile ? "8px" : "0",
                    }}
                    variant="contained"
                    sx={{ flex: isMobile ? 1 : "unset" }}
                    onClick={() => handleButtonClick("NCD")}
                    disabled={isDisabled || !isResponseAvailable}
                  >
                    NCD
                  </Button>
                </Box>
 
                <TextField
                  label="Other/s"
                  variant="outlined"
                  multiline
                  rows={4}
                  value={otherText}
                  onChange={handleOtherTextChange}
                  onBlur={handleOtherTextFinish}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleOtherTextFinish()
                  }
                  disabled={isDisabled || !isResponseAvailable}
                  fullWidth
                  InputProps={{
                    style: {
                      fontSize: isMobile ? "12px" : "14px",
                    },
                  }}
                />
              </Box>
 
              <Box
                sx={{
                  fontSize: isMobile ? "14px" : "18px",
                  fontWeight: "bold",
                  color: "#555",
                  textAlign: "center",
                }}
              >
                <span>
                  Response:{" "}
                  {imageDataPairs[currentIndex]?.response
                    ? imageDataPairs[currentIndex].response
                    : "No Response Yet"}
                </span>
              </Box>
 
              <Box
                mt={2}
                sx={{
                  textAlign: "center",
                  fontSize: isMobile ? "12px" : "14px",
                  color: "gray",
                }}
              >
                <span>
                  Response Updated:{" "}
                  {imageDataPairs[currentIndex]?.responseTimestamp
                    ? imageDataPairs[currentIndex].responseTimestamp
                    : "Timestamp Not Available"}
                </span>
              </Box>
            </Box>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};
 
export default DataDisplay;