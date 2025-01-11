import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
import pickle
import warnings

warnings.filterwarnings("ignore")

# Load and clean data
df = pd.read_csv("OverallFactorsFD.csv")
df = df.dropna()

# Update feature and target names
X = df[['Health Status', 'Temperature', 'Humidity', 'Water Intake', 'Feed Intake', 'Weight', 'Mortality Rate']]
y = df['End Result']  # Target: End Result (e.g., 1=Healthy, 2=Cocci, 3=Salmo, 4=NCD)

# Split data into train and test sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)

# Initialize and train model
model = RandomForestRegressor()
model.fit(X_train, y_train)

# Save model
pickle.dump(model, open('model.pkl', 'wb'))

# Load model
loaded_model = pickle.load(open('model.pkl', 'rb'))

# Example input data
input_data = [4, 3,2,1,2,1,1]  # Example input data matching new feature names
input_array = np.array([input_data])  # Reshape input data for prediction

# Make prediction
prediction = loaded_model.predict(input_array)
print(f"The model predicts End Result to be: {prediction[0]}")
