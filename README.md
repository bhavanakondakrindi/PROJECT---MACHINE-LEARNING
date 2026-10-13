# Traffic Flow Data Visualization Using PCA and t-SNE

A high-performance, interactive machine learning dashboard for exploring high-dimensional vehicular traffic flow data using Principal Component Analysis (PCA) and t-distributed Stochastic Neighbor Embedding (t-SNE).

Developed for a **BTech Machine Learning Project Demonstration & Review**.

---

## 🚦 Project Overview

In Intelligent Transportation Systems (ITS) and Vehicular Ad-hoc Networks (VANETs), traffic flow is characterized by dozens of concurrent physical, spatial, and wireless network metrics. Understanding patterns and boundary transitions among different traffic states—**Free-flow, Moderate, Heavy, and Gridlock**—requires dimensionality reduction.

This web application transforms high-dimensional data (24 continuous numerical features) into intuitive, interactive two-dimensional visual representations to explore global variance and non-linear local neighborhood dynamics.

---

## 🛠️ Technology Stack (100% Pure Frontend)

- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS (Analytical design system, custom Inter typography)
- **Interactive Visualizations:**
  - **Plotly.js (WebGL `scattergl`):** Ultra-fast 2D scatter plots with pan, zoom, tooltip inspections, and dynamic label filtering
  - **Recharts:** Statistical class distribution donuts, horizontal progress bars, and PCA Scree plots
- **CSV Data Processing:** Papa Parse (Browser-side streaming parser with chunked memory profiling)
- **Multithreaded ML Computation:** HTML5 Web Workers (Dedicated background threads for PCA and t-SNE so the UI remains 100% responsive)
- **Icons:** Lucide React

> [!NOTE]
> **No Backend Required:** This application runs **entirely in the browser**. PCA and t-SNE are computed genuine client-side mathematical algorithms inside multithreaded Web Workers, with zero reliance on cloud servers or Python services.

---

## 📊 Dataset Reference Findings (`vanet_traffic_data.csv`)

The application is built around and verified against the actual project dataset:

- **Total Observations:** 195,714 records
- **Total Attributes:** 27 columns
- **Input Features (X):** 24 numerical columns (excluding `timestamp`, `road_segment_id`, `label`)
- **Target Vector (y):** `label` (used exclusively for ground-truth color mapping)
- **Missing Values:** 0
- **Duplicate Records:** 0
- **Road Segments:** 500 distinct corridors

### Class Distribution:
| Traffic Condition | Count | Proportion | Visualization Color |
| :--- | :--- | :--- | :--- |
| **Free-flow** | 57,812 | 29.5% | Emerald Green (`#10B981`) |
| **Moderate** | 54,018 | 27.6% | Cobalt Blue (`#2563EB`) |
| **Heavy** | 47,440 | 24.2% | Amber Orange (`#F59E0B`) |
| **Gridlock** | 36,444 | 18.6% | Crimson Red (`#EF4444`) |

### Verified Mathematical Baseline:
- **PCA Full-Dataset Explained Variance:**
  - **PC1:** 83.68%
  - **PC2:** 8.85%
  - **PC1 + PC2 Total:** **92.53%**
- **Stratified Sample for t-SNE (5,000 observations):**
  - **Free-flow:** 1,477
  - **Moderate:** 1,380
  - **Heavy:** 1,212
  - **Gridlock:** 931
  - **PCA Explained Variance on 5k Sample:** **92.61%**

---

## 🚀 How to Run Locally in VS Code

### Prerequisites:
- Node.js (v18+ or v20+ installed)
- npm (installed with Node)

### Step 1: Open the Project Directory
In VS Code or your terminal:
```bash
cd "C:\Users\Bhavana\.gemini\antigravity\scratch\traffic-flow-visualization"
```

### Step 2: Install Dependencies (Already installed)
If running on a fresh clone:
```bash
npm install
```

### Step 3: Start the Development Server
```bash
npm run dev
```

Open your browser at:
```
http://localhost:5173
```

---

## 📂 Project Architecture

