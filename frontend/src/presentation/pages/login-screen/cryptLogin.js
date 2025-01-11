import React, { useRef } from 'react';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../core/firebase/firebase-config';  // Import the Firestore instance
import { hashPassword, comparePassword } from '../../../core/encryption/passwordEncrypt'; // Import the utility functions

const LoginScreen = () => {
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const SignUpForm = async (e) => {
    e.preventDefault();
    const email = emailRef.current.value;
    const password = passwordRef.current.value;

    // Hash the password using utility function
    const hashedPassword = hashPassword(password);

    try {
      // Add a new document to the "testUserCrypt" collection
      const docRef = await addDoc(collection(db, "testUserCrypt"), {
        email: email,
        password: hashedPassword,
      });
      console.log("Document written with ID: ", docRef.id);
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  const LoginForm = async (e) => {
    e.preventDefault();
    const email = emailRef.current.value;
    const password = passwordRef.current.value;

    try {
      // Query the "testUserCrypt" collection for the entered email
      const q = query(collection(db, "testUserCrypt"), where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Fetch the document
        const userDoc = querySnapshot.docs[0].data();
        const storedHashedPassword = userDoc.password;

        // Compare the entered password with the hashed password from the database using utility function
        const passwordMatch = comparePassword(password, storedHashedPassword);

        // Log the result of the comparison
        if (passwordMatch) {
          console.log("Login successful - Passwords match");
        } else {
          console.log("Login failed - Passwords do not match");
        }

        // Log the hashed password and entered password for debugging
        console.log("Entered Password:", password);
        console.log("Hashed Password from Firestore:", storedHashedPassword);
      } else {
        console.log("User not found");
      }
    } catch (error) {
      console.error("Error fetching user data: ", error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Enter Your Credentials</h2>
      <div>
        <input
          ref={emailRef}
          type="email"
          placeholder="Enter your email"
          style={{ marginBottom: '10px', padding: '8px' }}
        />
      </div>
      <div>
        <input
          ref={passwordRef}
          type="password"
          placeholder="Enter your password"
          style={{ marginBottom: '10px', padding: '8px' }}
        />
      </div>
      <div>
        <button onClick={SignUpForm}>
          Sign Up
        </button>
      </div>
      <div>
        <button onClick={LoginForm}>
          Login
        </button>
      </div>
    </div>
  );
};

export default LoginScreen;
