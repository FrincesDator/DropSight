import { initializeApp } from "firebase/app";
import { getStorage, ref, listAll, getDownloadURL, uploadBytes, getMetadata } from "firebase/storage";
 
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
const storage = getStorage(app);
 
export { storage, ref, listAll, getDownloadURL, uploadBytes, getMetadata };