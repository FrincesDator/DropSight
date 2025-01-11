// src/App.js
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./presentation/routes/app-routes";
import TermsOfUse from "./presentation/pages/terms-condition/terms-condition";
//import LoginScreen from "./presentation/pages/login-screen/cryptLogin";

const App = () => (
  <Router>
    <AppRoutes />
  </Router>
);

export default App;
