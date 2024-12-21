import React, { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import {
  ref,
  getDownloadURL,
  uploadBytes,
  listAll,
  getMetadata,
} from "firebase/storage";
import { storage, firestore } from "./firebase";
import { collection, doc, setDoc, Timestamp } from "firebase/firestore";

const ModelApp = () => {
  const [model, setModel] = useState(null);
  const [imageURL, setImageURL] = useState("");
  const canvasRef = useRef(null);
  const [imageName, setImageName] = useState("");

  useEffect(() => {
    const loadModel = async () => {
      const loadedModel = await tf.loadGraphModel(
        process.env.PUBLIC_URL + "/yolov5s_web_model/model.json"
      );
      setModel(loadedModel);
      console.log("Model loaded!");
    };

    const fetchNewestImage = async () => {
      const listRef = ref(storage, "data");
      const allItems = await listAll(listRef);
      const itemsWithMetadata = await Promise.all(
        allItems.items.map(async (item) => {
          const metadata = await getMetadata(item);
          return { ref: item, name: item.name, updated: metadata.updated };
        })
      );

      const latestItem = itemsWithMetadata.sort(
        (a, b) => new Date(b.updated) - new Date(a.updated)
      )[0];

      if (latestItem) {
        const url = await getDownloadURL(latestItem.ref);
        setImageURL(url);
        setImageName(latestItem.name);  // Set the image name
      }
    };

    loadModel();
    fetchNewestImage();
  }, []);

  useEffect(() => {
    const detectObjects = async () => {
      if (model && imageURL && canvasRef.current) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = imageURL;
        img.onload = async () => {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext("2d");
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          let inputTensor = tf.browser.fromPixels(img).div(255.0).expandDims(0);
          inputTensor = tf.image.resizeBilinear(inputTensor, [416, 416]);

          const classNames = ['Coccidiosis-like', 'Healthy', 'NCD-like', 'Salmonella-like'];
          const detectionsCount = classNames.reduce((acc, className) => {
            acc[className] = 0;
            return acc;
          }, {});

          try {
            const predictions = await model.executeAsync(inputTensor);
            const boxesTensor = predictions.slice([0, 0, 0], [1, 10647, 4]).reshape([10647, 4]);
            const scoresTensor = predictions.slice([0, 0, 4], [1, 10647, 1]).reshape([10647]);
            const labelsTensor = predictions.slice([0, 0, 5], [1, 10647, 1]).reshape([10647]);

            const boxes = boxesTensor.arraySync();
            const scores = scoresTensor.arraySync();
            const labels = labelsTensor.arraySync();

            const confidenceThreshold = 0.5;
            const filteredIndices = scores
              .map((score, idx) => (score > confidenceThreshold ? idx : -1))
              .filter(idx => idx !== -1);

            const filteredBoxes = filteredIndices.map(idx => boxes[idx]);
            const filteredScores = filteredIndices.map(idx => scores[idx]);
            const filteredLabels = filteredIndices.map(idx => labels[idx]);

            const nmsIndices = await tf.image.nonMaxSuppressionAsync(
              tf.tensor2d(filteredBoxes),
              tf.tensor1d(filteredScores),
              50,
              0.5,
              confidenceThreshold
            );

            const selectedIndices = await nmsIndices.array();
            nmsIndices.dispose();

            selectedIndices.forEach(idx => {
              const box = filteredBoxes[idx];
              const score = filteredScores[idx];
              const labelIndex = Math.round(filteredLabels[idx]);
              const label = classNames[labelIndex] || "Unknown";
              detectionsCount[label] += 1;

              const [x_center, y_center, box_width, box_height] = box;
              const x = (x_center - box_width / 2) * img.width;
              const y = (y_center - box_height / 2) * img.height;
              const width = box_width * img.width;
              const height = box_height * img.height;

              ctx.strokeStyle = "red";
              ctx.lineWidth = 2;
              ctx.strokeRect(x, y, width, height);

              ctx.fillStyle = "red";
              ctx.font = "18px Arial";
              ctx.fillText(`${label} (${(score * 100).toFixed(0)}%)`, x, y - 5);
            });

            const formattedDate = new Date().toLocaleString('en-US', {
              month: '2-digit', day: '2-digit', year: '2-digit',
              hour: '2-digit', minute: '2-digit', hour12: false
            }).replace(',', '').replace(/\//g, '-').replace(' ', '-');

            const docRef = doc(collection(firestore, "detectedDroppings"), `${imageName}_${formattedDate}`);
            await setDoc(docRef, {
              detectionsCount,
              date: Timestamp.now()
            });

            canvas.toBlob(async (blob) => {
              const processedImageRef = ref(storage, `dataProcessed/${imageName}_processed.png`);
              await uploadBytes(processedImageRef, blob);
              console.log("Processed image uploaded!");
            });

            boxesTensor.dispose();
            scoresTensor.dispose();
            labelsTensor.dispose();
          } catch (error) {
            console.error("Error processing the image:", error);
          }
        };
      }
    };

    detectObjects();
  }, [model, imageURL, imageName]);

  return (
    <div>
      <h1>TensorFlow.js Model in React</h1>
      <p>Model {model ? "loaded" : "loading..."}</p>
      {imageURL && <img src={imageURL} alt="Before" />}
      <canvas ref={canvasRef}></canvas>
    </div>
  );
};

export default ModelApp;
