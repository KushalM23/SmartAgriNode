Smart Agriculture System: ML-based Weed Detection and Crop Recommendation
Project Overview
This project integrates Machine Learning and IoT to create a smart agriculture node capable of:

Detecting weeds in crop fields using image data and a YOLOv8 deep learning model.

Recommending the most suitable crop based on real-time soil and environmental parameters using a Random Forest classifier.

The system is designed to help farmers increase crop yield, reduce manual effort, and make data-driven decisions.

Features
Weed detection using a YOLOv8 model

Crop recommendation based on soil nutrients and weather inputs

Compatible with microcontrollers and sensor nodes for deployment in the field

Outputs include prediction logs, annotated images, and confidence scores

Project Structure
bash
Copy
Edit
project-root/
│
├── models/
│ ├── weed_detection/ # YOLOv8 weights and model files
│ └── crop_recommendation/ # Random Forest model (e.g., .pkl file)
│
├── datasets/
│ ├── weed_images/ # Images used for training/testing weed model
│ └── crop_data.csv # Crop dataset with soil and weather features
│
├── outputs/
│ ├── weed_detection/ # Annotated prediction images and logs
│ └── crop_recommendation/ # Logs of crop prediction results
│
├── scripts/
│ ├── run_weed_detection.py # Script to run YOLOv8 inference
│ ├── run_crop_recommend.py # Script for crop recommendation
│ └── utils.py # Utility functions
│
├── test_images/ # Sample images for weed detection
├── requirements.txt # List of Python dependencies
└── README.md # Project documentation
How to Run

1. Clone the Repository
   bash
   Copy
   Edit
   git clone https://github.com/yourusername/smart-agriculture-node.git
   cd smart-agriculture-node
2. Install Dependencies
   nginx
   Copy
   Edit
   pip install -r requirements.txt
3. Run Weed Detection
   bash
   Copy
   Edit
   python scripts/run_weed_detection.py --img test_images/sample1.jpg
   The output will be saved in outputs/weed_detection/ with the prediction image and detection log.

4. Run Crop Recommendation
   bash
   Copy
   Edit
   python scripts/run_crop_recommend.py --input "95,67,64,15,38,3,64"
   The recommended crop will be printed based on the input values.

Model Details
Weed Detection
Model: YOLOv8

Trained on: Custom-labeled dataset of crop field images

Output: Bounding boxes with confidence scores for weed detection

Crop Recommendation
Model: Random Forest Classifier

Trained on: Soil and weather dataset

Input Features: Nitrogen, Phosphorus, Potassium, Temperature, Humidity, pH, Rainfall

Output: Recommended crop label

Integration Notes
This system can be integrated with:

Microcontrollers like NodeMCU or ESP32 to collect sensor input

Web dashboard for viewing predictions

Automated drones or robots for capturing field images

License
This project is licensed under the MIT License.
