import React, { useState, useEffect, useRef } from "react";
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
} from "@mui/material";
import {
  Done,
  DoneAll,
  Mail as MailIcon,
  ArrowBack,
} from "@mui/icons-material";
import {
  db,
  collection,
  query,
  where,
  getDocs,
} from "../../../../core/firebase/firebase";
import {
  database,
  ref,
  push,
  onValue,
  update,
} from "../../../../core/firebase/firebase";
import "../../../../core/style/Messages.css";
import { useMediaQuery, useTheme } from "@mui/material";

function Messages() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [contacts, setContacts] = useState([]);
  const [showAutoReplies, setShowAutoReplies] = useState(false);
  const [currentDroppingID, setCurrentDroppingID] = useState(null);

  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  const messagesEndRef = useRef(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Detect if the screen is small

  const autoReplies = {
    alarming: [
      "Based on the information you've provided, The droppings data you're describing is quite concerning. It's important that you contact a veterinarian immediately to check on your chickens.",
    ],
    normal: [
      "Based on the information you've provided, The droppings seem to be within a normal range, but it's always good to monitor them. If you notice any drastic changes, please contact a vet.",
    ],
    observe: [
      "Based on the information you've provided, this could be a sign of an underlying issue. It would be wise to monitor your chickens for the next 2-3 days. If their condition worsens or new symptoms appear, please reach out to a vet for further assessment.",
    ],
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const farmOwnerQuery = query(
          collection(db, "farmOwnerAccount"),
          where("UserID", "!=", loggedInUser.UserID)
        );
        const farmOwnerSnapshot = await getDocs(farmOwnerQuery);
        const farmOwners = farmOwnerSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: `${doc.data().fName} ${doc.data().lName}`,
          userType: "Farm Owner",
          ...doc.data(),
        }));

        const contactsWithUnreadCounts = await Promise.all(
          farmOwners.map(async (contact) => {
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
      } catch (error) {
        console.error("Error fetching contacts:", error);
      }
    };

    fetchContacts();
  }, [loggedInUser.UserID]);

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name &&
      contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = (messageToSend, isAutoReply = false) => {
    if (messageToSend.trim() && selectedContact) {
      const timestamp = Date.now();
      const formattedDate = new Date(timestamp).toLocaleString();

      const newMessageData = {
        text: messageToSend,
        timestamp,
        formattedDate,
        sender: loggedInUser.UserID,
        receiver: selectedContact.UserID,
        isRead: false,
      };

      // Include droppingID only for auto-replies
      if (isAutoReply && currentDroppingID) {
        newMessageData.droppingID = currentDroppingID;
      }

      const conversationId = [loggedInUser.UserID, selectedContact.UserID]
        .sort()
        .join("_");
      const messageRef = ref(database, `messages/${conversationId}`);
      push(messageRef, newMessageData).then(() => {
        if (messageToSend === newMessage) {
          setNewMessage("");
        }
      });
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

      // Update messages state
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

          return {
            ...message,
            isRead: true,
          };
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

      // Extract and store the droppingID if present
      if (updatedMessages.length > 0) {
        const lastMessage = updatedMessages[updatedMessages.length - 1];

        if (lastMessage.text.toLowerCase().includes("dropping")) {
          setShowAutoReplies(true);

          // Assume droppingID is included in the message text
          const droppingID = lastMessage.text.match(/droppingID:\s*(\S+)/)?.[1];
          if (droppingID) {
            setCurrentDroppingID(droppingID);
          }
        } else {
          setShowAutoReplies(false);
        }
      }
    });

    return () => unsubscribe();
  };

  const handleAutoReplyClick = (replyText) => {
    handleSendMessage(replyText, true);
    setShowAutoReplies(false);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="message-page">
      <Box height={10} />
      <Grid container spacing={2} sx={{ padding: "0 16px" }}>
        {/* Contact List Section */}
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
            <div
              style={{
                maxHeight: "500px",
                overflowY: "auto",
              }}
            >
              <List>
                {filteredContacts.length > 0 ? (
                  filteredContacts.map((contact, index) => (
                    <React.Fragment key={index}>
                      <ListItemButton
                        onClick={() => handleContactClick(contact)}
                      >
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
            </div>
          </Grid>
        ) : null}

        {/* Chat Section */}
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
                        sx={{ transform: isMobile ? "scale(0.8)" : "scale(1)" }}
                      >
                        Once you start a new conversation, you'll see it listed
                        here.
                      </p>
                    </Stack>
                  )}
                </CardContent>

                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {showAutoReplies && (
                    <div
                      style={{
                        marginBottom: "10px",
                        display: "flex",
                        flexDirection: "row",
                        flexWrap: "wrap",
                        gap: "12px",
                        justifyContent: "center",
                        transform: isMobile ? "scale(0.8)" : "scale(1)",
                      }}
                    >
                      {Object.entries(autoReplies).map(
                        ([category, replies], index) => (
                          <div key={index}>
                            <Button
                              variant="outlined"
                              color="primary"
                              onClick={() => handleAutoReplyClick(replies[0])}
                              size="large"
                              sx={{ textTransform: "none", minWidth: "120px" }}
                            >
                              {category.charAt(0).toUpperCase() +
                                category.slice(1)}
                            </Button>
                          </div>
                        )
                      )}
                    </div>
                  )}

                  {/* Row for TextField and Send Button */}
                  <div
                    style={{
                      display: "flex",
                      width: "100%",
                      alignItems: "center",
                    }}
                  >
                    <TextField
                      fullWidth
                      label="Type a message"
                      variant="outlined"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleSendMessage(newMessage)
                      }
                      sx={{ marginRight: 2 }}
                      InputProps={{
                        className: "txtfield-normal",
                        style: { height: "40px", padding: "4px 12px" },
                      }}
                      InputLabelProps={{
                        className: "txtfield-normal",
                      }}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleSendMessage(newMessage)}
                      sx={{ transform: isMobile ? "scale(0.8)" : "scale(1)" }}
                    >
                      Send
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        )}
      </Grid>
    </div>
  );
}

export default Messages;
