/**
 * Rainbow Trout ML results layers.
 */

function mlResultsFilter() {
  const parts = [];
  if (mlResultsYear && mlResultsYear.value !== "all")
    parts.push([
      "==",
      ["to-number", ["get", "YEAR"]],
      Number(mlResultsYear.value),
    ]);
  if (mlResultsMonth && mlResultsMonth.value !== "all")
    parts.push([
      "==",
      ["to-number", ["get", "MONTH"]],
      Number(mlResultsMonth.value),
    ]);
  return parts.length === 0
    ? null
    : parts.length === 1
      ? parts[0]
      : ["all", ...parts];
}

function applyMlResultsState() {
  const selected = isMlResultsSelected();
  const filter = mlResultsFilter();
  const vis = (id, enabled) => {
    if (!map.getLayer(id)) return;
    map.setLayoutProperty(
      id,
      "visibility",
      selected && enabled ? "visible" : "none",
    );
    map.setFilter(id, filter);
  };
  vis(ML_RESULTS_LAYER_IDS.train, mlShowTrain?.checked);
  vis(ML_RESULTS_LAYER_IDS.test, mlShowTest?.checked);
  vis(ML_RESULTS_LAYER_IDS.presence, mlShowPresence?.checked);
  vis(ML_RESULTS_LAYER_IDS.count, mlShowCount?.checked);
  vis(ML_RESULTS_LAYER_IDS.neighbor, mlShowNeighbor?.checked);
}

function addMlResultsLayers() {
  if (!map.getSource("mlResultsTrain"))
    map.addSource("mlResultsTrain", {
      type: "geojson",
      data: `${ML_RESULTS_BASE_PATH}/rainbow_trout_train.geojson`,
      generateId: true,
    });
  if (!map.getSource("mlResultsTest"))
    map.addSource("mlResultsTest", {
      type: "geojson",
      data: `${ML_RESULTS_BASE_PATH}/rainbow_trout_test.geojson`,
      generateId: true,
    });
  if (!map.getSource("mlResultsPred"))
    map.addSource("mlResultsPred", {
      type: "geojson",
      data: `${ML_RESULTS_BASE_PATH}/rainbow_trout_predictions.geojson`,
      generateId: true,
    });

  if (!map.getLayer(ML_RESULTS_LAYER_IDS.train))
    map.addLayer({
      id: ML_RESULTS_LAYER_IDS.train,
      type: "circle",
      source: "mlResultsTrain",
      layout: { visibility: "none" },
      paint: {
        "circle-radius": [
          "interpolate",
          ["linear"],
          ["zoom"],
          4,
          2.2,
          8,
          3.2,
          12,
          5,
        ],
        "circle-color": "rgba(37,99,235,0.18)",
        "circle-stroke-color": "#2563eb",
        "circle-stroke-width": 1.3,
      },
    });
  if (!map.getLayer(ML_RESULTS_LAYER_IDS.test))
    map.addLayer({
      id: ML_RESULTS_LAYER_IDS.test,
      type: "circle",
      source: "mlResultsTest",
      layout: { visibility: "none" },
      paint: {
        "circle-radius": [
          "interpolate",
          ["linear"],
          ["zoom"],
          4,
          2.6,
          8,
          3.8,
          12,
          5.8,
        ],
        "circle-color": "#ffffff",
        "circle-opacity": 0.72,
        "circle-stroke-color": "#111827",
        "circle-stroke-width": 1.5,
      },
    });
  if (!map.getLayer(ML_RESULTS_LAYER_IDS.presence))
    map.addLayer({
      id: ML_RESULTS_LAYER_IDS.presence,
      type: "circle",
      source: "mlResultsPred",
      layout: { visibility: "none" },
      paint: {
        "circle-radius": [
          "interpolate",
          ["linear"],
          ["zoom"],
          4,
          3,
          8,
          4.5,
          12,
          7,
        ],
        "circle-color": [
          "interpolate",
          ["linear"],
          ["to-number", ["coalesce", ["get", "PRESENCE_PROBABILITY"], 0]],
          0,
          "#fee2e2",
          0.5,
          "#fb923c",
          1,
          "#7f1d1d",
        ],
        "circle-opacity": 0.62,
        "circle-stroke-color": "rgba(127,29,29,0.55)",
        "circle-stroke-width": 0.8,
      },
    });
  if (!map.getLayer(ML_RESULTS_LAYER_IDS.count))
    map.addLayer({
      id: ML_RESULTS_LAYER_IDS.count,
      type: "circle",
      source: "mlResultsPred",
      layout: { visibility: "none" },
      paint: {
        "circle-radius": [
          "interpolate",
          ["linear"],
          ["to-number", ["coalesce", ["get", "PREDICTED_COUNT"], 0]],
          0,
          2.5,
          1,
          3.5,
          3,
          5,
          5,
          6.5,
          10,
          8,
        ],
        "circle-color": [
          "interpolate",
          ["linear"],
          ["to-number", ["coalesce", ["get", "PREDICTED_COUNT"], 0]],
          0,
          "#b91c1c",
          1,
          "#ef4444",
          3,
          "#f97316",
          5,
          "#facc15",
          10,
          "#fde047",
        ],
        "circle-opacity": 0.82,
        "circle-stroke-color": "#7c2d12",
        "circle-stroke-width": 0.7,
      },
    });
  if (!map.getLayer(ML_RESULTS_LAYER_IDS.neighbor))
    map.addLayer({
      id: ML_RESULTS_LAYER_IDS.neighbor,
      type: "circle",
      source: "mlResultsPred",
      filter: [
        "==",
        ["to-number", ["coalesce", ["get", "NEIGHBOR_DATA_AVAILABLE_T"], 0]],
        1,
      ],
      layout: { visibility: "none" },
      paint: {
        "circle-radius": [
          "interpolate",
          ["linear"],
          ["zoom"],
          4,
          5,
          8,
          7,
          12,
          10,
        ],
        "circle-color": "rgba(0,0,0,0)",
        "circle-stroke-color": "#7c3aed",
        "circle-stroke-width": 2,
      },
    });
  applyMlResultsState();
}

