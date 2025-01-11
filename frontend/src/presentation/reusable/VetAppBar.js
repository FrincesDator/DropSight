import React, { useContext, useState } from "react";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Button,
  Tooltip,
  Badge,
  Popover,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { VetAppearanceContext } from "../pages/veterinarian/settings/AppearanceContext";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import DashboardIcon from "@mui/icons-material/GridView";
import PeopleIcon from "@mui/icons-material/People";
import MessageIcon from "@mui/icons-material/MailOutline";
import logo from "../../assets/images/LOGO.png";
import logoInverted from "../../assets/images/LOGO2.png";
import user from "../../assets/images/USER.png";
import "../../core/style/App.css";
import useNotifications from "../pages/veterinarian/notification-screen/NotificationContext";

const pages = [
  { name: "Accounts", path: "/v/admin", icon: <PeopleIcon /> },
  { name: "Dashboard", path: "/v/dashboard", icon: <DashboardIcon /> },
  { name: "Messages", path: "/v/messages", icon: <MessageIcon /> },
];

function Appbar() {
  const location = useLocation();
  const { primaryColor } = useContext(VetAppearanceContext);
  const textColor =
    primaryColor === "#2D4746" || primaryColor === "#EF6068"
      ? "white"
      : "black";
  const logoSrc =
    primaryColor === "#2D4746" || primaryColor === "#EF6068"
      ? logoInverted
      : logo;

  const [anchorEl, setAnchorEl] = useState(null);

  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));

  const { notifications, markAsRead, deleteNotification, unreadCount } =
    useNotifications();

  const open = Boolean(anchorEl);
  const id = open ? "notification-popover" : undefined;

  const handleNotificationClick = (event) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

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
          {isMobile && (
            <Box
              sx={{
                display: "flex",
                flexGrow: 1,
                justifyContent: "space-evenly",
              }}
            >
              {pages.map((page) => (
                <Tooltip key={page.name} title={page.name}>
                  <IconButton
                    component={Link}
                    to={page.path}
                    sx={{ color: textColor }}
                  >
                    {page.icon}
                  </IconButton>
                </Tooltip>
              ))}
            </Box>
          )}

          {/* Right-side icons */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Tooltip title="Notifications">
              <IconButton
                sx={{ color: textColor }}
                onClick={handleNotificationClick}
              >
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsNoneOutlinedIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Notification Popover */}
            <Popover
              id={id}
              open={open}
              anchorEl={anchorEl}
              onClose={handlePopoverClose}
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
                        backgroundColor: notification.read
                          ? "inherit"
                          : "#f5f5f5",
                        p: 1,
                        borderRadius: 1,
                      }}
                      onClick={() => {
                        markAsRead(notification.id);
                      }}
                    >
                      <Box>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: "bold",
                            fontSize: isMobile ? 12 : 14,
                          }}
                        >
                          {notification.message}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          sx={{ fontSize: isMobile ? 10 : 12 }}
                        >
                          {formatTimestamp(notification.timestamp)}
                        </Typography>
                      </Box>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        style={{transform: isMobile ? "scale(0.8)" : "scale(1)",}}
                      >
                        ✖
                      </IconButton>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No notifications available.
                  </Typography>
                )}
              </Box>
            </Popover>

            <Tooltip title="Settings">
              <Link
                to="/v/settings"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <IconButton sx={{ color: textColor }}>
                  <SettingsOutlinedIcon />
                </IconButton>
              </Link>
            </Tooltip>
            <Link to="/v/user" style={{ textDecoration: "none" }}>
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
    </Box>
  );
}

export default Appbar;
