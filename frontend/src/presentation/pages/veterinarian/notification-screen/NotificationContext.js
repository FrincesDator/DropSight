import { useState, useEffect } from "react";
import { getDatabase, ref, onValue, update, remove } from "firebase/database";
 
const useNotifications = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  const loggedInUserID = loggedInUser?.UserID;
  const db = getDatabase(); 
 
  useEffect(() => {
    if (!loggedInUserID) return;
 
    const messagesRef = ref(db, "messages");
 
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const notificationsData = [];
      snapshot.forEach((conversation) => {
        const conversationId = conversation.key; 
        const messages = conversation.val();
 
        const receiverID = conversationId.split("_")[1];
        if (receiverID === loggedInUserID) {
          for (const messageId in messages) {
            const message = messages[messageId];
            if (!message.isRead) {
              notificationsData.push({
                id: messageId,
                conversationId,
                message: `${message.senderName} sent you a message`,
                read: false,
              });
            }
          }
        }
      });
      setNotifications(notificationsData);
    });
 
    return () => unsubscribe(); 
  }, [db, loggedInUserID]);
 
  const unreadCount = notifications.length;
 
  const handleNotificationClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
 
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
 
  const markAsRead = (id, conversationId) => {
    const notificationRef = ref(db, `messages/${conversationId}/${id}`);
    update(notificationRef, { isRead: true });
 
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };
 
  const deleteNotification = (id, conversationId) => {
    const notificationRef = ref(db, `messages/${conversationId}/${id}`);
    remove(notificationRef);
 

    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };
 
  return {
    anchorEl,
    notifications,
    unreadCount,
    handleNotificationClick,
    handleMenuClose,
    markAsRead,
    deleteNotification,
  };
};
 
export default useNotifications;