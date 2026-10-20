/**
 * Environment sample points: adding, selecting, popups and clearing.
 */

function getPointKey(point, layerKey) {
  const variableKey =
    layerKey === "environment" ? environmentVariable.value : layerKey;

  return `${layerKey}:${variableKey}:${point.lon.toFixed(5)},${point.lat.toFixed(5)}`;
}

function randomSample(array, count) {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy.slice(0, count);
}

function getVisibleBoundsObject() {
  const bounds = map.getBounds();

  return {
    west: bounds.getWest(),
    east: bounds.getEast(),
    south: bounds.getSouth(),
    north: bounds.getNorth(),
  };
}

function getUnusedPointsInsideBounds(bounds, layerKey) {
  const canvas = map.getCanvas();

  // Use the stream geometry that is actually rendered on the map.
  // This keeps the weather points aligned with the visible blue stream lines.
  const renderedFeatures = map.queryRenderedFeatures(
    [
      [0, 0],
      [canvas.width, canvas.height],
    ],
    { layers: ["streams-line"] },
  );

  const points = [];
  const seen = new Set();

  renderedFeatures.forEach((feature) => {
    const geometry = feature.geometry;
    if (!geometry) return;

    let lines = [];

    if (geometry.type === "LineString") {
      lines = [geometry.coordinates];
    }

    if (geometry.type === "MultiLineString") {
      lines = geometry.coordinates;
    }

    lines.forEach((line) => {
      line.forEach((coord) => {
        const lon = coord[0];
        const lat = coord[1];

        if (
          lon < bounds.west ||
          lon > bounds.east ||
          lat < bounds.south ||
          lat > bounds.north
        ) {
          return;
        }

        const point = { lon, lat };
        const key = getPointKey(point, layerKey);

        if (usedPointKeys.has(key)) return;

        const seenKey = `${lon.toFixed(6)},${lat.toFixed(6)}`;
        if (seen.has(seenKey)) return;

        seen.add(seenKey);
        points.push(point);
      });
    });
  });

  return points;
}

async function readStreamCoordinates() {
  status.textContent = "Reading stream coordinates...";

  const geojsonResponse = await fetch("data/alberta_stream_branches.geojson");
  const geojson = await geojsonResponse.json();

  let coords = [];

  geojson.features.forEach((feature) => {
    const geometry = feature.geometry;
    if (!geometry) return;

    if (geometry.type === "LineString") {
      coords.push(...geometry.coordinates);
    }

    if (geometry.type === "MultiLineString") {
      geometry.coordinates.forEach((line) => {
        coords.push(...line);
      });
    }
  });

  const unique = [];
  const seen = new Set();

  coords.forEach((coord) => {
    const lon = coord[0];
    const lat = coord[1];

    if (!lon || !lat) return;

    const key = `${lon.toFixed(5)},${lat.toFixed(5)}`;

    if (!seen.has(key)) {
      seen.add(key);
      unique.push({ lon, lat });
    }
  });

  allStreamPoints = unique;
}

