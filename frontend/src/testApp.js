import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PredictionForm = () => {
  // Predefined data (example)
  const predefinedData = {
    healthStatus: 4,
    temperature: 3,
    humidity: 2,
    waterIntake: 1,
    feedIntake: 3,
    weight: 1,
    mortalityRate: 1
  };

  const [prediction, setPrediction] = useState('');

  // Automatically submit the form when component mounts
  useEffect(() => {
    const getPrediction = async () => {
      try {
        const response = await axios.post('http://localhost:5000/predict', predefinedData, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        setPrediction(response.data.pred);
      } catch (error) {
        console.error("Error submitting the form", error);
        setPrediction("Error: Unable to get prediction.");
      }
    };

    // Call the prediction function on mount
    getPrediction();
  }, []); // Empty dependency array ensures this runs only once when the component mounts

  return (
    <div>
      <h2>Chicken Health Prediction</h2>
      {prediction && <div><h3>Prediction Result:</h3><p>{prediction}</p></div>}
    </div>
  );
};

export default PredictionForm;
