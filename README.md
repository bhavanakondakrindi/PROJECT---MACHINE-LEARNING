# Traffic Flow Data Visualization Using PCA and t-SNE

## 📌 Project Overview

Traffic management systems generate large amounts of data from different road segments. This data contains multiple traffic, vehicle, communication, and environmental parameters.

The main challenge is that traffic datasets are often **high-dimensional**, making it difficult to directly visualize and understand relationships between different traffic conditions.

This project uses two dimensionality reduction techniques:

- **Principal Component Analysis (PCA)**
- **t-Distributed Stochastic Neighbor Embedding (t-SNE)**

to reduce high-dimensional traffic data into a **2-dimensional representation** and visualize traffic patterns.

The project focuses on identifying and understanding patterns among four traffic conditions:

- Free-flow
- Moderate
- Heavy
- Gridlock

---

## 🎯 Problem Statement

The traffic dataset contains multiple numerical features describing traffic conditions, vehicle behavior, communication parameters, and environmental factors.

Since the dataset contains **24 numerical features**, it is difficult to visualize the complete dataset directly.

The objective of this project is to:

> **Reduce the dimensionality of high-dimensional traffic-flow data using PCA and t-SNE and visualize the resulting patterns to understand the distribution of different traffic conditions.**

---

## 🎯 Objectives

The main objectives of this project are:

1. To analyze a high-dimensional traffic-flow dataset.
2. To preprocess and standardize the numerical traffic features.
3. To apply PCA for linear dimensionality reduction.
4. To apply t-SNE for nonlinear dimensionality reduction.
5. To visualize the traffic data in two dimensions.
6. To identify patterns among different traffic conditions.
7. To compare the visualization obtained using PCA and t-SNE.
8. To understand the advantages of using different dimensionality reduction techniques for traffic data.

---

## 📊 Dataset

The project uses a traffic-flow dataset containing:

| Dataset Property | Value |
|---|---:|
| Total observations | 195,714 |
| Total columns | 27 |
| Numerical features | 24 |
| Road segments | 500 |
| Traffic conditions | 4 |
| Missing values | 0 |
| Duplicate records | 0 |

### Traffic Conditions

The dataset contains four traffic conditions:

- **Free-flow**
- **Moderate**
- **Heavy**
- **Gridlock**

### Main Feature Categories

The dataset contains features related to:

#### Traffic Features

- Average speed
- Vehicle density
- Average waiting time
- Occupancy
- Traffic flow
- Queue length

#### Vehicle Movement Features

- Average acceleration
- Heading
- Speed-density ratio
- Congestion pressure
- Acceleration directionality

#### Communication Features

- Channel busy ratio
- Message rate
- Average communication delay
- RSSI
- Packet loss

#### Environmental Features

- Temperature
- Visibility
- Rain intensity
- Weather factor

---

## 🔄 Project Workflow

```text
Traffic Dataset
       ↓
Data Inspection
       ↓
Feature Selection
       ↓
Separate Traffic Labels
       ↓
Feature Standardization
       ↓
   ┌───┴────┐
   ↓        ↓
  PCA      t-SNE
   ↓        ↓
  2D       2D
Visualization
   ↓        ↓
   └───┬────┘
       ↓
Compare Results
       ↓
Identify Traffic Patterns
       ↓
Conclusion
