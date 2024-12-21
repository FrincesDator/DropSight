import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

