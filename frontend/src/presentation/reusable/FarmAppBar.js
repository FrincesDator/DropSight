import React, { useContext, useState } from "react";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Button,
  Tooltip,
  Popover,
  Typography,
  Divider,
  Modal,
  Badge,
  styled,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { FarmAppearanceContext } from "../pages/farm-owner/settings/AppearanceContext";
import { NotificationContext } from "../pages/farm-owner/notification-screen/NotificationContext";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import HomeIcon from "@mui/icons-material/Home";
import DashboardIcon from "@mui/icons-material/GridView";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import MessageIcon from "@mui/icons-material/MailOutline";
import EmployeeIcon from "@mui/icons-material/Group";
import logo from "../../assets/images/LOGO.png";
import logoInverted from "../../assets/images/LOGO2.png";
import user from "../../assets/images/USER.png";
import "../../core/style/App.css";

const pages = [
  { name: "Home", path: "/f/home", icon: <HomeIcon /> },
  { name: "Dashboard", path: "/f/dashboard", icon: <DashboardIcon /> },
  { name: "Employees", path: "/f/employee", icon: <EmployeeIcon /> },
  {
    name: "Symptom Checker",
    path: "/f/symptom-checker",
    icon: <FactCheckIcon />,
  },
  { name: "Messages", path: "/f/messages", icon: <MessageIcon /> },
];

const StyledModal = styled(Modal)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

