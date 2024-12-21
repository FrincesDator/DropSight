// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getStorage, ref as storageRef, listAll, getDownloadURL } from 'firebase/storage';
import { getDatabase, ref as databaseRef, push, onValue, update } from "firebase/database"; // For Realtime Database
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore"; // For Firestore

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
const storage = getStorage(app);
// Initialize Realtime Database
const database = getDatabase(app);
// Initialize Firestore
const db = getFirestore(app);

export { database, storage, storageRef, listAll, getDownloadURL, push, onValue, db, collection, query, where, getDocs, update, databaseRef };
