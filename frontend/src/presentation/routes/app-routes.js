import React, { useContext } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import FarmAppbar from "../reusable/FarmAppBar";
import VetAppbar from "../reusable/VetAppBar";
import LoginPage from "../pages/login-screen/loginPage";
import TermsOfUse from "../pages/terms-condition/terms-condition";
import DataDisplay from "../pages/veterinarian/dashboard-screen/dataDisplay";
import ViewData from "../pages/veterinarian/dashboard-screen/viewData";


// Farm Owner
import FarmHome from "../pages/farm-owner/home-screen/Home";
import FarmDashboard from "../pages/farm-owner/dashboard-screen/Dashboard";
import FarmSymptom from "../pages/farm-owner/symptomChecke-screen/Symptom";
import FarmMessages from "../pages/farm-owner/messages-screen/Messages";
import FarmEmployee from "../pages/farm-owner/settings/Employee";
import FarmSettings from "../pages/farm-owner/settings/Settings";
import FarmUser from "../pages/farm-owner/user-screen/User";
import FarmMetrics from "../pages/farm-owner/home-screen/Metrics";
import DatasetDisplay from "../pages/farm-owner/dashboard-screen/Data";
import FarmHelp from "../pages/farm-owner/settings/Help";
import FarmAccount from "../pages/farm-owner/settings/Account";
import FarmAppearance from "../pages/farm-owner/settings/Appearance";

// Farm Employee
import EmployeeMetrics from "../pages/farm-employee/Metrics";

// Vet
import VetAdmin from "../pages/veterinarian/accounts-screen/AdminPage";
import VetDashboard from "../pages/veterinarian/dashboard-screen/Dashboard";
import VetMessages from "../pages/veterinarian/message-screen/Messages";
import VetSettings from "../pages/veterinarian/settings/Settings";
import VetUser from "../pages/veterinarian/user-profile-screen/User";
import VetAccountSettingsPage from "../pages/veterinarian/settings/Account";
import VetAppearancePage from "../pages/veterinarian/settings/Appearance";
import VetHelpPage from "../pages/veterinarian/settings/Help";

// Contexts
import {
  FarmAppearanceProvider,
  FarmAppearanceContext,
} from "../pages/farm-owner/settings/AppearanceContext";

import {
  VetAppearanceProvider,
  VetAppearanceContext,
} from "../pages/veterinarian/settings/AppearanceContext";

import { FarmNotificationProvider } from "../pages/farm-owner/notification-screen/NotificationContext";

// Protected Route
import ProtectedRoute from "../routes/ProtectedRoutes";  // Import the ProtectedRoute

const AppRoutes = () => {
  const location = useLocation();

  const isFarmRoute = location.pathname.startsWith("/f");

  const AppearanceContext = isFarmRoute
    ? FarmAppearanceContext
    : VetAppearanceContext;
  const AppearanceProvider = isFarmRoute
    ? FarmAppearanceProvider
    : VetAppearanceProvider;

  // Only FarmNotificationProvider is used now
  const NotificationProvider = FarmNotificationProvider;

  return (
    <NotificationProvider>
      <AppearanceProvider>
        <RouteWrapper location={location} AppearanceContext={AppearanceContext} />
      </AppearanceProvider>
    </NotificationProvider>
  );
};

