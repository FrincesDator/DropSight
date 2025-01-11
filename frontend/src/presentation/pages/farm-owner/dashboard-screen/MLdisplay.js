import React, { useEffect, useState, useContext } from "react";
import { Card, CardContent, Box, Button, Container, Stack, Grid, useMediaQuery} from "@mui/material";
import { FarmAppearanceContext } from "../../farm-owner/settings/AppearanceContext";
import { ref, getDownloadURL } from "firebase/storage";
import { collection, getDocs } from "firebase/firestore";
import { db, storage } from "../../../../core/firebase/firebase-config";
import "../../../../core/style/Dashboard.css";
import Model from "./Model";
import { useNavigate, useLocation } from "react-router-dom";
 
const MLdisplay = () => {
  const { primaryColor } = useContext(FarmAppearanceContext);
  const textColor =
    primaryColor === "#2D4746" || primaryColor === "#EF6068"
      ? "white"
      : "black";
  const location = useLocation();
  const [imageDataPairs, setImageDataPairs] = useState([]); // Store image data
  const [currentIndex, setCurrentIndex] = useState(0); // Track current index of images
  const navigate = useNavigate(); // Initialize useNavigate
 
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Step 1: Get user data from localStorage
        const storedUser = localStorage.getItem("loggedInUser");
        let parsedUser = null;
        if (storedUser) {
          parsedUser = JSON.parse(storedUser);
        }
 
        // Step 2: Fetch the data from Firestore (detectedDroppings collection)
        const querySnapshot = await getDocs(
          collection(db, "detectedDroppings")
        );
 
        // Step 3: Filter data for the current user (if UserID exists in Firestore document)
        const filteredData = [];
        querySnapshot.forEach((doc) => {
          const docData = doc.data();
          if (docData.UserID === parsedUser?.UserID) {
            const imageName = docData.imageName; // Get imageName from Firestore document
            filteredData.push({ ...docData, imageName, id: doc.id });
          }
        });
 
        // Step 4: Fetch the vetData collection to get the response and responseTimestamp field based on UserID and imageName
        const vetDataQuerySnapshot = await getDocs(collection(db, "vetData"));
 
    // Step 5: Sort filtered data by the number in the imageName after 'F21-0001)photo_'
const sortedData = filteredData.sort((a, b) => {
  // Extract the number after 'F21-0001)photo_'
  const extractNumber = (imageName) => {
    const match = imageName.match(/\)photo_(\d+)/); // Matches ')photo_' followed by digits
    return match ? parseInt(match[1], 10) : 0; // Default to 0 if no match is found
  };
 
  const numberA = extractNumber(a.imageName); // Assuming the imageName is in a.imageName
  const numberB = extractNumber(b.imageName);
 
  return numberB - numberA; // Descending order
});
 
        // Step 6: Get the image URL from Firebase Storage and attach response and responseTimestamp field
        const imageDataWithUrls = await Promise.all(
          sortedData.map(async (item) => {
            const imageRef = ref(storage, `dataProcessed/${item.imageName}`);
 
            try {
              const url = await getDownloadURL(imageRef);
 
              // Step 7: Find the vetData entry based on matching UserID and imageName
              const vetDoc = vetDataQuerySnapshot.docs.find(
                (doc) =>
                  doc.data().UserID === item.userID &&
                  doc.data().imageName === item.imageName
              );
              const response = vetDoc
                ? vetDoc.data().response
                : "No Response Yet"; // Check response
              const responseTimestamp = vetDoc
                ? vetDoc.data().responseTimestamp
                : null; // Get responseTimestamp
 
              // Return the item with image URL, response, and responseTimestamp
              return { ...item, imageUrl: url, response, responseTimestamp };
            } catch (error) {
              return {
                ...item,
                imageUrl: null,
                response: "No Available Data",
                responseTimestamp: null,
              }; // Handle error case
            }
          })
        );
 
        setImageDataPairs(imageDataWithUrls); // Update state with the combined data
      } catch (error) {
        console.error("Error fetching Firestore or Storage data:", error);
      }
    };
 
    fetchData();
  }, []); // Empty dependency array ensures this runs only once
 
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
    const selectedData = imageDataPairs[currentIndex]; // Ensure selectedData has detectedDroppings or similar
    navigate("/f/viewdata", { state: { selectedData } });
  };
 
  const isMobile = useMediaQuery('(max-width:600px)'); // This can be adjusted for your mobile breakpoint
 
  return (
    <Box className="chart-container" borderColor="grey.300" display="flex" sx={{ width: "100%" }}>
      <Card
        variant="elevation"
        elevation={2}
        sx={{ boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)", borderRadius: "16px", flex: 1 }}
      >
        <Box display="flex" justifyContent="space-between" mt={2} sx={{ width: "100%", pl: 4, pr: 4 }}>
          <Button
            variant="contained"
            onClick={handleBack}
            disabled={currentIndex === 0}
            sx={{
              backgroundColor: "#d3d3d3",
              "&:hover": { backgroundColor: "#b0b0b0" },
              color: "black",
            }}
          >
            Back
          </Button>
 
          <Box display="flex" alignItems="center">
            <span style={{ fontSize: "16px", fontWeight: "bold" }}>
              Page {currentIndex + 1} of {imageDataPairs.length}
            </span>
          </Box>
 
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={currentIndex === imageDataPairs.length - 1}
            sx={{
              backgroundColor: "#d3d3d3",
              "&:hover": { backgroundColor: "#b0b0b0" },
              color: "black",
            }}
          >
            Next
          </Button>
        </Box>
 
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} mb="0">
            <Container className="chart-container">
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
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                      <Box
                        sx={{
                          width: "100%",
                          height: "150px",
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
 
                    <Grid item xs={12} md={4} sx={{ display: "flex", justifyContent: "center" }}>
                      <Button
                        variant="contained"
                        sx={{
                          backgroundColor: "#f5f5f5",
                          color: "black",
                          width: "150px",
                          height: "50px",
                          fontWeight: "bold",
                          fontSize: "16px",
                          "&:hover": { backgroundColor: "white" },
                        }}
                        onClick={handleViewData}
                      >
                        View Data
                      </Button>
                    </Grid>
 
                    <Grid item xs={12} md={4}>
                      <Box display="flex" flexDirection="column" alignItems="center" width="100%">
                        <Box
                          sx={{
                            overflowX: "auto",
                            width: "100%",
                            marginLeft: "40px",
                          }}
                        >
                          <table
                            style={{
                              width: "100%",
                              maxWidth: "500px", // Set a max width for better scaling
                              textAlign: "center",
                              borderCollapse: "collapse",
                              margin: "0 auto", // Center the table
                            }}
                          >
                            <thead>
                              <tr style={{ color: textColor }}>
                                <th
                                  style={{
                                    border: "1px solid #ccc",
                                    padding: "5px 8px",
                                    fontSize: "14px", // Adjusted font size for smaller screens
                                  }}
                                >
                                  Coccidiosis-like
                                </th>
                                <th
                                  style={{
                                    border: "1px solid #ccc",
                                    padding: "5px 8px",
                                    fontSize: "14px",
                                  }}
                                >
                                  NCD-like
                                </th>
                                <th
                                  style={{
                                    border: "1px solid #ccc",
                                    padding: "5px 8px",
                                    fontSize: "14px",
                                  }}
                                >
                                  Salmonella-like
                                </th>
                                <th
                                  style={{
                                    border: "1px solid #ccc",
                                    padding: "5px 8px",
                                    fontSize: "14px",
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
                                    padding: "5px 8px",
                                    fontSize: "14px",
                                  }}
                                >
                                  {imageDataPairs[currentIndex].detectionsCount?.["Coccidiosis-like"] || 0}
                                </td>
                                <td
                                  style={{
                                    border: "1px solid #ccc",
                                    padding: "5px 8px",
                                    fontSize: "14px",
                                  }}
                                >
                                  {imageDataPairs[currentIndex].detectionsCount?.["NCD-like"] || 0}
                                </td>
                                <td
                                  style={{
                                    border: "1px solid #ccc",
                                    padding: "5px 8px",
                                    fontSize: "14px",
                                  }}
                                >
                                  {imageDataPairs[currentIndex].detectionsCount?.["Salmonella-like"] || 0}
                                </td>
                                <td
                                  style={{
                                    border: "1px solid #ccc",
                                    padding: "5px 8px",
                                    fontSize: "14px",
                                  }}
                                >
                                  {imageDataPairs[currentIndex].detectionsCount?.["Healthy"] || 0}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </Box>
 
                        {/* Align "Response" and "Response Timestamp" boxes with the table */}
                        {isMobile ? (
                          <>
                            <Box
                              sx={{
                                width: "100%",
                                display: "flex",
                                justifyContent: "center",
                                mt: 2,
                              }}
                            >
                              <Box
                                sx={{
                                  fontSize: "16px",
                                  fontWeight: "bold",
                                  color: "#555",
                                  textAlign: "center",
                                  paddingTop: "16px",
                                }}
                              >
                                <span>Response: {imageDataPairs[currentIndex].response}</span>
                              </Box>
                            </Box>
 
                            <Box
                              sx={{
                                width: "100%",
                                display: "flex",
                                justifyContent: "center",
                                mt: 1,
                              }}
                            >
                              <Box
                                sx={{
                                  fontSize: "12px",
                                  fontWeight: "bold",
                                  color: "#555",
                                  textAlign: "center",
                                }}
                              >
                                <span>
                                  {imageDataPairs[currentIndex]?.responseTimestamp
                                    ? new Date(imageDataPairs[currentIndex].responseTimestamp).toLocaleString()
                                    : ""}
                                </span>
                              </Box>
                            </Box>
                          </>
                        ) : (
                          <>
                            <Box
                              sx={{
                                width: "100%",
                                display: "flex",
                                justifyContent: "center",
                                mt: 2,
                              }}
                            >
                              <Box
                                sx={{
                                  fontSize: "14px",
                                  fontWeight: "bold",
                                  color: "#555",
                                  textAlign: "center",
                                  marginLeft: "40px",
                                }}
                              >
                                <span>
                                  {imageDataPairs[currentIndex]?.responseTimestamp
                                    ? new Date(imageDataPairs[currentIndex].responseTimestamp).toLocaleString()
                                    : ""}
                                </span>
                              </Box>
                            </Box>
 
                            <Box
                              sx={{
                                width: "100%",
                                display: "flex",
                                justifyContent: "center",
                                mt: 1,
                              }}
                            >
                              <Box
                                sx={{
                                  fontSize: "16px",
                                  fontWeight: "bold",
                                  color: "#555",
                                  textAlign: "center",
                                  paddingTop: "16px",
                                  marginLeft: "40px",
                                }}
                              >
                                <span>Response: {imageDataPairs[currentIndex].response}</span>
                              </Box>
                            </Box>
                          </>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                )}
                <Box display="flex" justifyContent="center" mt={2}>
                  <Model />
                </Box>
              </Box>
            </Container>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
 
};
 
export default MLdisplay;