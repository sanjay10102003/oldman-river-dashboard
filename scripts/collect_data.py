import json
import time
import requests
import pandas as pd

RIVER_FILE = "../data/oldman_river.geojson"
OUTPUT_FILE = "../data/collected_environmental_data.csv"

START_DATE = "2026-01-01"
END_DATE = "2026-05-01"
MAX_POINTS = 250


def load_river_points():
    with open(RIVER_FILE, "r") as f:
        data = json.load(f)

    coords = []

    for feature in data["features"]:
        geom = feature["geometry"]

        if geom["type"] == "LineString":
            coords.extend(geom["coordinates"])

        elif geom["type"] == "MultiLineString":
            for line in geom["coordinates"]:
                coords.extend(line)

    step = max(1, len(coords) // MAX_POINTS)
    sampled = coords[::step]

    rows = []

    for i, c in enumerate(sampled):
        rows.append({
            "point_id": i + 1,
            "lng": c[0],
            "lat": c[1],
            "distance_index": i
        })

    return pd.DataFrame(rows)


def fetch_elevations(df):
    elevations = []

    for i in range(0, len(df), 100):
        chunk = df.iloc[i:i + 100]

        url = "https://api.open-meteo.com/v1/elevation"

        params = {
            "latitude": ",".join(chunk["lat"].astype(str)),
            "longitude": ",".join(chunk["lng"].astype(str))
        }

        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()

        data = response.json()
        elevations.extend(data["elevation"])

        time.sleep(0.3)

    df["elevation"] = elevations
    return df


def fetch_daily_weather(lat, lng):
    url = "https://archive-api.open-meteo.com/v1/archive"

    params = {
        "latitude": lat,
        "longitude": lng,
        "start_date": START_DATE,
        "end_date": END_DATE,
        "daily": "temperature_2m_mean,precipitation_sum",
        "timezone": "America/Edmonton"
    }

    response = requests.get(url, params=params, timeout=30)
    response.raise_for_status()

    daily = response.json()["daily"]

    rows = []

    for i, date in enumerate(daily["time"]):
        rows.append({
            "date": date,
            "temperature": daily["temperature_2m_mean"][i],
            "precipitation": daily["precipitation_sum"][i]
        })

    return rows


def main():
    print("Loading river points...")
    points_df = load_river_points()

    print("Fetching elevation data...")
    points_df = fetch_elevations(points_df)

    all_rows = []

    for _, point in points_df.iterrows():
        print(f"Fetching weather for point {int(point['point_id'])} / {len(points_df)}")

        daily_weather = fetch_daily_weather(point["lat"], point["lng"])

        for day in daily_weather:
            all_rows.append({
                "point_id": int(point["point_id"]),
                "lat": point["lat"],
                "lng": point["lng"],
                "distance_index": int(point["distance_index"]),
                "elevation": point["elevation"],
                "date": day["date"],
                "temperature": day["temperature"],
                "precipitation": day["precipitation"]
            })

        time.sleep(0.2)

    final_df = pd.DataFrame(all_rows)
    final_df.to_csv(OUTPUT_FILE, index=False)

    print("\nSaved:")
    print(OUTPUT_FILE)
    print(f"Rows: {len(final_df)}")


if __name__ == "__main__":
    main()