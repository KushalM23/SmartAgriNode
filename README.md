# SmartAgriNode

## Smart Agriculture System: ML-Based Weed Detection & Crop Recommendation using IoT


### Overview

SmartAgriNode integrates Machine Learning and IoT to help farmers with:

- Weed Detection: YOLOv8 deep learning model for detecting weeds in crop images.

- Crop Recommendation: Random Forest classifier for suggesting the best crop based on soil and environmental parameters.

IoT-ready: Designed for deployment on microcontrollers and sensor networks. This system reduces manual labor, improves crop yield, and enables data-driven agricultural decisions.


### Features

- YOLOv8-powered weed detection — identifies weeds with high accuracy.

- Random Forest-based crop recommendation — predicts the most suitable crop based on soil and climate inputs.

- Real-time sensing — can integrate with soil and weather sensors.

- Outputs — annotated images, recommendation results, and logs.


### Project Structure

```SmartAgriNode/
├── data/
│   ├── weeddataset/                        # Dataset for Weed Detection training/validation
│   │   ├── train/
│   │   │   ├── images/
│   │   │   └── labels/
│   │   ├── val/
│   │   │   ├── images/
│   │   │   └── labels/
│   │   └── test/
│   │       ├── images/
│   │       └── labels/
│   └── data.yaml                           # Weed detection dataset config file
│
│── Models/
│   ├── crop_recommendation_model.pkl       # Crop recommendation model file
│   └── weed_detection_model.pt             # Weed detection model file
│
├── Crop_ds.csv                             # Dataset for crop recommendation
│
├── Notebooks/                              # Jupyter notebooks for experiments
│   ├── CropModel_train.ipynb               # Training notebook for crop recommendation model
│   ├── WeedModel_train.ipynb               # Training notebook for weed detection (YOLO)
│   ├── predict.ipynb                       # Example prediction inference
│   └── yolov8n.pt                          # Imported yolov8 nano model from ultralytics
│
├── Outputs/
│   └── test_runs/WeedDetection/            # Output from Weed detection testing
│       │   └── run1.jpg
│       ├── run2/
│       │   └── run2.jpg
│       └── run3/
│           └── run3.jpg
|
├── test_images/                            # Sample test images for weed detection
│   ├── run1.jpg
│   ├── run2.jpg
│   └── run3.jpg
│
├── requirements.txt                        # Python dependencies
└── README.md                               # Project documentation
```


### Installation

Prerequisites
```
- Python 3.8+
- pip
- Jupyter Notebook
```

### Setup

```git clone https://github.com/KushalM23/SmartAgriNode.git
cd SmartAgriNode
pip install -r requirements.txt
```

### Usage

1. Weed Detection

Run YOLOv8 inference on a test image:

```
bash
python Scripts/weed_detection.py --input test_images/run1.jpg --output Outputs/test_runs/WeedDetection/run1/
```
Input: Path to crop field image.

Output: Annotated image with weeds marked.

2. Crop Recommendation

Run the crop recommendation script:
```
python Scripts/crop_recommendation.py --soil_n 20 --soil_p 15 --soil_k 5 --temperature 25 --ph 6.5 --rainfall 100
```
Parameters: Soil nutrients & weather conditions.

Output: Recommended crop printed to console.


### Data Sources

- Weed Dataset: YOLO-compatible dataset (images/ and labels/) defined in data.yaml.

- Crop Dataset: Crop_ds.csv containing soil & environmental parameters with target crop labels.

### Model Training

Use WeedModel_train.ipynb to train YOLOv8 on weed dataset.

Use CropModel_train.ipynb to train Random Forest classifier on crop dataset.

### IoT Integration

This system is designed for deployment with:

Microcontrollers (ESP32).

Sensors (NPK, soil moisture, pH, temperature, rainfall).

Real-time monitoring dashboards (future expansion).


### Contributing

Contributions are welcome!

- Fork the repo & create feature branches.

- Submit Pull Requests with proper documentation.


### License

MIT License