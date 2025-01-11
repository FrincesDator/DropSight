import React from "react";
import {
  Container,
  Box,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import "../../../../core/style/Settings.css";

const HelpPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Detect if the screen is small

  return (
    <Container className="settings-page">
      <Box>
        <Card variant="elevation" elevation={2} className="settings-card">
          <CardContent>
            <p className="heading1">Help & Support</p>
            <p className="heading2">Frequently Asked Questions</p>
            <List>
              <ListItem
                sx={{
                  transform: isMobile ? "scale(0.8)" : "scale(1)",
                  padding: 0,
                }}
              >
                <ListItemText
                  primary="How do I reset my password?"
                  secondary="To reset your password, go to the 'Account Settings' section, enter your password and click on 'Save Changes'."
                />
              </ListItem>
              <ListItem
                sx={{
                  transform: isMobile ? "scale(0.8)" : "scale(1)",
                  padding: 0,
                }}
              >
                <ListItemText
                  primary="How can I contact support?"
                  secondary="You can contact support via the 'Contact Support' section with the link underlined located in the footer of the website."
                />
              </ListItem>
            </List>

            <p className="heading2">Troubleshooting Tips</p>
            <List>
              <ListItem
                sx={{
                  transform: isMobile ? "scale(0.8)" : "scale(1)",
                  padding: 0,
                }}
              >
                <ListItemText
                  primary="Check your internet connection"
                  secondary="Ensure you have a stable connection."
                />
              </ListItem>
              <ListItem
                sx={{
                  transform: isMobile ? "scale(0.8)" : "scale(1)",
                  padding: 0,
                }}
              >
                <ListItemText
                  primary="Clear your browser cache"
                  secondary="Sometimes clearing the cache can resolve issues."
                />
              </ListItem>
              <ListItem
                sx={{
                  transform: isMobile ? "scale(0.8)" : "scale(1)",
                  padding: 0,
                }}
              >
                <ListItemText
                  primary="Update your browser"
                  secondary="Make sure you are using the latest version of your browser."
                />
              </ListItem>
            </List>

            <Box
              mt={4}
              textAlign="center"
              sx={{ transform: isMobile ? "scale(0.8)" : "scale(1)" }}
            >
              <p className="heading2">Contact Support</p>
              <p sx={{ transform: isMobile ? "scale(0.8)" : "scale(1)" }}>
                For additional support, please reach out to us at:
                <br />
                <a
                  href="mailto:dropsightAdmins@gmail.com"
                  sx={{ transform: isMobile ? "scale(0.8)" : "scale(1)" }}
                >
                  dropsightAdmins@gmail.com
                </a>
              </p>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default HelpPage;
