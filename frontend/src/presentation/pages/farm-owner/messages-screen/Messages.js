import React, { useState, useEffect, useContext, useRef } from "react";
import {
  Grid,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  Stack,
  Avatar,
  Badge,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import {
  Done,
  DoneAll,
  Mail as MailIcon,
  Add as AddIcon,
  Close as CloseIcon,
  ArrowBack,
} from "@mui/icons-material";
import {
  db,
  collection,
  query,
  where,
  getDocs,
  database,
  ref,
  push,
  onValue,
  update,
  storage,
  storageRef,
  getDownloadURL,
} from "../../../../core/firebase/firebase";
import "../../../../core/style/Messages.css";
import { addDoc } from "firebase/firestore";
import { Fab } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { FarmAppearanceContext } from "../../farm-owner/settings/AppearanceContext";
import { useMediaQuery, useTheme } from "@mui/material";

function Messages() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [contacts, setContacts] = useState([]);
  const { primaryColor } = useContext(FarmAppearanceContext);
  const [openDialog, setOpenDialog] = useState(false);
  const [droppings, setDroppings] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);

  const textColor =
    primaryColor === "#2D4746" || primaryColor === "#EF6068"
      ? "white"
      : "black";
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Detect if the screen is small

  useEffect(() => {
    const fetchContacts = async () => {
      const vetQuery = query(
        collection(db, "veterinarianAccount"),
        where("UserID", "!=", loggedInUser.UserID)
      );
      const vetSnapshot = await getDocs(vetQuery);

      const veterinarians = vetSnapshot.docs.map((doc) => ({
        id: doc.id,
        name: `${doc.data().fName} ${doc.data().lName}`,
        userType: "Veterinarian",
        ...doc.data(),
      }));

      const contactsWithUnreadCounts = await Promise.all(
        veterinarians.map(async (contact) => {
          const conversationId = [loggedInUser.UserID, contact.UserID]
            .sort()
            .join("_");
          const messageRef = ref(database, `messages/${conversationId}`);
          const unreadCountPromise = new Promise((resolve) => {
            onValue(messageRef, (snapshot) => {
              const data = snapshot.val();
              if (data) {
                const unreadMessages = Object.values(data).filter(
                  (msg) => !msg.isRead && msg.receiver === loggedInUser.UserID
                );
                resolve(unreadMessages.length);
              } else {
                resolve(0);
              }
            });
          });

          const unreadCount = await unreadCountPromise;
          return { ...contact, unreadCount };
        })
      );

      setContacts(contactsWithUnreadCounts);
    };

    fetchContacts();
  }, [loggedInUser.UserID]);

  // Dialog for detected droppings
  const handleAddClick = async () => {
    const droppingsQuery = query(
      collection(db, "detectedDroppings"),
      where("UserID", "==", loggedInUser.UserID)
    );
    const droppingsSnapshot = await getDocs(droppingsQuery);

    const droppingsData = await Promise.all(
      droppingsSnapshot.docs.map(async (doc) => {
        const data = doc.data();
        let imageUrl = "";
        try {
          const imageRef = storageRef(
            storage,
            `dataProcessed/${data.imageName}`
          );
          imageUrl = await getDownloadURL(imageRef);
        } catch (error) {
          console.error("Error fetching image URL: ", error);
        }
        return {
          id: doc.id,
          ...data,
          imageUrl,
        };
      })
    );

    // Sort by imageDateTaken
    const sortedDroppingsData = droppingsData.sort((a, b) => {
      const dateA = new Date(a.imageDateTaken);
      const dateB = new Date(b.imageDateTaken);
      return dateB - dateA; // Sort descending
    });

    setDroppings(sortedDroppingsData);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name &&
      contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const handleSendMessage = (messageToSend) => {
    if (
      messageToSend &&
      typeof messageToSend === "string" &&
      messageToSend.trim() &&
      selectedContact
    ) {
      const timestamp = Date.now();
      const formattedDate = new Date(timestamp).toLocaleString();

      // Combine fName and lName with a space
      const senderName = `${loggedInUser.fName} ${loggedInUser.lName}`;

      const newMessageData = {
        text: messageToSend,
        timestamp,
        formattedDate,
        sender: loggedInUser.UserID,
        senderName, // Add senderName here
        receiver: selectedContact.UserID,
        isRead: false,
      };

      const conversationId = [loggedInUser.UserID, selectedContact.UserID]
        .sort()
        .join("_");
      const messageRef = ref(database, `messages/${conversationId}`);
      push(messageRef, newMessageData).then(() => {
        if (messageToSend === newMessage) {
          setNewMessage("");
        }
      });

      // Check if the message is related to "droppings data" and show auto-replies
    }
  };

  const handleContactClick = (contact) => {
    setSelectedContact(contact);
    const conversationId = [loggedInUser.UserID, contact.UserID]
      .sort()
      .join("_");
    const messageRef = ref(database, `messages/${conversationId}`);

    const unsubscribe = onValue(messageRef, (snapshot) => {
      const data = snapshot.val();
      const messagesArray = data ? Object.values(data) : [];

      const updatedMessages = messagesArray.map((message) => {
        const isUnread =
          !message.isRead &&
          message.receiver === loggedInUser.UserID &&
          message.sender !== loggedInUser.UserID;

        if (isUnread) {
          const messageKey = Object.keys(data).find(
            (key) => data[key].timestamp === message.timestamp
          );
          const messageToUpdateRef = ref(
            database,
            `messages/${conversationId}/${messageKey}`
          );
          update(messageToUpdateRef, { isRead: true });

          return { ...message, isRead: true };
        }
        return message;
      });

      setMessages(updatedMessages);

      const updatedContacts = contacts.map((c) => {
        if (c.UserID === contact.UserID) {
          return { ...c, unreadCount: 0 };
        }
        return c;
      });

      setContacts(updatedContacts);
    });

    return () => unsubscribe();
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Track clicked image
  const handleDroppingDataClick = (dropping) => {
    // Check if the image is already selected
    const isAlreadySelected = selectedImages.some(
      (selectedDropping) => selectedDropping.id === dropping.id
    );

    if (isAlreadySelected) {
      // Remove image from selected images if clicked again
      setSelectedImages((prevSelectedImages) =>
        prevSelectedImages.filter(
          (selectedDropping) => selectedDropping.id !== dropping.id
        )
      );
    } else {
      // Add the clicked image to the selected images list
      setSelectedImages((prevSelectedImages) => [
        ...prevSelectedImages,
        dropping,
      ]);
    }
  };

  // Handle sending all selected images
  const handleSendAllImages = async () => {
    for (let i = 0; i < selectedImages.length; i++) {
      const dropping = selectedImages[i];
      const droppingId = dropping.imageName;

      const droppingsCollectionRef = collection(db, "detectedDroppings");
      const q = query(
        droppingsCollectionRef,
        where("UserID", "==", loggedInUser.UserID),
        where("imageDateTaken", "==", dropping.imageDateTaken)
      );
      const droppingsSnapshot = await getDocs(q);

      if (!droppingsSnapshot.empty) {
        const droppingDoc = droppingsSnapshot.docs[0];
        const data = droppingDoc.data();
        const imageName = data.imageName;
        const imageDateTaken = data.imageDateTaken;

        if (!imageName || !imageDateTaken) {
          console.error("Error: imageName or imageDateTaken is undefined");
          continue;
        }

        const messageData = {
          droppingId: droppingId,
          temperature: data.temp ? `${data.temp} °C` : "--",
          humidity: data.humidity ? `${data.humidity}%` : "--",
          housing: data.chickenHouseType || "--",
          age: data.metrics?.age ? `${data.metrics.age} days` : "--",
          feedIntake: data.metrics?.feedIntake
            ? `${data.metrics.feedIntake} kilograms`
            : "--",
          waterIntake: data.metrics?.waterIntake
            ? `${data.metrics.waterIntake} litres`
            : "--",
          averageWeight: data.metrics?.averageWeight
            ? `${data.metrics.averageWeight} kilograms`
            : "--",
          numberOfDeaths: data.metrics?.numberOfDeaths
            ? `${data.metrics.numberOfDeaths} heads`
            : "--",
          totalPopulation: data.metrics?.totalPopulation
            ? `${data.metrics.totalPopulation} birds`
            : "--",
          mortalityRate:
            data.metrics?.numberOfDeaths && data.metrics?.totalPopulation
              ? `${(
                  (data.metrics.numberOfDeaths / data.metrics.totalPopulation) *
                  100
                ).toFixed(2)}%`
              : "0.00%",
          detectedDroppings: {
            "Coccidiosis-like":
              data.detectionsCount?.["Coccidiosis-like"] || "--",
            Healthy: data.detectionsCount?.["Healthy"] || "--",
            "NCD-like": data.detectionsCount?.["NCD-like"] || "--",
            "Salmonella-like":
              data.detectionsCount?.["Salmonella-like"] || "--",
          },
          imageName: imageName,
          imageDateTaken: imageDateTaken,
        };

        // Fetching image URL
        const imageRef = storageRef(storage, `dataProcessed/${imageName}`);
        const imageUrl = await getDownloadURL(imageRef);
        const senderName = `${loggedInUser.fName} ${loggedInUser.lName}`;

        const newMessageData = {
          text: `Dropping Data
          - Temperature: ${messageData.temperature}
          - Humidity: ${messageData.humidity}
          - Age: ${messageData.age}
          - Housing Type: ${messageData.housing}
          - Feed Intake: ${messageData.feedIntake}
          - Water Intake: ${messageData.waterIntake}
          - Average Weight: ${messageData.averageWeight}
          - Number of Deaths: ${messageData.numberOfDeaths}
          - Total Population: ${messageData.totalPopulation}
          - Mortality Rate: ${messageData.mortalityRate}
          - Coccidiosis-like Cases: ${messageData.detectedDroppings["Coccidiosis-like"]}
          - Healthy Cases: ${messageData.detectedDroppings["Healthy"]}
          - NCD-like Cases: ${messageData.detectedDroppings["NCD-like"]}
          - Salmonella-like Cases: ${messageData.detectedDroppings["Salmonella-like"]}`,
          imageUrl: imageUrl,
          sender: loggedInUser.UserID,
          receiver: selectedContact.UserID,
          senderName, // Add senderName here
          timestamp: Date.now(),
          isRead: false,
        };

        // Send message logic
        const conversationId = [loggedInUser.UserID, selectedContact.UserID]
          .sort()
          .join("_");
        const messageRef = ref(database, `messages/${conversationId}`);
        await push(messageRef, newMessageData);

        // Add data to vetData collection
        const newCollectionRef = collection(db, "vetData");
        await addDoc(newCollectionRef, {
          ...messageData,
          userID: loggedInUser.UserID,
          imageName: messageData.imageName,
          imageDateTaken: messageData.imageDateTaken,
          timestamp: Date.now(),
          imageUrl: imageUrl,
          response: null,
        });
      }
    }

    // After sending, clear selected images
    setSelectedImages([]);
    setOpenDialog(false); // Close the dialog after sending
  };

  return (
    <div className="message-page">
      <Box height={10} />
      <Grid container spacing={2} sx={{ padding: "0 16px" }}>
        {!selectedContact || !isMobile ? (
          <Grid item xs={12} sm={isMobile ? 12 : 5} md={5} lg={3}>
            <p
              className="heading1"
              style={{ marginBottom: "20px", textAlign: "center" }}
            >
              Contacts
            </p>
            <TextField
              fullWidth
              label="Search Contacts"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ marginBottom: 2 }}
              InputProps={{ className: "txtfield-normal" }}
              InputLabelProps={{ className: "txtfield-normal" }}
            />
            <List>
              {filteredContacts.length > 0 ? (
                filteredContacts.map((contact, index) => (
                  <React.Fragment key={index}>
                    <ListItemButton onClick={() => handleContactClick(contact)}>
                      <Avatar alt={contact.name} src={contact.imgSrc} />
                      <ListItemText
                        primary={
                          <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            sx={{ width: "100%" }}
                          >
                            <p className="txtfield-normal2">{contact.name}</p>
                            {contact.unreadCount > 0 && (
                              <Badge
                                badgeContent={contact.unreadCount}
                                color="error"
                                sx={{ marginLeft: "8px" }}
                              />
                            )}
                          </Stack>
                        }
                        secondary={
                          <>
                            <p className="txtfield-normal2">
                              {contact.userType}
                            </p>
                            <p className="txtfield-normal2">
                              {contact.message}
                            </p>
                          </>
                        }
                        sx={{ marginLeft: 2 }}
                      />
                    </ListItemButton>
                    {index < filteredContacts.length - 1 && <Divider />}
                  </React.Fragment>
                ))
              ) : (
                <p className="simple-text3">No contacts found.</p>
              )}
            </List>
          </Grid>
        ) : null}

        {!selectedContact && isMobile ? null : (
          <Grid item xs={12} sm={isMobile ? 12 : 7} md={7} lg={9}>
            <Stack spacing={2} sx={{ height: "100vh" }}>
              {selectedContact && (
                <Card
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    height: "60px",
                    maxHeight: "100px",
                  }}
                >
                  <CardContent sx={{ display: "flex", alignItems: "center" }}>
                    <Stack
                      direction="row"
                      spacing={2}
                      alignItems="center"
                      sx={{ width: "100%", overflow: "hidden" }}
                    >
                      {isMobile && (
                        <IconButton onClick={() => setSelectedContact(null)}>
                          <ArrowBack />
                        </IconButton>
                      )}
                      <Avatar
                        alt={selectedContact.name}
                        src={selectedContact.imgSrc}
                        sx={{ width: 30, height: 30 }}
                      />
                      <p className="selected-contact-name">
                        {selectedContact.name}
                      </p>
                    </Stack>
                  </CardContent>
                </Card>
              )}

              <Card sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <CardContent sx={{ flex: 1, overflowY: "auto" }}>
                  {selectedContact ? (
                    messages.length > 0 ? (
                      <Stack
                        direction="column"
                        spacing={1}
                        sx={{ alignItems: "flex-start" }}
                      >
                        {messages.map((message, index) => (
                          <div
                            key={index}
                            style={{
                              width: "100%",
                              display: "flex",
                              flexDirection: "column",
                              alignItems:
                                message.sender === loggedInUser.UserID
                                  ? "flex-end"
                                  : "flex-start",
                            }}
                          >
                            <div
                              className={
                                message.sender === loggedInUser.UserID
                                  ? "sent-message"
                                  : "received-message"
                              }
                            >
                              <div className="simple-text4">
                                {message.text.split("\n").map((line, index) => (
                                  <p
                                    key={index}
                                    style={{
                                      margin: "0 0 5px",
                                      transform: isMobile
                                        ? "scale(0.8)"
                                        : "scale(1)",
                                    }}
                                  >
                                    {line}
                                  </p>
                                ))}

                                {message.imageUrl && (
                                  <img
                                    src={message.imageUrl}
                                    alt="Data Img"
                                    style={{
                                      maxWidth: "100%",
                                      marginTop: "10px",
                                      borderRadius: "8px",
                                      display: "block",
                                      transform: isMobile
                                        ? "scale(0.8)"
                                        : "scale(1)",
                                    }}
                                  />
                                )}
                              </div>
                            </div>

                            <span className="message-timestamp">
                              {new Date(message.timestamp).toLocaleString()}
                              {message.sender === loggedInUser.UserID && (
                                <span
                                  style={{ marginLeft: "8px", color: "#555" }}
                                >
                                  {message.isRead ? (
                                    <DoneAll style={{ color: "green" }} />
                                  ) : (
                                    <Done style={{ color: "gray" }} />
                                  )}
                                </span>
                              )}
                            </span>
                          </div>
                        ))}
                        {/* Element to scroll to */}
                        <div ref={messagesEndRef} />
                      </Stack>
                    ) : (
                      <Stack
                        direction="column"
                        spacing={1}
                        sx={{
                          alignItems: "center",
                          height: "100%",
                          justifyContent: "center",
                        }}
                      >
                        <MailIcon fontSize="large" color="action" />
                        <p
                          className="simple-text3"
                          sx={{
                            transform: isMobile ? "scale(0.8)" : "scale(1)",
                          }}
                        >
                          Once you start a new conversation, you'll see it
                          listed here.
                        </p>
                      </Stack>
                    )
                  ) : (
                    <Stack
                      direction="column"
                      spacing={1}
                      sx={{
                        alignItems: "center",
                        height: "100%",
                        justifyContent: "center",
                      }}
                    >
                      <MailIcon fontSize="large" color="action" />
                      <p
                        className="simple-text3"
                        sx={{
                          transform: isMobile ? "scale(0.8)" : "scale(1)",
                        }}
                      >
                        Once you start a new conversation, you'll see it listed
                        here.
                      </p>
                    </Stack>
                  )}
                </CardContent>

                {selectedContact && (
                  <CardContent
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <IconButton onClick={handleAddClick}>
                      <AddIcon />
                    </IconButton>
                    <TextField
                      fullWidth
                      label="Type a message"
                      variant="outlined"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleSendMessage(newMessage);
                        }
                      }}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      sx={{
                        marginLeft: 2,
                        backgroundColor: primaryColor,
                        color: textColor,
                        "&:hover": { backgroundColor: "white" },
                        transform: isMobile ? "scale(0.8)" : "scale(1)",
                      }}
                      onClick={() => handleSendMessage(newMessage)}
                    >
                      Send
                    </Button>
                  </CardContent>
                )}
              </Card>
            </Stack>
          </Grid>
        )}
      </Grid>

      {/* Dialog for detected droppings */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth>
        <DialogTitle>
          Detected Droppings
          <IconButton
            onClick={() => setOpenDialog(false)}
            sx={{ position: "absolute", top: 8, right: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{
            position: "relative",
            maxHeight: "calc(100vh - 100px)",
            overflowY: "auto",
          }}
        >
          {/* Selected images count */}
          <Box sx={{ textAlign: "center", marginBottom: 2 }}>
            <span style={{ fontSize: "16px", fontWeight: "bold" }}>
              {selectedImages.length}{" "}
              {selectedImages.length === 1 ? "image" : "images"} selected
            </span>
          </Box>

          {droppings.length > 0 ? (
            <Grid container spacing={2}>
              {droppings.map((dropping) => (
                <Grid item xs={6} sm={4} md={3} key={dropping.id}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => handleDroppingDataClick(dropping)}
                    sx={{
                      padding: 0,
                      display: "block",
                      textAlign: "center",
                      border: selectedImages.some(
                        (selectedDropping) =>
                          selectedDropping.id === dropping.id
                      )
                        ? "2px solid #1976d2"
                        : "none",
                    }}
                  >
                    <img
                      src={dropping.imageUrl}
                      alt={dropping.imageName}
                      style={{
                        width: "100%",
                        height: "auto",
                        objectFit: "cover",
                        borderRadius: "8px",
                        opacity: selectedImages.some(
                          (selectedDropping) =>
                            selectedDropping.id === dropping.id
                        )
                          ? 0.7
                          : 1,
                      }}
                    />
                  </Button>
                  <p
                    style={{
                      textAlign: "center",
                      marginTop: "8px",
                      fontSize: "14px",
                      color: "gray",
                    }}
                  >
                    {dropping.imageDateTaken}
                  </p>
                </Grid>
              ))}
            </Grid>
          ) : (
            <p>No detected droppings found.</p>
          )}
        </DialogContent>

        {selectedImages.length > 0 && (
          <Fab
            color="primary"
            sx={{
              backgroundColor: primaryColor,
              "&:hover": { backgroundColor: "white" },
              color: textColor,
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
              position: "absolute",
              bottom: 20,
              right: 20,
              zIndex: 1000,
            }}
            onClick={handleSendAllImages}
          >
            <SendIcon />
          </Fab>
        )}
      </Dialog>
    </div>
  );
}
export default Messages;