function addMlResultsInteractions() {
  const ids = Object.values(ML_RESULTS_LAYER_IDS);
  map.on("click", (e) => {
    if (!isMlResultsSelected()) return;
    const active = ids.filter(
      (id) =>
        map.getLayer(id) && map.getLayoutProperty(id, "visibility") !== "none",
    );
    if (!active.length) return;
    const fs = map.queryRenderedFeatures(e.point, { layers: active });
    if (!fs.length) return;
    const p = fs[0].properties || {};
    const fmt = (v, d = 2) => {
      const n = Number(v);
      return Number.isFinite(n) ? n.toFixed(d) : "N/A";
    };
    const yesno = (v) =>
      Number(v) === 1 ? "Yes" : Number(v) === 0 ? "No" : "N/A";
    const html = `<div class="fish-popup-card"><div class="fish-popup-header"><div class="fish-popup-eyebrow">Rainbow Trout ML</div><h3 class="fish-popup-title">${p.MAP_DATASET || "Model result"}</h3></div><div class="fish-popup-body">
          <div class="fish-popup-section"><div class="fish-popup-section-title">Observation & prediction</div><div class="fish-popup-grid">
          <div class="fish-popup-label">Period</div><div class="fish-popup-value">${p.YEAR || "N/A"} · ${p.MONTH_NAME || p.MONTH || "N/A"}</div>
          <div class="fish-popup-label">Observed presence</div><div class="fish-popup-value">${yesno(p.OBSERVED_PRESENCE)}</div>
          <div class="fish-popup-label">Predicted presence</div><div class="fish-popup-value">${yesno(p.PREDICTED_PRESENCE)}</div>
          <div class="fish-popup-label">Presence probability</div><div class="fish-popup-value">${Number.isFinite(Number(p.PRESENCE_PROBABILITY)) ? (Number(p.PRESENCE_PROBABILITY) * 100).toFixed(1) + "%" : "N/A"}</div>
          <div class="fish-popup-label">Observed count</div><div class="fish-popup-value">${fmt(p.OBSERVED_COUNT, 0)}</div>
          <div class="fish-popup-label">Predicted count</div><div class="fish-popup-value">${fmt(p.PREDICTED_COUNT, 2)}</div>
          <div class="fish-popup-label">Absolute error</div><div class="fish-popup-value">${fmt(p.COUNT_ABSOLUTE_ERROR, 2)}</div></div></div>
          <div class="fish-popup-section"><div class="fish-popup-section-title">Neighbour information</div><div class="fish-popup-grid">
          <div class="fish-popup-label">Available</div><div class="fish-popup-value">${yesno(p.NEIGHBOR_DATA_AVAILABLE_T)}</div>
          <div class="fish-popup-label">Mean fish count</div><div class="fish-popup-value">${fmt(p.NEIGHBOR_FISH_MEAN_T, 2)}</div>
          <div class="fish-popup-label">Observed pixels</div><div class="fish-popup-value">${fmt(p.NEIGHBOR_OBSERVED_PIXELS_T, 0)}</div></div></div>
          <div class="fish-popup-section"><div class="fish-popup-section-title">Environment</div><div class="fish-popup-grid">
          <div class="fish-popup-label">Elevation</div><div class="fish-popup-value">${fmt(p.ELEVATION_M, 1)} m</div>
          <div class="fish-popup-label">Temperature</div><div class="fish-popup-value">${fmt(p.TEMPERATURE_C, 1)} °C</div>
          <div class="fish-popup-label">Precipitation</div><div class="fish-popup-value">${fmt(p.PRECIPITATION_MM_MONTH, 1)} mm/month</div>
          <div class="fish-popup-label">Wind</div><div class="fish-popup-value">${fmt(p.WIND_SPEED_MS, 2)} m/s</div>
          <div class="fish-popup-label">Humidity</div><div class="fish-popup-value">${fmt(p.RELATIVE_HUMIDITY_PERCENT, 1)}%</div></div></div>
          <div class="fish-popup-section"><div class="fish-popup-section-title">Models</div><div class="fish-popup-grid"><div class="fish-popup-label">Presence</div><div class="fish-popup-value">XGBoost + 5-step neighbour</div><div class="fish-popup-label">Count</div><div class="fish-popup-value">Extra Trees · without neighbour</div></div></div></div></div>`;
    if (activePopup) activePopup.remove();
    activePopup = new maplibregl.Popup({
      className: "fish-popup",
      maxWidth: "420px",
    })
      .setLngLat(e.lngLat)
      .setHTML(html)
      .addTo(map);
  });
  ids.forEach((id) => {
    map.on("mouseenter", id, () => {
      if (isMlResultsSelected()) map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", id, () => {
      map.getCanvas().style.cursor = "";
    });
  });
}

function bindMlResultsControls() {
  [
    mlResultsYear,
    mlResultsMonth,
    mlShowTrain,
    mlShowTest,
    mlShowPresence,
    mlShowCount,
    mlShowNeighbor,
  ].forEach((el) => {
    if (el)
      el.addEventListener("change", () => {
        applyMlResultsState();
        updatePointCounter();
      });
  });
}
