import React, { useEffect, useState, useContext } from "react";
import { useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { VetAppearanceContext } from "../../veterinarian/settings/AppearanceContext";
import { useMediaQuery, useTheme, Button, Box } from "@mui/material";
 
const ViewData = () => {
  const { primaryColor } = useContext(VetAppearanceContext);
  const textColor =
    primaryColor === "#2D4746" || primaryColor === "#EF6068"
      ? "white"
      : "black";
 
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const location = useLocation();
  const selectedData = location.state?.selectedData;
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    if (!selectedData) {
      console.error("No data passed for viewing");
      return;
    }
    setLoading(false);
  }, [selectedData]);
 
  if (loading) {
    return <div>Loading data...</div>;
  }
 
  if (!selectedData) {
    return <div>No data provided for viewing</div>;
  }
 
  const {
    temperature,
    humidity,
    imageDateTaken,
    timestamp,
    housing,
    age,
    feedIntake,
    waterIntake,
    averageWeight,
    numberOfDeaths,
    totalPopulation,
    mortalityRate,
    detectedDroppings,
    imageUrl,
  } = selectedData;
 
  const downloadImage = () => {
    if (imageUrl) {
      const a = document.createElement("a");
      a.href = imageUrl;
      a.download = "Processed_Image.jpg";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };
 
  return (
    <div
      className="dataset-display"
      style={{
        padding: isMobile ? "16px" : "32px",
        paddingLeft: isMobile ? "8px" : "32px",
        paddingRight: isMobile ? "8px" : "32px",
      }}
    >
      <Button
        onClick={() => window.history.back()}
        style={{
          color: textColor,
          marginBottom: isMobile ? "16px" : "32px",
          fontSize: isMobile ? "12px" : "inherit",
        }}
      >
        <FontAwesomeIcon icon={faArrowLeft} />
      </Button>
 
      <div className="data-container">
        {/* Metadata Section */}
        <Box
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between",
            gap: isMobile ? "16px" : "32px",
            marginBottom: isMobile ? "16px" : "32px",
            fontSize: isMobile ? "12px" : "inherit",
          }}
        >
          <div className="metadata" style={{ flex: 1 }}>
            <h2 style={{ fontSize: isMobile ? "12px" : "inherit" }}>
              Data Summary
            </h2>
            <p style={{ fontSize: isMobile ? "12px" : "inherit" }}>
              <strong>Sent Date:</strong>{" "}
              <span>
                {timestamp ? new Date(timestamp).toLocaleDateString() : "--"}
              </span>
            </p>
            <p style={{ fontSize: isMobile ? "12px" : "inherit" }}>
              <strong>Date of Image Taken:</strong>{" "}
              <span>{imageDateTaken || "--"}</span>
            </p>
            <p style={{ fontSize: isMobile ? "12px" : "inherit" }}>
              <strong>Temperature:</strong> <span>{temperature || "--"}</span>
            </p>
            <p style={{ fontSize: isMobile ? "12px" : "inherit" }}>
              <strong>Humidity:</strong> <span>{humidity || "--"}</span>
            </p>
            <p style={{ fontSize: isMobile ? "12px" : "inherit" }}>
              <strong>Housing Type:</strong> <span>{housing || "--"}</span>
            </p>
            <p style={{ fontSize: isMobile ? "12px" : "inherit" }}>
              <strong>Age:</strong> <span>{age || "--"}</span>
            </p>
            <p style={{ fontSize: isMobile ? "12px" : "inherit" }}>
              <strong>Feed Intake:</strong> <span>{feedIntake || "--"}</span>
            </p>
            <p style={{ fontSize: isMobile ? "12px" : "inherit" }}>
              <strong>Water Intake:</strong> <span>{waterIntake || "--"}</span>
            </p>
            <p style={{ fontSize: isMobile ? "12px" : "inherit" }}>
              <strong>Average Weight:</strong>{" "}
              <span>{averageWeight || "--"}</span>
            </p>
            <p style={{ fontSize: isMobile ? "12px" : "inherit" }}>
              <strong>Number of Deaths:</strong>{" "}
              <span>{numberOfDeaths || "--"}</span>
            </p>
            <p style={{ fontSize: isMobile ? "12px" : "inherit" }}>
              <strong>Total Population:</strong>{" "}
              <span>{totalPopulation || "--"}</span>
            </p>
            <p style={{ fontSize: isMobile ? "12px" : "inherit" }}>
              <strong>Mortality Rate:</strong>{" "}
              <span>{mortalityRate || "--"}</span>
            </p>
 
            <h2 style={{ fontSize: isMobile ? "12px" : "inherit" }}>
              Detected Droppings Data
            </h2>
            <table
              className="dataTable"
              style={{ width: "100%", textAlign: "center" }}
            >
              <thead>
                <tr style={{ color: textColor }}>
                  <th style={{ fontSize: isMobile ? "12px" : "inherit" }}>
                    Coccidiosis-like
                  </th>
                  <th style={{ fontSize: isMobile ? "12px" : "inherit" }}>
                    Healthy
                  </th>
                  <th style={{ fontSize: isMobile ? "12px" : "inherit" }}>
                    NCD-like
                  </th>
                  <th style={{ fontSize: isMobile ? "12px" : "inherit" }}>
                    Salmonella-like
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontSize: isMobile ? "12px" : "inherit" }}>
                    {detectedDroppings["Coccidiosis-like"] || "--"}
                  </td>
                  <td style={{ fontSize: isMobile ? "12px" : "inherit" }}>
                    {detectedDroppings["Healthy"] || "--"}
                  </td>
                  <td style={{ fontSize: isMobile ? "12px" : "inherit" }}>
                    {detectedDroppings["NCD-like"] || "--"}
                  </td>
                  <td style={{ fontSize: isMobile ? "12px" : "inherit" }}>
                    {detectedDroppings["Salmonella-like"] || "--"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
 
          {/* Image Section */}
          <div
            className="image-container"
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {imageUrl ? (
              <img
                id="dataDisplay"
                src={imageUrl}
                alt="Processed"
                style={{
                  maxWidth: isMobile ? "100%" : "300px",
                  maxHeight: "300px",
                  objectFit: "contain",
                  borderRadius: "8px",
                  marginBottom: isMobile ? "16px" : "32px",
                }}
              />
            ) : (
              <p style={{ fontSize: isMobile ? "12px" : "inherit" }}>
                No image available
              </p>
            )}
            <Button
              onClick={downloadImage}
              style={{
                color: textColor,
                fontSize: isMobile ? "12px" : "inherit",
              }}
              variant="contained"
            >
              Download Photo
            </Button>
          </div>
        </Box>
      </div>
    </div>
  );
};
 
export default ViewData;