function Appbar() {
  const location = useLocation();
  const { primaryColor } = useContext(FarmAppearanceContext);
  const textColor =
    primaryColor === "#2D4746" || primaryColor === "#EF6068"
      ? "white"
      : "black";
  const logoSrc =
    primaryColor === "#2D4746" || primaryColor === "#EF6068"
      ? logoInverted
      : logo;

  const {
    notifications,
    selectNotification,
    clearSelectedNotification,
    selectedNotification,
    deleteNotification,
  } = useContext(NotificationContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    clearSelectedNotification();
  };

  const handleModalClose = () => {
    setModalOpen(false);
    clearSelectedNotification();
  };

  const handleNotificationClick = (notification) => {
    selectNotification(notification);
    setModalOpen(true);
  };

  const open = Boolean(anchorEl);
  const id = open ? "notification-popover" : undefined;

  const formatTimestamp = (timestamp) => {
    if (timestamp instanceof Date) {
      return timestamp.toLocaleString();
    } else if (
      timestamp &&
      typeof timestamp === "object" &&
      "toDate" in timestamp
    ) {
      return timestamp.toDate().toLocaleString();
    }
    return "";
  };

  const unviewedCount = notifications.filter(
    (notification) => !notification.viewed
  ).length;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Detect if the screen is small

  return (
    <Box className="dashboard-app-bar">
      <AppBar position="static" sx={{ bgcolor: primaryColor }}>
        <Toolbar>
          {!isMobile && (
            <img src={logoSrc} alt="Logo" className="dashboard-logo" />
          )}

          {/* Desktop View: Navigation Links */}
          <Box
            sx={{
              flexGrow: 1,
              display: { xs: "none", md: "flex" },
            }}
          >
            {pages.map((page) => (
              <Button
                key={page.name}
                component={Link}
                to={page.path}
                className={`button ${
                  location.pathname === page.path ? "active-button" : ""
                }`}
                sx={{ color: textColor }}
              >
                {page.name}
              </Button>
            ))}
          </Box>

          {/* Mobile View: Navigation Icons */}
          <Box
            sx={{
              display: { xs: "flex", md: "none" },
              justifyContent: "flex-start",
              width: "100%",
            }}
          >
            {pages.map((page) => (
              <Tooltip key={page.name} title={page.name}>
                <IconButton
                  component={Link}
                  to={page.path}
                  sx={{
                    color: textColor,
                  }}
                >
                  {page.icon}
                </IconButton>
              </Tooltip>
            ))}
          </Box>

          {/* Right-side icons (notifications, settings, user) */}
          <Box
            sx={{
              display: { xs: "flex", md: "flex" },
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            <Tooltip title="Notifications">
              <IconButton sx={{ color: textColor }} onClick={handleClick}>
                <Badge badgeContent={unviewedCount} color="error">
                  <NotificationsNoneOutlinedIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title="Settings">
              <Link
                to="/f/settings"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <IconButton sx={{ color: textColor }}>
                  <SettingsOutlinedIcon />
                </IconButton>
              </Link>
            </Tooltip>
            <Link to="/f/user" style={{ textDecoration: "none" }}>
              <Box
                component="img"
                className="user-icon"
                src={user}
                alt="User"
                sx={{
                  transform: isMobile ? "scale(0.8)" : "scale(1)",
                }}
              />
            </Link>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Notification Popover */}
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Box sx={{ p: 2, width: isMobile ? 250 : 400 }}>
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <Box
                key={notification.id}
                sx={{
                  mb: 1,
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
                onClick={() => handleNotificationClick(notification)}
              >
                <Box>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: "bold",
                      fontSize: isMobile ? "0.8rem" : "1rem",
                      textAlign: "left", 
                    }}
                  >
                    {notification.message}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    sx={{
                      fontSize: isMobile ? "0.67rem" : "0.75rem",
                    }}
                  >
                    {formatTimestamp(notification.timestamp)}
                  </Typography>
                </Box>
                {notification.viewed ? (
                  <Button
                    variant="contained"
                    color="success"
                    sx={{
                      ml: 2,
                      transform: isMobile ? "scale(0.5)" : "scale(1)",
                    }}
                  >
                    ✔
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="error"
                    sx={{
                      ml: 2,
                      transform: isMobile ? "scale(0.5)" : "scale(1)",
                    }}
                  >
                    <Typography variant="caption" color="white">
                      X
                    </Typography>
                  </Button>
                )}
              </Box>
            ))
          ) : (
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{ transform: isMobile ? "scale(0.5)" : "scale(1)" }}
            >
              No notifications available.
            </Typography>
          )}
        </Box>
      </Popover>

      {/* Modal for selected notification */}
      <StyledModal
        open={modalOpen}
        onClose={handleModalClose}
        aria-labelledby="notification-modal-title"
        aria-describedby="notification-modal-description"
      >
        <Box
          sx={{
            bgcolor: "background.paper",
            borderRadius: 1,
            boxShadow: 24,
            p: 4,
            width: isMobile ? 250 : 400,
            maxHeight: "80vh",
            overflow: "auto",
          }}
        >
          {selectedNotification && (
            <>
              <Typography variant="h6" id="notification-modal-title" sx={{ transform: isMobile ? "scale(0.8)" : "scale(1)",
                      textAlign: "center", }}>
                METRICS FORM EDITED
              </Typography>
              <Typography variant="body2" sx={{ transform: isMobile ? "scale(0.8)" : "scale(1)" }}>
                <strong>Date:</strong>{" "}
                {formatTimestamp(selectedNotification.timestamp)}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2" sx={{ transform: isMobile ? "scale(0.8)" : "scale(1)" }}>
                <strong>New Data:</strong>
                <br />
                {Object.entries(selectedNotification.newMetrics).map(
                  ([key, value]) => (
                    <Typography key={key}>
                      {key}: {value}
                    </Typography>
                  )
                )}
              </Typography>
              <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end", transform: isMobile ? "scale(0.8)" : "scale(1)" }}>
                <Button
                  onClick={() => deleteNotification(selectedNotification.id)}
                  sx={{ mr: 1 }}
                >
                  Delete
                </Button>
                <Button onClick={handleModalClose}>Close</Button>
              </Box>
            </>
          )}
        </Box>
      </StyledModal>
    </Box>
  );
}

export default Appbar;
