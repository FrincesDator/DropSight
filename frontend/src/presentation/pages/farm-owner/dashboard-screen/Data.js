import React, { useEffect, useState, useContext } from 'react';
import { db, storage } from '../../../../core/firebase/firebase-config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { ref as storageRef, getDownloadURL } from 'firebase/storage';
import "../../../../core/style/data.css";
import { FarmAppearanceContext } from "../../farm-owner/settings/AppearanceContext";
import { useLocation } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useMediaQuery, useTheme, } from "@mui/material";


const DatasetDisplay = () => {
  const { primaryColor } = useContext(FarmAppearanceContext);
  const location = useLocation();
  const selectedData = location.state?.selectedData;
  const textColor =
    primaryColor === "#2D4746" || primaryColor === "#EF6068"
      ? "white"
      : "black";
  const [temperature, setTemperature] = useState("-- °C");
  const [humidity, setHumidity] = useState("--%");
  const [imageDate, setImageDateTaken] = useState("--");
  const [metrics, setMetrics] = useState({
    age: "--",
    feedIntake: "--",
    waterIntake: "--",
    averageWeight: "--",
    numberOfDeaths: "--",
    totalPopulation: "--",
    housing: "--",
    mortalityRate: "--", 
  });
  const [detectedDroppings, setDetectedDroppings] = useState({
    "Coccidiosis-like": "--",
    "Healthy": "--",
    "NCD-like": "--",
    "Salmonella-like": "--",
  });
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const displayTemperature = (temperature, ageDays) => {
    if (isNaN(temperature) || isNaN(ageDays)) {
      return "Invalid Input";
    }

    const thresholds = {
      1: [0, 28],
      3: [0, 26],
      6: [0, 24],
      9: [0, 24],
      12: [0, 24],
      15: [0, 24],
    };

    const [low, high] = thresholds[ageDays] || [0, Infinity];

    let tempCategory;
    let tempNum;

    if (temperature <= low) {
      tempCategory = `${temperature}°C - Low`;
      tempNum = 3;
    } else if (temperature > low && temperature <= high) {
      tempCategory = `${temperature}°C - Normal`;
      tempNum = 2;
    } else {
      tempCategory = `${temperature}°C - High`;
      tempNum = 1;
    }

    return { tempCategory, tempNum };
  };
  const displayHumidity = (humidity, ageDays) => {
    if (isNaN(humidity) || isNaN(ageDays)) {
      return "Invalid Input";
    }

    const thresholds = {
      1: [0, 59],
      3: [0, 59],
      6: [0, 59],
      9: [0, 59],
      12: [0, 59],
      15: [0, 59],
    };

    const [low, high] = thresholds[ageDays] || [0, Infinity];

    let humidityCategory;
    let humidityNum;

    if (humidity < low) {
      humidityCategory = `${humidity}% - Low`;
      humidityNum = 3;
    } else if (humidity >= low && humidity <= high) {
      humidityCategory = `${humidity}% - Normal`;
      humidityNum = 2;
    } else {
      humidityCategory = `${humidity}% - High`;
      humidityNum = 1;
    }

    return { humidityCategory, humidityNum };
  };
  const calculateMortalityRate = (deaths, population) => {
    if (!isNaN(deaths) && !isNaN(population) && population > 0) {
      return ((deaths / population) * 100).toFixed(2);
    }
    return "No Input";
  };
  const displayMortalityRate = (mortalityRateStr) => {
    if (mortalityRateStr === "No Input") {
      return mortalityRateStr;
    }

    const mortalityRate = Number(mortalityRateStr);

    let status = mortalityRate <= 5 ? "Normal" : "High";
    let mortalityNum = mortalityRate <= 5 ? 2 : 1;

    return mortalityNum;
  };
  const displayWaterIntake = (waterIntake, ageNumber, totalPopulation) => {
    if (isNaN(waterIntake) || isNaN(ageNumber) || totalPopulation <= 0) {
      return "Invalid Input";
    }
    const waterIntakeThresholds = {
      1: [0.2, 0.4],
      2: [0.4, 0.6],
      3: [0.6, 0.8],
      4: [0.8, 1.0],
      5: [1.0, 1.2],
      6: [1.2, 1.4],
      7: [1.4, 1.6],
      8: [1.6, 1.8],
      9: [1.8, 2.0],
      10: [2.0, 2.2],
      11: [2.2, 2.4],
      12: [2.4, 2.6],
      13: [2.6, 2.8],
      14: [2.8, 3.0],
      15: [3.0, 3.2],
      16: [3.2, 3.4],
      17: [3.4, 3.6],
      18: [3.6, 3.8],
      19: [3.8, 4.0],
      20: [4.0, 4.2],
      21: [4.2, 4.4],
      22: [4.4, 4.6],
      23: [4.6, 4.8],
      24: [4.8, 5.0],
      25: [5.0, 5.2],
      26: [5.2, 5.4],
      27: [5.4, 5.6],
      28: [5.6, 5.8],
      29: [5.8, 6.0],
      30: [6.0, 6.2],
      31: [6.2, 6.4],
      32: [6.4, 6.6],
      33: [6.6, 6.8],
      34: [6.8, 7.0],
      35: [7.0, 7.2],
      36: [7.2, 7.4],
      37: [7.4, 7.6],
      38: [7.6, 7.8],
      39: [7.8, 8.0],
      40: [8.0, 8.2],
      41: [8.2, 8.4],
      42: [8.4, 8.6],
      43: [8.6, 8.8],
      44: [8.8, 9.0],
      45: [9.0, 9.2],
    };
    const [low, high] = waterIntakeThresholds[ageNumber] || [0, Infinity];
    let waterCategory;
    let waterNum;
    if (waterIntake < low) {
      waterCategory = `${waterIntake} Gallon/s - Low`;
      waterNum = 3;
    } else if (waterIntake >= low && waterIntake <= high) {
      waterCategory = `${waterIntake} Gallon/s - Normal`;
      waterNum = 2;
    } else {
      waterCategory = `${waterIntake} Gallon/s - High`;
      waterNum = 1;
    }
    return { waterCategory, waterNum };
  };
  const feedIntakeThresholds = {
    1: [0.005, 0.02],
    8: [0.035, 0.5],
    15: [0.075, 0.9],
    22: [0.125, 0.14],
    29: [0.155, 0.17],
    36: [0.185, 0.2],
    43: [0.215, 0.23],
  };
  const displayFeedIntake = (feedIntake, ageNumber) => {
    if (isNaN(feedIntake) || isNaN(ageNumber)) {
      return "Invalid Input";
    }

    const [low, high] = feedIntakeThresholds[ageNumber] || [0, Infinity];

    let feedCategory;
    let feedNum;

    if (feedIntake < low) {
      feedCategory = `${feedIntake} Gram/s - Low`;
      feedNum = 3;
    } else if (feedIntake >= low && feedIntake <= high) {
      feedCategory = `${feedIntake} Gram/s - Normal`;
      feedNum = 2;
    } else {
      feedCategory = `${feedIntake} Gram/s - High`;
      feedNum = 1;
    }

    return { feedCategory, feedNum };
  };
  const averageWeightThresholds = {
    1: [0.026429, 0.052857],
    2: [0.052857, 0.079286],
    3: [0.072986, 0.105714],
    4: [0.105714, 0.132143],
    5: [0.132143, 0.158571],
    6: [0.158571, 0.185],
    7: [0.185, 0.251429],
    8: [0.251429, 0.317857],
    9: [0.317857, 0.384286],
    10: [0.384286, 0.450714],
    11: [0.450714, 0.517143],
    12: [0.517143, 0.583571],
    13: [0.583571, 0.65],
    14: [0.65, 0.784714],
    15: [0.784714, 0.0919429],
    16: [0.0919429, 1.054143],
    17: [1.054143, 1.188857],
    18: [1.188857, 1.323571],
    19: [1.323571, 1.458286],
    20: [1.458286, 1.593],
    21: [1.593, 1.810714],
    22: [1.810714, 2.028429],
    23: [2.028429, 2.246143],
    24: [2.246143, 2.463857],
    25: [2.463857, 2.681571],
    26: [2.681571, 2.899286],
    27: [2.899286, 3.117],
    28: [3.117, 3.43],
    29: [3.43, 3.743],
    30: [3.743, 4.056],
    31: [4.056, 4.369],
    32: [4.369, 4.682],
    33: [4.682, 4.995],
    34: [4.995, 5.308],
    35: [5.308, 5.716143],
    36: [5.716143, 6.124286],
    37: [6.124286, 6.532429],
    38: [6.532429, 6.940571],
    39: [6.940571, 7.348714],
    40: [7.348714, 7.756857],
    41: [7.756857, 8.165],
    42: [8.165, 8.665857],
    43: [8.665857, 9.166714],
    44: [9.166714, 9.667571],
    45: [9.667571, 10.16843],
  };
  const displayAverageWeight = (averageWeight, ageNumber) => {
    if (isNaN(averageWeight) || isNaN(ageNumber)) {
      return "Invalid Input";
    }

    const [low, high] = averageWeightThresholds[ageNumber] || [0, Infinity];

    let weightCategory;
    let weightNum;

    if (averageWeight < low) {
      weightCategory = `${averageWeight} Kg - Low`;
      weightNum = 3;
    } else if (averageWeight >= low && averageWeight <= high) {
      weightCategory = `${averageWeight} Kg - Normal`;
      weightNum = 2;
    } else {
      weightCategory = `${averageWeight} Kg - High`;
      weightNum = 1;
    }

    return { weightCategory, weightNum };
  };
  const [health, setHealth] = useState(0);
  const [temp, setTemp] = useState(0);
  const [humi, setHumi] = useState(0);
  const [water, setWater] = useState(0);
  const [feed, setFeed] = useState(0);
  const [weight, setWeight] = useState(0);
  const [mortality, setMortality] = useState(0);
  const [formData, setFormData] = useState({});
  const [prediction, setPrediction] = useState('');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Detect if the screen is small

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (!selectedData) {
          console.error("No data passed for viewing");
          return;
        }

        const droppingsCollectionRef = collection(db, "detectedDroppings");
        const q = query(
          droppingsCollectionRef,
          where("UserID", "==", selectedData.UserID),
          where("imageName", "==", selectedData.imageName)
        );
        const droppingsSnapshot = await getDocs(q);

        if (!droppingsSnapshot.empty) {
          const doc = droppingsSnapshot.docs[0];
          const data = doc.data();

          if (data.temp) setTemperature(`${data.temp} °C`);
          if (data.humidity) setHumidity(`${data.humidity} %`);
          if (data.chickenHouseType)
            setMetrics((prev) => ({ ...prev, housing: data.chickenHouseType }));
          if (data.imageDateTaken) setImageDateTaken(data.imageDateTaken);

          setMetrics((prev) => ({
            ...prev,
            age: `${data.metrics.age} days`,
            feedIntake: `${data.metrics.feedIntake} kilograms`,
            waterIntake: `${data.metrics.waterIntake} litres`,
            averageWeight: `${data.metrics.averageWeight} kilograms`,
            numberOfDeaths: `${data.metrics.numberOfDeaths} heads`,
            totalPopulation: `${data.metrics.totalPopulation} birds`,
          }));

          const deaths = data.metrics.numberOfDeaths || 0;
          const population = data.metrics.totalPopulation || 0;
          const mortalityRate = calculateMortalityRate(deaths, population);
          setMetrics((prev) => ({
            ...prev,
            mortalityRate: displayMortalityRate(mortalityRate), 
          }));

          const healthStatusMapping = {
            "Coccidiosis-like": 1,
            Healthy: 2,
            "NCD-like": 3,
            "Salmonella-like": 4,
          };

          let highestDetection = "";
          let highestCount = -1;
          const detectionsDoc = data.detectionsCount || {};

          for (let key in detectionsDoc) {
            const count = detectionsDoc[key];
            if (count !== "--" && count > highestCount) {
              highestCount = count;
              highestDetection = key;
            }
          }

          setDetectedDroppings({
            "Coccidiosis-like": detectionsDoc["Coccidiosis-like"] || "--",
            Healthy: detectionsDoc["Healthy"] || "--",
            "NCD-like": detectionsDoc["NCD-like"] || "--",
            "Salmonella-like": detectionsDoc["Salmonella-like"] || "--",
          });

          const imageRef = storageRef(storage, `dataProcessed/${selectedData.imageName}`);
          const url = await getDownloadURL(imageRef);
          setImageUrl(url);

          const healthNum = healthStatusMapping[highestDetection] || 0;
          const tempNum = displayTemperature(data.temp, data.metrics.age);
          const humidityNum = displayHumidity(data.humidity, data.metrics.age);
          const waterNum = displayWaterIntake(data.metrics.waterIntake, data.metrics.age);
          const feedNum = displayFeedIntake(data.metrics.feedIntake, data.metrics.age);
          const weightNum = displayAverageWeight(data.metrics.averageWeight, data.metrics.age);
          const mortalityNum = displayMortalityRate(data.metrics.numberOfDeaths, data.metrics.totalPopulation);

          setHealth(healthNum);
          setTemp(tempNum);
          setHumi(humidityNum);
          setWater(waterNum);
          setFeed(feedNum);
          setWeight(weightNum);
          setMortality(mortalityNum);

          const simplifiedFormData = {
            healthStatus: 3,
            temperature: 2, 
            humidity: 2, 
            waterIntake: waterNum.waterNum, 
            feedIntake: feedNum.feedNum, 
            weight: weightNum.weightNum, 
            mortalityRate: mortalityNum, 
          };

          setFormData(simplifiedFormData); 
        } else {
          console.error("No data found for the selected image and user.");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("An error occurred while fetching data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedData]); 

  useEffect(() => {
    const autoSubmit = async () => {
      if (Object.keys(formData).length === 0) return; 

      try {
        const response = await axios.post('http://localhost:5000/predict', formData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        setPrediction(response.data.pred);
      } catch (error) {
        console.error("Error submitting the form", error);
        setPrediction("Error: Unable to get prediction.");
      }
    };

    autoSubmit(); 
  }, [formData]);

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

  if (loading) {
    return <div>Loading data...</div>;
  }

  return (
    <div className="dataset-display">
      <button
        onClick={() => window.history.back()}
        style={{ color: textColor }}
      >
        <FontAwesomeIcon icon={faArrowLeft} />{" "}
        {/* Replace text with back icon */}
      </button>
  
      <div className="data-container" style={isMobile ? { flexDirection: 'column' } : { flexDirection: 'row' }}>
        <div className="metadata">
          <h2 style={{marginTop: isMobile ? -25 : "intiial"}}>Data Summary</h2>
          <p style={{transform: isMobile ? "scale(0.8)" : "scale(1)", marginTop: isMobile ? -20 : "intiial"}}>
            <strong>Date Processed:</strong>{" "}
            <span>{new Date().toLocaleDateString()}</span>
          </p>
          <p style={{transform: isMobile ? "scale(0.8)" : "scale(1)", marginTop: isMobile ? -15 : "intiial"}}>
            <strong>Date of Image Taken:</strong> <span>{imageDate}</span>
          </p>
          <p style={{transform: isMobile ? "scale(0.8)" : "scale(1)", marginTop: isMobile ? -15 : "intiial"}}>
            <strong>Temperature:</strong> <span>{temperature}</span>
          </p>
          <p style={{transform: isMobile ? "scale(0.8)" : "scale(1)", marginTop: isMobile ? -15 : "intiial"}}>
            <strong>Humidity:</strong> <span>{humidity}</span>
          </p>
          <p style={{transform: isMobile ? "scale(0.8)" : "scale(1)", marginTop: isMobile ? -15 : "intiial"}}>
            <strong>Housing Type:</strong> <span>{metrics.housing}</span>
          </p>
          <p style={{transform: isMobile ? "scale(0.8)" : "scale(1)", marginTop: isMobile ? -15 : "intiial"}}>
            <strong>Age:</strong> <span>{metrics.age}</span>
          </p>
          <p style={{transform: isMobile ? "scale(0.8)" : "scale(1)", marginTop: isMobile ? -15 : "intiial"}}>
            <strong>Feed Intake:</strong> <span>{metrics.feedIntake}</span>
          </p>
          <p style={{transform: isMobile ? "scale(0.8)" : "scale(1)", marginTop: isMobile ? -15 : "intiial"}}>
            <strong>Water Intake:</strong> <span>{metrics.waterIntake}</span>
          </p>
          <p style={{transform: isMobile ? "scale(0.8)" : "scale(1)", marginTop: isMobile ? -15 : "intiial"}}>
            <strong>Average Weight:</strong>{" "}
            <span>{metrics.averageWeight}</span>
          </p>
          <p style={{transform: isMobile ? "scale(0.8)" : "scale(1)", marginTop: isMobile ? -15 : "intiial"}}>
            <strong>Number of Deaths:</strong>{" "}
            <span>{metrics.numberOfDeaths}</span>
          </p>
          <p style={{transform: isMobile ? "scale(0.8)" : "scale(1)", marginTop: isMobile ? -15 : "intiial"}}>
            <strong>Total Population:</strong>{" "}
            <span>{metrics.totalPopulation}</span>
          </p>
          <p style={{transform: isMobile ? "scale(0.8)" : "scale(1)", marginTop: isMobile ? -15 : "intiial"}}>
            <strong>Mortality Rate:</strong>{" "}
            <span>{metrics.mortalityRate}</span>
          </p>
          {/* Display Mortality Rate */}
          <h2>Detected Droppings Data</h2>
          <table
            className="dataTable"
            style={{
              transform: isMobile ? "scale(0.8)" : "scale(1)",
              width: isMobile ? "90%" : "100%",
              marginLeft: isMobile ? -30 : "initial",marginTop: isMobile ? -20 : "intiial"
            }}
            
          >
            <thead>
              <tr style={{ color: textColor }}>
                <th>Coccidiosis-like</th>
                <th>Healthy</th>
                <th>NCD-like</th>
                <th>Salmonella-like</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{detectedDroppings["Coccidiosis-like"]}</td>
                <td>{detectedDroppings["Healthy"]}</td>
                <td>{detectedDroppings["NCD-like"]}</td>
                <td>{detectedDroppings["Salmonella-like"]}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="image-container">
          {imageUrl ? (
            <img id="mlDisplay" src={imageUrl} alt="Processed"  style={{transform: isMobile ? "scale(0.8)" : "scale(1)", marginTop: isMobile ? -50 : "intiial"}}/>
          ) : (
            <p>Loading image...</p>
          )}
          <button onClick={downloadImage} style={{ color: textColor, marginTop: isMobile ? -15 : "intiial" }}>
            Download Photo
          </button>
        </div>
      </div>
      {prediction ? (
        <div>
          <h3 style={{ marginTop: isMobile ? -20 : "intiial"}}>Prediction Result:</h3>
          <p style={{transform: isMobile ? "scale(0.8)" : "scale(1)", marginTop: isMobile ? -20 : "intiial"}}>{prediction}</p>
        </div>
      ) : (
        <p style={{transform: isMobile ? "scale(0.8)" : "scale(1)", marginTop: isMobile ? -20 : "intiial"}}>Loading prediction...</p>
      )}
    </div>
  );
  
};

export default DatasetDisplay;
