import React, { useEffect, useState } from "react";
import {
  storage,
  ref,
  listAll,
  getDownloadURL,
  uploadBytes,
  getMetadata,
} from "../../../../core/firebase/firebase-model";
import * as tf from "@tensorflow/tfjs";
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  setDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { getDatabase, ref as dbRef, get } from "firebase/database";
 
const Model = () => {
  const [images, setImages] = useState([]);
  const [processedImages, setProcessedImages] = useState([]);
  const [model, setModel] = useState(null); // Store the model in state
  const [hasProcessed, setHasProcessed] = useState(false); // Flag to track if processing is done
  const db = getFirestore(); // Get Firestore instance
  const [userData, setUserData] = useState(null); // Add state for user data
  const [formattedDate, setFormattedDate] = useState(""); // State for formatted date
  const [latestUpdateDate, setLatestUpdateDate] = useState("");
 
  const classNames = [
    "Coccidiosis-like",
    "Healthy",
    "NCD-like",
    "Salmonella-like",
  ];
  const classColors = {
    Healthy: { fill: "#4A7F2C", stroke: "#4A7F2C" },
    "Salmonella-like": { fill: "#FFC107", stroke: "#FFC107" },
    "NCD-like": { fill: "#F44336", stroke: "#F44336" },
    "Coccidiosis-like": { fill: "#0288D1", stroke: "#0288D1" },
  };
 
  // Retrieve logged-in user data from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("loggedInUser");
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
  }, []);
 
  const loadLatestImageFromFirebase = async () => {
    try {
      const folderRef = ref(storage, "data/");
      const list = await listAll(folderRef);
 
      if (list.items.length > 0) {
        // Fetch metadata for all items to get their creation dates
        const itemsWithDates = await Promise.all(
          list.items.map(async (item) => {
            const metadata = await getMetadata(item);
            return { item, timeCreated: new Date(metadata.timeCreated) };
          })
        );
 
        // Sort items by creation date in descending order
        itemsWithDates.sort((a, b) => b.timeCreated - a.timeCreated);
 
        // Get the latest item
        const latestItem = itemsWithDates[0].item;
        const latestImageUrl = await getDownloadURL(latestItem);
       
        setImages([latestImageUrl]); // Store only the latest image
       
        // Process the latest image right away
        processLatestImage();
      }
    } catch (error) {
      console.error("Error loading latest image from Firebase:", error);
    }
  };
 
 
 
  const loadModel = async () => {
    try {
      const loadedModel = await tf.loadGraphModel("/yolov5m/model.json");
      setModel(loadedModel);
    } catch (error) {
      console.error("Error loading model:", error);
    }
  };
 
  const fetchLatestMetrics = async () => {
    try {
      if (userData && userData.UserID) {
        // Query the "farmOwnerAccount" collection for the document where the UserID matches the logged-in user
        const userQuery = query(
          collection(db, "farmOwnerAccount"),
          where("UserID", "==", userData.UserID)
        );
        const querySnapshot = await getDocs(userQuery);
 
        if (!querySnapshot.empty) {
          // Assume there's only one document matching the UserID
          const userDoc = querySnapshot.docs[0];
          const metricsQuery = query(
            collection(userDoc.ref, "Metrics"),
            orderBy("timestamp", "desc"),
            limit(1)
          );
          const metricsSnapshot = await getDocs(metricsQuery);
          const latestMetricDoc = metricsSnapshot.docs[0];
          return latestMetricDoc.exists() ? latestMetricDoc.data() : {};
        } else {
          console.error("User document not found.");
          return {};
        }
      } else {
        console.error("User ID is not available.");
        return {};
      }
    } catch (error) {
      console.error("Error fetching latest metrics:", error);
      return {};
    }
  };
 
  const processSingleImage = async (imageUrl, fileName) => {
    if (!model) {
      console.error("Model is not loaded yet!");
      return;
    }
 
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageUrl;
 
      return new Promise(async (resolve, reject) => {
        img.onload = async () => {
          try {
            const originalWidth = img.width;
            const originalHeight = img.height;
 
            let imgTensor = tf.browser.fromPixels(img).expandDims(0);
            imgTensor = tf.image.resizeBilinear(imgTensor, [640, 640]);
            imgTensor = imgTensor.div(255.0);
 
            const outputTensor = model.execute(imgTensor);
            const detections = outputTensor.arraySync()[0];
 
            // Filter detections by confidence
            const filteredDetections = detections.filter(
              ([x, y, w, h, confidence, ...classScores]) => confidence > 0.5
            );
            console.log("Filtered detections:", filteredDetections);
 
            const canvas = document.createElement("canvas");
            canvas.width = originalWidth;
            canvas.height = originalHeight;
            const ctx = canvas.getContext("2d");
 
            ctx.drawImage(img, 0, 0, originalWidth, originalHeight);
 
            const scaleX = originalWidth / 640;
            const scaleY = originalHeight / 640;
 
            const processedDetections = nonMaxSuppression(
              filteredDetections,
              0.5, // Lower threshold for overlap
              scaleX,
              scaleY
            );
 
            renderBoundingBoxes(ctx, processedDetections);
 
            // Initialize detections count object
            const detectionsCount = {
              "Coccidiosis-like": 0,
              Healthy: 0,
              "NCD-like": 0,
              "Salmonella-like": 0,
            };
 
            let highestDetectionClass = null;
 
            // Count detections per class
            processedDetections.forEach((det) => {
              detectionsCount[det.className] += 1;
            });
 
            // Find the class with the highest number of detections
            const mostDetectedClass = Object.keys(detectionsCount).reduce(
              (a, b) => (detectionsCount[a] > detectionsCount[b] ? a : b)
            );
 
            // Store the class with the most detections as the "highest detected class"
            highestDetectionClass = mostDetectedClass;
 
            // Add _processed suffix before file extension
            const processedFileName = fileName.replace(
              /\.[^/.]+$/,
              "_processed$&"
            );
 
            canvas.toBlob(async (blob) => {
              const processedRef = ref(
                storage,
                `dataProcessed/${processedFileName}`
              );
              await uploadBytes(processedRef, blob);
              const processedUrl = await getDownloadURL(processedRef);
 
              // Get metadata for the original image
              const imageRef = ref(storage, `data/${fileName}`);
              const metadata = await getMetadata(imageRef);
              const creationDate = new Date(
                metadata.timeCreated
              ).toLocaleString("en-US", {
                timeZone: "Asia/Singapore",
                month: "long",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "numeric",
                second: "numeric",
                hour12: true,
              });
 
              // Get the current timestamp
              const formattedDate = Timestamp.now().toDate().toLocaleString()
 
              setFormattedDate(formattedDate); // Update state with the formatted date
 
              const database = getDatabase();
              const tempRef = dbRef(database, "DHT_11/Temperature");
              const humidityRef = dbRef(database, "DHT_11/Humidity");
 
              const [tempSnapshot, humiditySnapshot] = await Promise.all([
                get(tempRef),
                get(humidityRef),
              ]);
 
              const temp = tempSnapshot.exists() ? tempSnapshot.val() : null;
              const humidity = humiditySnapshot.exists()
                ? humiditySnapshot.val()
                : null;
 
              const metricsData = await fetchLatestMetrics();
 
              // Store data in Firestore with processed image info, detections count, and highest detected class
              await setDoc(doc(db, "detectedDroppings", processedFileName), {
                temp,
                humidity,
                imageName: processedFileName,
                UserID: processedFileName.match(/\((.*?)\)/)?.[1],
                imageDateTaken: creationDate,
                date: formattedDate,
                detectionsCount: detectionsCount, // Add detections count to Firestore document
                highestDetectionClass: highestDetectionClass, // Store the class with the most detections
                metrics: metricsData,
                chickenHouseType: userData?.chickenHouseType,
              });
 
              resolve(processedUrl);
            });
          } catch (error) {
            console.error("Error processing image:", error);
            reject(error);
          }
        };
 
        img.onerror = (error) => {
          console.error("Error loading image:", error);
          reject(error);
        };
      });
    } catch (error) {
      console.error("Error loading model:", error);
      throw error;
    }
  };
 
  // Non-Maximum Suppression (NMS) to reduce duplicate detections
  function nonMaxSuppression(boxes, overlapThresh, scaleX, scaleY) {
    let pick = [];
    boxes = boxes.map(([x, y, w, h, confidence, ...classScores]) => {
      const classId = classScores.indexOf(Math.max(...classScores));
      const className = classNames[classId];
      return { x, y, w, h, confidence, className };
    });
 
    boxes.sort((a, b) => b.confidence - a.confidence); // Sort by confidence
 
    while (boxes.length > 0) {
      const box = boxes.shift();
      pick.push(box);
      boxes = boxes.filter((otherBox) => {
        const overlap = computeOverlap(box, otherBox);
        return overlap < overlapThresh;
      });
    }
 
    return pick.map((det) => ({
      ...det,
      xPos: (det.x - det.w / 2) * 640 * scaleX, // Adjust x to center the box
      yPos: (det.y - det.h / 2) * 640 * scaleY, // Adjust y to center the box
      width: det.w * 640 * scaleX,
      height: det.h * 640 * scaleY,
    }));
  }
 
 
  // Calculate Intersection over Union (IoU)
  function computeOverlap(box1, box2) {
    const x1 = Math.max(box1.xPos, box2.xPos);
    const y1 = Math.max(box1.yPos, box2.yPos);
    const x2 = Math.min(box1.xPos + box1.width, box2.xPos + box2.width);
    const y2 = Math.min(box1.yPos + box1.height, box2.yPos + box2.height);
 
    const intersectionArea = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
    const box1Area = box1.width * box1.height;
    const box2Area = box2.width * box2.height;
    const unionArea = box1Area + box2Area - intersectionArea;
 
    return intersectionArea / unionArea;
  }
 
  // Render the bounding boxes on the canvas
  const renderBoundingBoxes = (ctx, detections) => {
    detections.forEach((det) => {
      const { fill, stroke } = classColors[det.className] || {
        fill: "blue",
        stroke: "blue",
      }; // Fallback color
 
      ctx.beginPath();
      ctx.rect(det.xPos, det.yPos, det.width, det.height);
      ctx.lineWidth = 5; // Thicker bounding box
      ctx.strokeStyle = stroke; // Set stroke color
      ctx.fillStyle = fill; // Set text fill color
 
      ctx.font = "bold 25px Roboto, sans-serif"; // Set font size and correct font style
      ctx.textBaseline = "top"; // Align text to top for better positioning
 
      ctx.stroke();
      ctx.fillText(
        `${det.className}: ${det.confidence.toFixed(2)}`,
        det.xPos,
        det.yPos - 25 // Adjust position to accommodate larger text
      );
    });
  };
 
  // Process the latest image only once
  const processLatestImage = async () => {
    if (images.length > 0 && model) {
      const latestImage = images[images.length - 1]; // Get the last added image
      const decodedUrl = decodeURIComponent(latestImage);
      const fileName = decodedUrl.split("/").pop().split("?")[0];
 
      try {
        const processedUrl = await processSingleImage(latestImage, fileName);
 
        // Prevent duplicates in processed images
        setProcessedImages((prev) => {
          if (!prev.includes(processedUrl)) {
            return [...prev, processedUrl];
          }
          return prev;
        });
 
        // Trigger other actions (e.g., updating Firestore or UI)
        console.log("Image processed successfully:", processedUrl);
      } catch (error) {
        console.error("Error processing latest image:", error);
      }
    }
  };
 
 
  useEffect(() => {
    loadModel(); // Load model when component mounts
    loadLatestImageFromFirebase(); // Load images from Firebase
  }, []); // Empty array to load only once on mount
 
  useEffect(() => {
    if (images.length > 0 && model && !hasProcessed) {
      processLatestImage(); // Process the latest image only once
    }
  }, [images, model, hasProcessed]); // This runs only once when both images and model are set
 
  useEffect(() => {
    // Fetch the most recent document from the Firestore 'detectedDroppings' collection
    const loadLatestUpdate = async () => {
      const detectedDroppingsRef = collection(db, "detectedDroppings");
      const q = query(detectedDroppingsRef, orderBy("date", "desc"), limit(1));
      const querySnapshot = await getDocs(q);
 
      if (!querySnapshot.empty) {
        const latestDoc = querySnapshot.docs[0];
        const latestDate = latestDoc.data().date;
        setLatestUpdateDate(latestDate); // Update state with the most recent date
      }
    };
 
    loadLatestUpdate(); // Call the function to fetch the latest date
  }, [db]);
 
  return (
    <div style={{ textAlign: "center", margin: "20px" }}>
      {latestUpdateDate ? (
        <p style={{ fontSize: "16px", fontWeight: "bold", color: "#333" }}>
          Last Updated: {latestUpdateDate}
        </p>
      ) : (
        <p>Loading latest update...</p>
      )}
    </div>
  );
};
 
export default Model;