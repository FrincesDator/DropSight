import React, { createContext, useState, useEffect } from "react";
import {
  collection,
  addDoc,
  query,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "../../../../core/firebase/firebase-config";

export const NotificationContext = createContext();

export const FarmNotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("loggedInUser");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserData(user);
    } else {  
      console.error("No user data found in localStorage");
    }
  }, []);

  useEffect(() => {
    const fetchNotifications = () => {
      if (!userData || !userData.UserID) {
        console.error("Cannot fetch notifications: UserID is undefined");
        return;
      }

      const q = query(
        collection(db, "notifications"),
        where("userId", "==", userData.UserID)
      );
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedNotifications = [];
        let count = 0;
        querySnapshot.forEach((doc) => {
          const data = { id: doc.id, ...doc.data() };
          fetchedNotifications.push(data);
          if (!data.viewed) count++;
        });
        setNotifications(fetchedNotifications);
        setNotificationCount(count);
      });
      return () => unsubscribe();
    };

    if (userData) {
      fetchNotifications();
    }
  }, [userData]);

  const addNotification = async (message, newMetrics) => {
    if (!userData) return;

    try {
      await addDoc(collection(db, "notifications"), {
        message,
        timestamp: serverTimestamp(),
        viewed: false,
        newMetrics,
        userId: userData.UserID,
      });
    } catch (error) {
      console.error("Error adding notification: ", error);
    }
  };

  const selectNotification = (notification) => {
    setSelectedNotification(notification);
    markAsViewed(notification.id);
  };

  const clearSelectedNotification = () => {
    setSelectedNotification(null);
  };

  const markAsViewed = async (id) => {
    try {
      const docRef = doc(db, "notifications", id);
      await updateDoc(docRef, { viewed: true });
    } catch (error) {
      console.error("Error marking notification as viewed: ", error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await deleteDoc(doc(db, "notifications", id));
      clearSelectedNotification();
    } catch (error) {
      console.error("Error deleting notification: ", error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        notificationCount,
        addNotification,
        selectNotification,
        clearSelectedNotification,
        selectedNotification,
        deleteNotification,
        userData,
        setUserData,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
