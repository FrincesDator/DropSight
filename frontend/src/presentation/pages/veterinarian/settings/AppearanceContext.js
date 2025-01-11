import React, { createContext, useState, useEffect } from 'react';
import { db } from './../../../../core/firebase/firebase-config'; // Adjust the path as needed
import { doc, getDoc, setDoc } from 'firebase/firestore';

const VetAppearanceContext = createContext();
const colorOptions = [ '#FFFFFF', '#EF6068', '#F5CB5C', '#2D4746'];

const VetAppearanceProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [primaryColor, setPrimaryColor] = useState(colorOptions[2]);

  const [tempTheme, setTempTheme] = useState(theme);
  const [tempPrimaryColor, setTempPrimaryColor] = useState(primaryColor);

  const saveChanges = () => {
    setTheme(tempTheme);
    setPrimaryColor(tempPrimaryColor);
    updateAppearanceSettings(tempTheme, tempPrimaryColor);
  };

  const fetchAppearanceSettings = async (userID) => {
    const userRef = doc(db, "appearanceSettings", userID);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      const { theme, primaryColor } = docSnap.data();
      setTheme(theme);
      setPrimaryColor(primaryColor);
      localStorage.setItem('theme', theme);
      localStorage.setItem('primaryColor', primaryColor);
    } else {
      await setDoc(userRef, {
        theme: "light",
        primaryColor: colorOptions[2]
      });
    }
  };

  const updateAppearanceSettings = async (newTheme, newPrimaryColor) => {
    const storedUser = localStorage.getItem("loggedInUser");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      const userID = userData.UserID;
      const userRef = doc(db, "appearanceSettings", userID);

      try {
        await setDoc(userRef, {
          theme: newTheme,
          primaryColor: newPrimaryColor,
        }, { merge: true }); 
      } catch (error) {
        console.error("Error updating appearance settings:", error);
      }
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("loggedInUser");

    if (storedUser) {
      const userData = JSON.parse(storedUser);
      const userID = userData.UserID;
      fetchAppearanceSettings(userID);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.style.setProperty('--primary-color', primaryColor);
  }, [theme, primaryColor]);

  return (
    <VetAppearanceContext.Provider value={{ 
      theme, setTheme, primaryColor, setPrimaryColor, 
      tempTheme, setTempTheme, tempPrimaryColor, setTempPrimaryColor, 
      saveChanges, colorOptions 
    }}>
      {children}
    </VetAppearanceContext.Provider>
  );
};

export { VetAppearanceContext, VetAppearanceProvider };
