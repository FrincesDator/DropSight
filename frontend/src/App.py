from flask import Flask, jsonify, request
from flask_cors import CORS
import pickle   as pickle
app = Flask(__name__)
# Enable CORS for specific routes
CORS(app, resources={r"/predict": {"origins": "*"}})
# Load the pre-trained model
model = pickle.load(open('model/model.pkl', 'rb'))
@app.route('/')
def hello_world():
    return "Hello, World!"
@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    # Extract features from the JSON data
    features = [
        float(data['healthStatus']),
        float(data['temperature']),
        float(data['humidity']),
        float(data['waterIntake']),
        float(data['feedIntake']),
        float(data['weight']),
        float(data['mortalityRate'])
    ]
    # Make prediction
    prediction = model.predict([features])[0]
    labels = {
        1: "High chance of infectious disease",
        2: "Low chance of infectious disease",
        3: "Environmental stress & High chance of infectious disease",
        4: "Environmental stress & Low chance of infectious disease",
        5: "Normal",
        6: "Environmental stress"
    }
    pred_message = f"The health analysis indicates: {labels.get(prediction, 'Unknown')}"

    return jsonify({"pred": pred_message})

if __name__ == '__main__':
    app.run(debug=True)
