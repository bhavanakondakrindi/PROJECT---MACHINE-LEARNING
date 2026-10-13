import os
import time
import json
import numpy as np
import pandas as pd
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, Query, Body, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE
from sklearn.model_selection import StratifiedShuffleSplit

app = FastAPI(
    title="Traffic Flow PCA & t-SNE ML Service",
    description="Research-grade backend for Traffic Flow Data Dimensionality Reduction and Visualization",
    version="1.0.0"
)

# Enable CORS for local Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for active dataset
active_df: Optional[pd.DataFrame] = None
active_filename: str = "vanet_traffic_data.csv"

DEFAULT_CSV_PATH = r"C:\Users\Bhavana\Downloads\vanet_traffic_data.csv"

def get_feature_columns(df: pd.DataFrame) -> List[str]:
    exclude = {"timestamp", "road_segment_id", "label"}
    return [c for c in df.columns if c not in exclude and np.issubdtype(df[c].dtype, np.number)]

@app.get("/api/health")
def health_check():
    import sklearn
    return {
        "status": "online",
        "engine": "FastAPI + scikit-learn",
        "sklearn_version": sklearn.__version__,
        "dataset_loaded": active_df is not None,
        "rows": len(active_df) if active_df is not None else 0,
        "filename": active_filename
    }

@app.post("/api/load-default")
def load_default_dataset():
    global active_df, active_filename
    if not os.path.exists(DEFAULT_CSV_PATH):
        raise HTTPException(status_code=404, detail=f"File not found at {DEFAULT_CSV_PATH}")
    
    t0 = time.time()
    active_df = pd.read_csv(DEFAULT_CSV_PATH)
    active_filename = os.path.basename(DEFAULT_CSV_PATH)
    load_time = round(time.time() - t0, 3)

    return get_dataset_stats()

@app.post("/api/upload")
async def upload_csv(file: UploadFile = File(...)):
    global active_df, active_filename
    t0 = time.time()
    try:
        active_df = pd.read_csv(file.file)
        active_filename = file.filename
        return get_dataset_stats()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")

@app.get("/api/dataset-stats")
def get_dataset_stats():
    global active_df
    if active_df is None:
        if os.path.exists(DEFAULT_CSV_PATH):
            active_df = pd.read_csv(DEFAULT_CSV_PATH)
        else:
            raise HTTPException(status_code=404, detail="No dataset currently loaded")
            
    df = active_df
    features = get_feature_columns(df)
    
    label_col = "label" if "label" in df.columns else None
    label_distribution = df[label_col].value_counts().to_dict() if label_col else {}
    
    # Feature summaries
    feature_stats = {}
    negative_cols = []
    for f in features:
        col_min = float(df[f].min())
        col_max = float(df[f].max())
        col_mean = float(df[f].mean())
        col_std = float(df[f].std())
        if col_min < 0:
            negative_cols.append({"column": f, "min": round(col_min, 4), "max": round(col_max, 4)})
        feature_stats[f] = {
            "min": round(col_min, 3),
            "max": round(col_max, 3),
            "mean": round(col_mean, 3),
            "std": round(col_std, 3)
        }

    preview_rows = df.head(10).to_dict(orient="records")

    return {
        "filename": active_filename,
        "total_rows": int(len(df)),
        "total_columns": int(len(df.columns)),
        "numerical_features_count": len(features),
        "features": features,
        "label_column": label_col,
        "label_distribution": label_distribution,
        "missing_values": int(df.isnull().sum().sum()),
        "duplicates": int(df.duplicated().sum()),
        "road_segments": int(df["road_segment_id"].nunique()) if "road_segment_id" in df.columns else None,
        "negative_columns": negative_cols,
        "feature_stats": feature_stats,
        "preview": preview_rows
    }

class PCARequest(BaseModel):
    sample_size: Optional[int] = None
    seed: Optional[int] = 42