async function addPointsFromBounds(bounds, label) {
  if (isFetching) return;

  const layerKey = getSelectedLayerKey();
  const layer = getSelectedLayer();

  const currentLayerCount = environmentFeatures.filter(
    (feature) => feature.properties.layerKey === layerKey,
  ).length;

  if (currentLayerCount >= MAX_POINTS_PER_LAYER) {
    status.textContent = `Maximum reached for ${layer.label}. Please click "Clear Selected Layer" before adding more points.`;
    alert(
      `Maximum of ${MAX_POINTS_PER_LAYER} points reached for ${layer.label}. Please click "Clear Selected Layer" to add again.`,
    );
    return;
  }

  const remainingSlots = MAX_POINTS_PER_LAYER - currentLayerCount;
  const pointsAllowed = Math.min(POINTS_PER_ACTION, remainingSlots);

  const unusedPoints = getUnusedPointsInsideBounds(bounds, layerKey);

  if (unusedPoints.length === 0) {
    status.textContent = `No new unused ${layer.label} points found in ${label}.`;
    return;
  }

  const pointsToAdd = randomSample(
    unusedPoints,
    Math.min(pointsAllowed, unusedPoints.length),
  );

  isFetching = true;
  setButtonsDisabled(true);

  try {
    status.textContent = `Adding ${pointsToAdd.length} ${layer.label} points from ${label}...`;

    const newFeatures = await fetchWeatherForPoints(pointsToAdd, layerKey);

    environmentFeatures.push(...newFeatures);
    updateEnvironmentLayer();
    updatePointCounter();

    const updatedCount = currentLayerCount + newFeatures.length;

    if (updatedCount >= MAX_POINTS_PER_LAYER) {
      status.textContent = `Added ${newFeatures.length} ${layer.label} points. Maximum reached. Click "Clear Selected Layer" to add again.`;
      alert(
        `Maximum of ${MAX_POINTS_PER_LAYER} points reached for ${layer.label}. Click "Clear Selected Layer" to add again.`,
      );
    } else {
      status.textContent = `Added ${newFeatures.length} ${layer.label} points. Visible layer total: ${updatedCount}/${MAX_POINTS_PER_LAYER}`;
    }
  } catch (error) {
    console.error(error);
    status.textContent = "Error adding environmental points.";
  } finally {
    isFetching = false;
    setButtonsDisabled(false);
  }
}

function setButtonsDisabled(disabled) {
  const forceDisabled =
    disabled ||
    isRiverSelected() ||
    isElevationSelected() ||
    isRiverBinarySelected() ||
    isHistorySelected() ||
    isFishSelected();

  addVisibleBtn.disabled = forceDisabled;
  selectAreaBtn.disabled = forceDisabled;
  clearLayerBtn.disabled = forceDisabled;
}

function getOrderedLayerFeatures() {
  const layerKey = getSelectedLayerKey();
  const selectedVariableKey = environmentVariable.value;

  // Use the saved GeoJSON order, not MapLibre's rendered feature order.
  // This makes keyboard navigation predictable:
  // Right = next, Left = exact previous point.
  return environmentFeatures.filter(
    (feature) =>
      feature.properties.layerKey === layerKey &&
      feature.properties.variableKey === selectedVariableKey,
  );
}

function refreshEnvironmentSource() {
  const selectedLayerKey = getSelectedLayerKey();
  const selectedVariableKey = environmentVariable.value;
  const visibleFeatures = environmentFeatures.filter(
    (feature) =>
      feature.properties.layerKey === selectedLayerKey &&
      feature.properties.variableKey === selectedVariableKey,
  );

  if (map.getSource("environment-points")) {
    map.getSource("environment-points").setData({
      type: "FeatureCollection",
      features: visibleFeatures,
    });
  }
}

function clearSelectedPoint() {
  if (selectedEnvironmentPointId === null) return;

  environmentFeatures.forEach((feature) => {
    if (feature.properties.pointId === selectedEnvironmentPointId) {
      feature.properties.selected = false;
    }
  });

  refreshEnvironmentSource();
  selectedEnvironmentPointId = null;
}

function openPointPopup(feature) {
  const coordinates = feature.geometry.coordinates.slice();
  const props = feature.properties;

  if (activePopup) {
    activePopup.remove();
  }

  activePopup = new maplibregl.Popup()
    .setLngLat(coordinates)
    .setHTML(
      `
                  <div style="font-family: Arial; min-width: 210px;">
                    <h3 style="margin:0 0 8px;">${props.layerLabel} Point</h3>
                    <strong>${props.layerLabel}:</strong> ${props.value} ${props.unit}<br>
                    <strong>Date:</strong> ${escapeHtml(
                      props.observationTimeLabel ||
                        props.observationDate ||
                        "N/A",
                    )}<br>
                    <strong>Latitude:</strong> ${coordinates[1].toFixed(5)}<br>
                    <strong>Longitude:</strong> ${coordinates[0].toFixed(5)}<br>
                  </div>
                  `,
    )
    .addTo(map);
}

