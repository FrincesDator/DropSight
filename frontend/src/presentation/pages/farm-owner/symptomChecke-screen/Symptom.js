import React, { useState, useContext } from "react";
import { Container, Box, useMediaQuery, useTheme } from "@mui/material";
import "../../../../core/style/Symptom.css";
import { FarmAppearanceContext } from "../../farm-owner/settings/AppearanceContext";

const questions = [
  "Is your chicken sneezing, coughing, or gasping?",
  "Does your chicken have swollen face or eyes?",
  "Is your chicken experiencing watery diarrhea?",
  "Is your chicken showing weakness and ruffled feathers?",
  "Is your chicken displaying nervous signs (e.g., twisting neck)?",
  "Is your chicken experiencing difficulty breathing?",
  "Is your chicken's feed intake reduced?",
  "Is there a discharge from your chicken's eyes or nostrils?",
  "Are there scabs on your chicken's head or legs?",
  "Is your chicken showing signs of leg or wing paralysis?",
  "Is your chicken huddling for warmth and appearing weak?",
];

const suggestions = {
  "Is your chicken sneezing, coughing, or gasping?":
    "Newcastle Disease, Infectious Bronchitis, or Chronic Respiratory Disease (CRD): Vaccinate for Newcastle or Infectious Bronchitis; use antibiotics for CRD; maintain strict sanitation.",
  "Does your chicken have swollen face or eyes?":
    "Coryza or Avian Influenza: Provide good ventilation; use antibiotics for secondary infections; consult lab for Avian Influenza diagnosis.",
  "Is your chicken experiencing watery diarrhea?":
    "E. coli Infection, Salmonellosis, or Pullorum Disease: Improve sanitation; medicate with broad-spectrum antibiotics or nitrofurans; reduce rodent contact.",
  "Is your chicken showing weakness and ruffled feathers?":
    "Salmonellosis, Pullorum Disease, or Coccidiosis: Use Salmonella-free stock; apply coccidiostats; maintain strict sanitation and use footbaths.",
  "Is your chicken displaying nervous signs (e.g., twisting neck)?":
    "Newcastle Disease: Isolate sick chickens; vaccinate healthy flock; use supportive antibiotics to prevent secondary infections.",
  "Is your chicken experiencing difficulty breathing?":
    "Infectious Laryngotracheitis or Avian Influenza: Vaccinate for Infectious Laryngotracheitis; use antibiotics for secondary infections.",
  "Is your chicken's feed intake reduced?":
    "Infectious Bronchitis, Coryza, or E. coli Infection: Ensure proper vaccination; improve ventilation and sanitation; use antibiotics during stressful periods.",
  "Is there a discharge from your chicken's eyes or nostrils?":
    "Coryza or Chronic Respiratory Disease (CRD): Use broad-spectrum antibiotics; ensure good ventilation and avoid overcrowding.",
  "Are there scabs on your chicken's head or legs?":
    "Avian Pox: Vaccinate with pigeon or chicken pox strains; provide broad-spectrum antibiotics for secondary infections.",
  "Is your chicken showing signs of leg or wing paralysis?":
    "Newcastle Disease: Vaccinate flock; isolate affected chickens; ensure proper farm biosecurity.",
  "Is your chicken huddling for warmth and appearing weak?":
    "Salmonellosis or Pullorum Disease: Use Salmonella-free feed; apply antibiotics or nitrofurans in water; maintain strict hatchery sanitation.",
};

const SymptomChecker = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState([]);

  const handleAnswer = (answer) => {
    const newAnswer = { question: questions[currentQuestion], answer };
    setAnswers([...answers, newAnswer]);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResult(true);
    }
  };

  const progressPercentage = (currentQuestion / questions.length) * 100;

  const { primaryColor } = useContext(FarmAppearanceContext);
  const textColor = ["#2D4746", "#EF6068"].includes(primaryColor)
    ? "white"
    : "black";

      const theme = useTheme();
      const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Detect if the screen is small

  return (
    <Container className="symptom-page">
      <Container maxWidth="lg">
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          sx={{ mt: 3 }}
        >
          <p className="heading1">DropSight Interactive Symptom Checker</p>
          <p className="heading-text">
            A digital tool designed to help poultry farmers to identify
            potential health issues in their chickens. By answering observed
            symptoms, users receive instant results on possible conditions and
            recommended actions, making it easier to maintain chicken health and
            prevent disease outbreaks.
          </p>

          <p className="heading-text">
            The suggestions provided are based on the Broiler Diseases guide of
            Department of Agriculture.{" "}
            <a
              className="heading-text"
              href="https://ati2.da.gov.ph/e-extension/content/sites/default/files/2023-03/Broiler%20Diseases.pdf"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: primaryColor, textDecoration: "underline" }}
            >
              Click here to learn more.
            </a>
          </p>

          <Box
            className="infoBox"
            sx={{
              backgroundColor: primaryColor,
              borderRadius: 3,
              marginTop: 5,
            }}
          >
            <div></div>
            <div className="progressBar">
              <p className="startend" style={{ color: textColor }}>
                START
              </p>
              <div className="barContainer">
                <div
                  className="bar"
                  style={{ width: `${showResult ? 100 : progressPercentage}%` }}
                ></div>
              </div>
              <p className="startend" style={{ color: textColor }}>
                END
              </p>
            </div>
            {showResult ? (
              <div className="resultContainer">
                <table className="resultTable">
                  <thead>
                    <tr>
                      <th className="tableHeader" style={{ color: textColor }}>
                        Your Question
                      </th>
                      <th className="tableHeader" style={{ color: textColor }}>
                        Your Answer
                      </th>
                      <th className="tableHeader" style={{ color: textColor }}>
                        Our Suggestion
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {answers.map((item, index) => (
                      <tr key={index}>
                        <td
                          className="questionText"
                          style={{ color: textColor, textAlign: "justify" }}
                        >
                          {item.question}
                        </td>
                        <td
                          className="answerText"
                          style={{
                            fontWeight: "bold",
                            color: textColor,
                            textAlign: "center",
                          }}
                        >
                          {item.answer.toUpperCase()}
                        </td>
                        <td
                          className="suggestionText"
                          style={{ color: textColor, textAlign: "justify" }}
                        >
                          {item.answer === "yes"
                            ? suggestions[item.question]
                            : "No specific suggestion for this question."}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p style={{ color: textColor, fontWeight: "bold", transform: isMobile ? "scale(0.8)" : "scale(1)", }}>
                  Based on your answers, we suggest you consult a veterinarian
                  if symptoms persist.
                </p>
              </div>
            ) : (
              <div className="questionBox">
                <p className="startend" style={{ color: textColor }}>
                  {questions[currentQuestion]}
                </p>
                <div className="buttonContainer">
                  <button
                    className="symptom-button"
                    onClick={() => handleAnswer("yes")}
                  >
                    Yes
                  </button>
                  <button
                    className="symptom-button"
                    onClick={() => handleAnswer("no")}
                  >
                    No
                  </button>
                </div>
              </div>
            )}
          </Box>
        </Box>
      </Container>
    </Container>
  );
};

export default SymptomChecker;
