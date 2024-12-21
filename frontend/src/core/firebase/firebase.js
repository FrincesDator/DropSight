import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onValue, update } from "firebase/database"; // For Realtime Database
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore"; // For Firestore
import { getStorage, ref as storageRef, getDownloadURL } from "firebase/storage"; // For Storage

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCK9yPZTny106GrWl_krC-qvUFhzniCzlE",
  authDomain: "dropsight-77ddf.firebaseapp.com",
  databaseURL: "https://dropsight-77ddf-default-rtdb.firebaseio.com",
  projectId: "dropsight-77ddf",
  storageBucket: "dropsight-77ddf.appspot.com",
  messagingSenderId: "166696148560",
  appId: "1:166696148560:web:99a5234bb397c4cbc27b55",
  measurementId: "G-Y4B882M32E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
const database = getDatabase(app);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Storage
const storage = getStorage(app);

// Export Realtime Database, Firestore, and Storage utilities
export { database, ref, push, onValue, db, collection, query, where, getDocs, update, storage, storageRef, getDownloadURL };