function selectEnvironmentPointById(pointId, shouldFly = false) {
  if (!pointId) return;

  const orderedFeatures = getOrderedLayerFeatures();
  const index = orderedFeatures.findIndex(
    (feature) => feature.properties.pointId === pointId,
  );

  if (index === -1) return;

  selectedEnvironmentPointIndex = index;
  selectedEnvironmentPointId = pointId;

  environmentFeatures.forEach((feature) => {
    feature.properties.selected = feature.properties.pointId === pointId;
  });

  refreshEnvironmentSource();

  const selectedFeature = orderedFeatures[index];
  const coordinates = selectedFeature.geometry.coordinates.slice();

  if (shouldFly) {
    map.easeTo({
      center: coordinates,
      duration: 350,
    });
  }

  openPointPopup(selectedFeature);
}

function selectPointFromClick(e) {
  if (!map.getLayer("environment-circles")) return;

  // Larger invisible hit area, while keeping the visible dot small.
  const features = map.queryRenderedFeatures(
    [
      [e.point.x - 10, e.point.y - 10],
      [e.point.x + 10, e.point.y + 10],
    ],
    { layers: ["environment-circles"] },
  );

  if (!features.length) return;

  const clickedPointId = features[0].properties.pointId || features[0].id;
  selectEnvironmentPointById(clickedPointId, false);
}

function movePointSelection(direction) {
  if (isElevationSelected() || isRiverBinarySelected()) return;
  if (!map.getLayer("environment-circles")) return;

  const orderedFeatures = getOrderedLayerFeatures();
  if (!orderedFeatures.length) return;

  if (selectedEnvironmentPointIndex < 0) {
    selectedEnvironmentPointIndex =
      direction > 0 ? 0 : orderedFeatures.length - 1;
  } else {
    selectedEnvironmentPointIndex =
      (selectedEnvironmentPointIndex + direction + orderedFeatures.length) %
      orderedFeatures.length;
  }

  const selectedFeature = orderedFeatures[selectedEnvironmentPointIndex];
  selectEnvironmentPointById(selectedFeature.properties.pointId, true);
}

function addPointInteractions() {
  if (pointInteractionsAdded) return;
  pointInteractionsAdded = true;

  map.on("click", selectPointFromClick);

  map.on("mouseenter", "environment-circles", () => {
    if (!isSelectionMode) {
      map.getCanvas().style.cursor = "pointer";
    }
  });

  map.on("mouseleave", "environment-circles", () => {
    if (!isSelectionMode) {
      map.getCanvas().style.cursor = "";
    }
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      movePointSelection(1);
    }

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      movePointSelection(-1);
    }
  });
}

function clearSelectedLayer() {
  const layerKey = getSelectedLayerKey();
  const layer = getSelectedLayer();
  const selectedVariableKey = environmentVariable.value;

  environmentFeatures = environmentFeatures.filter(
    (feature) =>
      !(
        feature.properties.layerKey === layerKey &&
        feature.properties.variableKey === selectedVariableKey
      ),
  );

  usedPointKeys = new Set(
    [...usedPointKeys].filter(
      (key) => !key.startsWith(`${layerKey}:${selectedVariableKey}:`),
    ),
  );

  clearSelectedPoint();
  selectedEnvironmentPointId = null;
  selectedEnvironmentPointIndex = -1;
  if (activePopup) {
    activePopup.remove();
    activePopup = null;
  }

  updateEnvironmentLayer();
  updatePointCounter();

  status.textContent = `Cleared ${layer.label} points.`;
}

function bindAddDataControls() {
  addVisibleBtn.addEventListener("click", () => {
    addPointsFromBounds(getVisibleBoundsObject(), "the visible map area");
  });

  selectAreaBtn.addEventListener("click", enableSelectionMode);

  cancelSelectBtn.addEventListener("click", () => {
    disableSelectionMode();
    status.textContent = "Selection cancelled.";
  });

  clearLayerBtn.addEventListener("click", clearSelectedLayer);
}