const RouteWrapper = ({ location, AppearanceContext }) => {
  const isFarmRoute = location.pathname.startsWith("/f");
  const isVetRoute = location.pathname.startsWith("/v");
  const { theme } = useContext(AppearanceContext);

  const muiTheme = createTheme({
    palette: {
      mode: theme,
    },
  });

  // Update this array to include all routes that should not show the AppBar
  const noAppBarRoutes = ["/", "/f/register", "/v/register"];
  const isNoAppBarRoute = noAppBarRoutes.includes(location.pathname);

  // Check if the user is logged in
  const loggedInUser = localStorage.getItem('loggedInUser');

  // Add additional condition to check for protected routes
  const isProtectedRoute = location.pathname.startsWith("/f/") || location.pathname.startsWith("/v/");

  // Prevent AppBar from showing on login/register and unprotected routes
  const shouldHideAppBar = isNoAppBarRoute || (isProtectedRoute && !loggedInUser);

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      {!shouldHideAppBar && (
        <>
          {isFarmRoute && <FarmAppbar />}
          {isVetRoute && <VetAppbar />}
        </>
      )}
      <Routes>
        {/* Login & Registration Routes */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/terms&condition" element={<TermsOfUse />} />
       
       {/* Protected Employee Route */}
       <Route path="/e/metrics" element={<ProtectedRoute requiredRole="employeeAccount"><EmployeeMetrics /></ProtectedRoute>} />


        {/* Protected Farm Owner Routes */}
        <Route path="/f/home" element={<ProtectedRoute requiredRole="farmOwnerAccount"><FarmHome /></ProtectedRoute>} />
        <Route path="/f/dashboard" element={<ProtectedRoute requiredRole="farmOwnerAccount"><FarmDashboard /></ProtectedRoute>} />
        <Route path="/f/symptom-checker" element={<ProtectedRoute requiredRole="farmOwnerAccount"><FarmSymptom /></ProtectedRoute>} />
        <Route path="/f/messages" element={<ProtectedRoute requiredRole="farmOwnerAccount"><FarmMessages /></ProtectedRoute>} />
        <Route path="/f/employee" element={<ProtectedRoute requiredRole="farmOwnerAccount"><FarmEmployee /></ProtectedRoute>} />
        <Route path="/f/settings" element={<ProtectedRoute requiredRole="farmOwnerAccount"><FarmSettings /></ProtectedRoute>} />
        <Route path="/f/user" element={<ProtectedRoute requiredRole="farmOwnerAccount"><FarmUser /></ProtectedRoute>} />
        <Route path="/f/metrics" element={<ProtectedRoute requiredRole="farmOwnerAccount"><FarmMetrics /></ProtectedRoute>} />
        <Route path="/f/account" element={<ProtectedRoute requiredRole="farmOwnerAccount"><FarmAccount /></ProtectedRoute>} />
        <Route path="/f/appearance" element={<ProtectedRoute requiredRole="farmOwnerAccount"><FarmAppearance /></ProtectedRoute>} />
        <Route path="/f/viewdata" element={<ProtectedRoute requiredRole="farmOwnerAccount"><DatasetDisplay /></ProtectedRoute>} />
        <Route path="/f/help" element={<ProtectedRoute requiredRole="farmOwnerAccount"><FarmHelp /></ProtectedRoute>} />

        {/* Protected Veterinarian Routes */}
        <Route path="/v/admin" element={<ProtectedRoute requiredRole="veterinarianAccount"><VetAdmin /></ProtectedRoute>} />
        <Route path="/v/dashboard" element={<ProtectedRoute requiredRole="veterinarianAccount"><VetDashboard /></ProtectedRoute>} />
        <Route path="/v/messages" element={<ProtectedRoute requiredRole="veterinarianAccount"><VetMessages /></ProtectedRoute>} />
        <Route path="/v/settings" element={<ProtectedRoute requiredRole="veterinarianAccount"><VetSettings /></ProtectedRoute>} />
        <Route path="/v/account" element={<ProtectedRoute requiredRole="veterinarianAccount"><VetAccountSettingsPage /></ProtectedRoute>} />
        <Route path="/v/appearance" element={<ProtectedRoute requiredRole="veterinarianAccount"><VetAppearancePage /></ProtectedRoute>} />
        <Route path="/v/help" element={<ProtectedRoute requiredRole="veterinarianAccount"><VetHelpPage /></ProtectedRoute>} />
        <Route path="/v/user" element={<ProtectedRoute requiredRole="veterinarianAccount"><VetUser /></ProtectedRoute>} />
        <Route path="/v/data" element={<ProtectedRoute requiredRole="veterinarianAccount"><DataDisplay /></ProtectedRoute>} />
        <Route path="/v/viewdata" element={<ProtectedRoute requiredRole="veterinarianAccount"><ViewData /></ProtectedRoute>} />
      </Routes>
    </ThemeProvider>
  );
};

export default AppRoutes;