@app.post("/api/pca")
def run_pca_endpoint(req: PCARequest = Body(...)):
    global active_df
    if active_df is None:
        if os.path.exists(DEFAULT_CSV_PATH):
            active_df = pd.read_csv(DEFAULT_CSV_PATH)
        else:
            raise HTTPException(status_code=404, detail="No dataset loaded")

    df = active_df
    features = get_feature_columns(df)
    if not features:
        raise HTTPException(status_code=400, detail="No valid numerical features found for PCA")

    t0 = time.time()
    
    # Subsample if requested
    if req.sample_size and req.sample_size < len(df):
        if "label" in df.columns:
            sss = StratifiedShuffleSplit(n_splits=1, train_size=req.sample_size, random_state=req.seed)
            idx, _ = next(sss.split(df, df["label"]))
            sub_df = df.iloc[idx].copy()
            sub_df["__orig_idx"] = idx
        else:
            sub_df = df.sample(n=req.sample_size, random_state=req.seed).copy()
            sub_df["__orig_idx"] = sub_df.index
    else:
        sub_df = df.copy()
        sub_df["__orig_idx"] = df.index

    X = sub_df[features].values.astype(np.float64)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    pca = PCA(n_components=2)
    coords = pca.fit_transform(X_scaled)
    var_ratio = pca.explained_variance_ratio_

    # Scree plot for all components
    n_comp_scree = min(len(features), 24)
    pca_all = PCA(n_components=n_comp_scree)
    pca_all.fit(X_scaled)
    scree = (pca_all.explained_variance_ratio_ * 100).round(2).tolist()

    points = []
    labels = sub_df["label"].tolist() if "label" in sub_df.columns else ["Unlabeled"] * len(sub_df)
    orig_idx = sub_df["__orig_idx"].tolist()

    for i in range(len(sub_df)):
        points.append({
            "id": int(orig_idx[i]),
            "label": str(labels[i]),
            "pca_x": round(float(coords[i, 0]), 4),
            "pca_y": round(float(coords[i, 1]), 4)
        })

    duration_ms = round((time.time() - t0) * 1000)

    return {
        "success": True,
        "duration_ms": duration_ms,
        "sample_size": len(sub_df),
        "pc1_variance": round(float(var_ratio[0] * 100), 2),
        "pc2_variance": round(float(var_ratio[1] * 100), 2),
        "total_variance": round(float(sum(var_ratio) * 100), 2),
        "scree_variance": scree,
        "points": points
    }

class TSNERequest(BaseModel):
    sample_size: int = 5000
    perplexity: float = 30.0
    random_state: int = 42
    stratified: bool = True

@app.post("/api/tsne")
def run_tsne_endpoint(req: TSNERequest = Body(...)):
    global active_df
    if active_df is None:
        if os.path.exists(DEFAULT_CSV_PATH):
            active_df = pd.read_csv(DEFAULT_CSV_PATH)
        else:
            raise HTTPException(status_code=404, detail="No dataset loaded")

    df = active_df
    features = get_feature_columns(df)
    if not features:
        raise HTTPException(status_code=400, detail="No valid numerical features found for t-SNE")

    t0 = time.time()
    target_sample = min(req.sample_size, len(df))

    if req.stratified and "label" in df.columns:
        sss = StratifiedShuffleSplit(n_splits=1, train_size=target_sample, random_state=req.random_state)
        sample_idx, _ = next(sss.split(df, df["label"]))
        sub_df = df.iloc[sample_idx].copy()
        sub_df["__orig_idx"] = sample_idx
    else:
        sub_df = df.sample(n=target_sample, random_state=req.random_state).copy()
        sub_df["__orig_idx"] = sub_df.index

    X = sub_df[features].values.astype(np.float64)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Run PCA on the exact same sample for side-by-side comparison
    pca = PCA(n_components=2)
    pca_coords = pca.fit_transform(X_scaled)
    pca_var = (pca.explained_variance_ratio_ * 100).round(2).tolist()

    # Run t-SNE
    perp = min(req.perplexity, (target_sample - 1) / 3)
    tsne = TSNE(n_components=2, perplexity=perp, random_state=req.random_state, max_iter=1000, n_jobs=-1)
    tsne_coords = tsne.fit_transform(X_scaled)

    labels = sub_df["label"].tolist() if "label" in sub_df.columns else ["Unlabeled"] * len(sub_df)
    orig_idx = sub_df["__orig_idx"].tolist()

    points = []
    for i in range(len(sub_df)):
        points.append({
            "id": int(orig_idx[i]),
            "label": str(labels[i]),
            "pca_x": round(float(pca_coords[i, 0]), 4),
            "pca_y": round(float(pca_coords[i, 1]), 4),
            "tsne_x": round(float(tsne_coords[i, 0]), 4),
            "tsne_y": round(float(tsne_coords[i, 1]), 4)
        })

    duration_ms = round((time.time() - t0) * 1000)

    label_counts = sub_df["label"].value_counts().to_dict() if "label" in sub_df.columns else {}

    return {
        "success": True,
        "duration_ms": duration_ms,
        "sample_size": target_sample,
        "perplexity": perp,
        "random_state": req.random_state,
        "label_counts": label_counts,
        "pca_variance": {
            "pc1": pca_var[0],
            "pc2": pca_var[1],
            "total": round(sum(pca_var[:2]), 2)
        },
        "points": points
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