```
traffic-flow-visualization/
├── public/
│   └── sample_5000_reference.json   # Verified 5k sample & reference coordinates for instant Demo Mode
├── src/
│   ├── components/
│   │   ├── charts/
│   │   │   ├── ScatterPlot2D.jsx    # WebGL Plotly 2D scatter plot with custom filters & zoom reset
│   │   │   ├── DistributionChart.jsx# Donut & bar charts for traffic labels
│   │   │   ├── ScreePlot.jsx        # PCA explained variance bar & cumulative line chart
│   │   │   └── FeatureHistogram.jsx # Inspector for individual numerical features
│   │   ├── common/
│   │   │   ├── Badge.jsx            # Traffic label indicators
│   │   │   ├── EmptyState.jsx       # Empty state prompts
│   │   │   ├── LoadingOverlay.jsx   # Live progress bar with cancellation
│   │   │   └── StatCard.jsx         # Analytical KPI cards
│   │   ├── dataset/
│   │   │   ├── DataTable.jsx        # Paginated, searchable preview table
│   │   │   └── UploadDropzone.jsx   # Drag-and-drop CSV parser with Papa Parse
│   │   └── layout/
│   │       ├── Header.jsx           # Top navigation bar & upload trigger
│   │       └── Sidebar.jsx          # Persistent analytical navigation & dataset status
│   ├── context/
│   │   └── DatasetContext.jsx       # Global state management for dataset, PCA & t-SNE runs
│   ├── pages/
│   │   ├── Overview.jsx             # Hero, KPI metrics, label distribution, workflow steps
│   │   ├── DatasetExplorer.jsx      # CSV dropzone, data table preview, feature histograms
│   │   ├── DataPreparation.jsx      # Standardization formulas, before/after z-scores, domain checks
│   │   ├── PCAAnalysis.jsx          # Run PCA, PC1 vs PC2 plot, Scree plot, dynamic interpretation
│   │   ├── TSNEAnalysis.jsx         # Stratified sampling, perplexity, t-SNE plot, progress feedback
│   │   ├── Comparison.jsx           # Side-by-side synchronized view, properties matrix
│   │   ├── Methodology.jsx          # 10-step pipeline flowchart & algorithm mathematics
│   │   ├── About.jsx                # Academic scope, Python vs JS distinction, future scope
│   │   └── ExportData.jsx           # CSV coordinate downloads (id, label, PC1/2, tSNE1/2)
│   ├── services/
│   │   ├── csvParser.js             # Streaming CSV profiling & quality checks
│   │   └── exportService.js         # Coordinate CSV and JSON report downloads
│   ├── utils/
│   │   ├── constants.js             # Traffic colors, column names, baseline numbers
│   │   └── math.js                  # Pure math: Jacobi eigen-decomposition, z-scores, LCG sampling
│   ├── workers/
│   │   ├── pcaWorker.js             # Web Worker computing covariance matrix & Jacobi eigen-decomposition
│   │   └── tsneWorker.js            # Web Worker computing t-SNE Barnes-Hut optimization
│   ├── App.jsx                      # App root container & page routing
│   ├── index.css                    # Tailwind CSS directives
│   └── main.jsx                     # React entrypoint
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

---

## 🎓 College Review Demonstration Guide

During your project review or presentation:

1. **Overview Page:** Highlight the total size (195,714 records), the 4 traffic conditions, and the 10-step pipeline workflow.
2. **Dataset Explorer:** Show the paginated preview table and demonstrate the numerical feature histogram (e.g., inspecting `avg_speed_kmph` or `density_veh_per_km`). Explain why `timestamp` and `road_segment_id` are excluded.
3. **Data Preparation:** Walk through the $z = \frac{x - \mu}{\sigma}$ formula and explain why high-magnitude flow and low-magnitude acceleration must be standardized to equal scale. Point out the negative domain validation table (e.g. RSSI dBm is physically negative).
4. **PCA Analysis:** Click **"Run PCA Analysis"** to demonstrate live Web Worker calculation. Show that PC1 + PC2 capture **92.53%** of total variance. Explain the scree plot.
5. **t-SNE Analysis:** Show the sampling controls (5,000 stratified sample), explain perplexity (30), and run the embedding. Point out that Free-flow separates cleanly, while Heavy and Gridlock overlap due to non-linear bottleneck phase transitions.
6. **Side-by-Side Comparison:** Compare the two plots on the shared sample and review the theoretical matrix (linear variance maximization vs local manifold preservation).
7. **Export Page:** Demonstrate downloading the coordinate CSVs for external verification.

---

## 📜 Academic Integrity & Ethical ML Scope

- **No Fake Predictions:** This project is strictly for **Dimensionality Reduction and Data Visualization**. It does not claim to predict future traffic, and does not display synthetic classification accuracy scores or fake confusion matrices.
- **Genuine Algorithms:** PCA and t-SNE coordinates are computed mathematically from empirical data; no hardcoded scatter plot coordinates are used.
