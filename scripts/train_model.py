import json
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans

INPUT_FILE = "../data/collected_environmental_data.csv"

OUTPUT_CSV = "../data/habitat_suitability.csv"
OUTPUT_GEOJSON = "../data/habitat_suitability.geojson"


def run_model(df):
    df = df.copy()

    df["temperature"] = pd.to_numeric(df["temperature"], errors="coerce")
    df["precipitation"] = pd.to_numeric(df["precipitation"], errors="coerce")
    df["elevation"] = pd.to_numeric(df["elevation"], errors="coerce")

    df = df.dropna(subset=["temperature", "precipitation", "elevation"])

    df["slope_proxy"] = (
        df.groupby("date")["elevation"]
        .diff()
        .abs()
        .fillna(0)
    )

    df["temp_elevation_interaction"] = df["temperature"] / (df["elevation"] + 1)

    features = [
        "temperature",
        "precipitation",
        "elevation",
        "slope_proxy",
        "distance_index",
        "temp_elevation_interaction"
    ]

    X = df[features].copy()

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    model = KMeans(
        n_clusters=3,
        random_state=42,
        n_init=10
    )

    df["cluster"] = model.fit_predict(X_scaled)

    centers = pd.DataFrame(
        scaler.inverse_transform(model.cluster_centers_),
        columns=features
    )

    centers["cluster"] = centers.index

    centers["suitability_score_for_label"] = (
        -centers["temperature"] * 0.55
        + centers["elevation"] * 0.35
        + centers["precipitation"] * 0.10
    )

    ordered = centers.sort_values("suitability_score_for_label")

    label_map = {
        int(ordered.iloc[0]["cluster"]): "Low",
        int(ordered.iloc[1]["cluster"]): "Moderate",
        int(ordered.iloc[2]["cluster"]): "High"
    }

    df["suitability_level"] = df["cluster"].map(label_map)

    raw_score = (
        -df["temperature"].rank(pct=True) * 0.55
        + df["elevation"].rank(pct=True) * 0.35
        + df["precipitation"].rank(pct=True) * 0.10
    )

    df["suitability_score"] = (
        (raw_score - raw_score.min()) /
        (raw_score.max() - raw_score.min())
    )

    df["visual_level"] = pd.qcut(
        df["suitability_score"],
        q=3,
        labels=["Low", "Moderate", "High"],
        duplicates="drop"
    )

    return df


def export_geojson(df):
    features = []

    for _, row in df.iterrows():
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [
                    float(row["lng"]),
                    float(row["lat"])
                ]
            },
            "properties": {
                "point_id": int(row["point_id"]),
                "date": str(row["date"]),
                "temperature": round(float(row["temperature"]), 2),
                "precipitation": round(float(row["precipitation"]), 2),
                "elevation": round(float(row["elevation"]), 2),
                "slope_proxy": round(float(row["slope_proxy"]), 2),
                "cluster": int(row["cluster"]),
                "suitability_level": str(row["suitability_level"]),
                "visual_level": str(row["visual_level"]),
                "suitability_score": round(float(row["suitability_score"]), 3)
            }
        })

    geojson = {
        "type": "FeatureCollection",
        "features": features
    }

    with open(OUTPUT_GEOJSON, "w") as f:
        json.dump(geojson, f, indent=2)


def main():
    print("Loading collected data...")
    df = pd.read_csv(INPUT_FILE)

    print("Training model...")
    df = run_model(df)

    print("Saving CSV...")
    df.to_csv(OUTPUT_CSV, index=False)

    print("Saving GeoJSON...")
    export_geojson(df)

    print("\nCreated:")
    print(OUTPUT_CSV)
    print(OUTPUT_GEOJSON)


if __name__ == "__main__":
    main()