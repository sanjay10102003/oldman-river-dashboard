/**
 * Daily environment layer: date controls, Open-Meteo requests and point styling.
 */

function isSelectedLiveDateHistorical() {
  const today = formatLocalDate(new Date());
  return liveWeatherSelectedDate < today;
}

function getLiveWeatherApiEndpoint() {
  return isSelectedLiveDateHistorical()
    ? "https://archive-api.open-meteo.com/v1/archive"
    : "https://api.open-meteo.com/v1/forecast";
}

function updateLiveWeatherPeriodBadge(dateValue = liveWeatherSelectedDate) {
  if (!dateValue) return;

  const selectedDate = new Date(`${dateValue}T12:00:00`);
  const today = formatLocalDate(new Date());

  const periodType =
    dateValue < today ? "Daily historical environment" : "Daily environment";

  liveWeatherPeriodBadge.textContent =
    `${periodType} · ` +
    new Intl.DateTimeFormat("en-CA", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(selectedDate);
}

function initialiseLiveWeatherDateControls() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const minimumDate = new Date(today);
  minimumDate.setFullYear(minimumDate.getFullYear() - 5);

  liveWeatherDate.min = formatLocalDate(minimumDate);
  liveWeatherDate.max = formatLocalDate(today);

  liveWeatherSelectedDate = formatLocalDate(now);
  liveWeatherDate.value = liveWeatherSelectedDate;

  updateLiveWeatherPeriodBadge();
}

function clearLiveLayerForTimeChange() {
  const layerKey = getSelectedLayerKey();
  if (!isLiveEnvironmentSelected()) return;

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

  selectedEnvironmentPointId = null;
  selectedEnvironmentPointIndex = -1;

  if (activePopup) {
    activePopup.remove();
    activePopup = null;
  }

  updateEnvironmentLayer();
  updatePointCounter();
}

function applySelectedLiveWeatherTime() {
  const selectedDate = liveWeatherDate.value;

  if (!selectedDate) {
    status.textContent = "Select a valid weather date.";
    return;
  }

  if (
    selectedDate < liveWeatherDate.min ||
    selectedDate > liveWeatherDate.max
  ) {
    status.textContent =
      `Choose a date between ${liveWeatherDate.min} and ` +
      `${liveWeatherDate.max}.`;
    return;
  }

  const periodChanged = selectedDate !== liveWeatherSelectedDate;

  liveWeatherSelectedDate = selectedDate;
  updateLiveWeatherPeriodBadge();

  if (periodChanged && isLiveEnvironmentSelected()) {
    clearLiveLayerForTimeChange();
  }

  const layer = getSelectedLayer();
  status.textContent =
    `${layer.label} is set to ${liveWeatherPeriodBadge.textContent}. ` +
    `Add points in the visible area or select a box.`;
}

function useCurrentLiveWeatherTime() {
  const now = new Date();
  liveWeatherDate.value = formatLocalDate(now);
  applySelectedLiveWeatherTime();
}

async function fetchWeatherForPoints(points, layerKey) {
  const variableKey = environmentVariable.value;
  const layer = WEATHER_LAYERS[variableKey];
  const newFeatures = [];
  const chunkSize = 50;

  for (let i = 0; i < points.length; i += chunkSize) {
    const chunk = points.slice(i, i + chunkSize);

    const latitudes = chunk.map((p) => p.lat).join(",");
    const longitudes = chunk.map((p) => p.lon).join(",");

    const weatherUrl =
      `${getLiveWeatherApiEndpoint()}` +
      `?latitude=${latitudes}` +
      `&longitude=${longitudes}` +
      `&hourly=${layer.apiName}` +
      `&start_date=${liveWeatherSelectedDate}` +
      `&end_date=${liveWeatherSelectedDate}` +
      `&timezone=America%2FEdmonton` +
      `&temperature_unit=celsius` +
      `&wind_speed_unit=kmh`;

    const response = await fetch(weatherUrl);

    if (response.status === 429) {
      status.textContent =
        "API rate limit reached. Please wait before adding more points.";
      alert("API rate limit reached. Please wait before adding more points.");
      break;
    }

    if (!response.ok) {
      console.error("API error:", response.status);
      status.textContent =
        `Weather API error: ${response.status}. Confirm that the selected ` +
        `date is within the previous five years through today.`;
      break;
    }

    const responseData = await response.json();
    const locationResults = Array.isArray(responseData)
      ? responseData
      : [responseData];

    chunk.forEach((point, index) => {
      const locationData = locationResults[index] || locationResults[0];
      const hourlyValues = locationData?.hourly?.[layer.apiName] || [];

      const validValues = hourlyValues
        .map(Number)
        .filter((value) => Number.isFinite(value));

      if (validValues.length === 0) return;

      let value;

      if (variableKey === "precipitation") {
        // Total precipitation for the selected day.
        value = validValues.reduce((sum, current) => sum + current, 0);
      } else {
        // Daily mean for temperature, wind, humidity, and pressure.
        value =
          validValues.reduce((sum, current) => sum + current, 0) /
          validValues.length;
      }

      usedPointKeys.add(getPointKey(point, layerKey));

      newFeatures.push({
        id: getPointKey(point, layerKey),
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [point.lon, point.lat],
        },
        properties: {
          pointId: getPointKey(point, layerKey),
          selected: false,
          layerKey,
          variableKey,
          layerLabel: layer.label,
          value: Number(value.toFixed(2)),
          unit: layer.unit,
          observationDate: liveWeatherSelectedDate,
          observationTimeLabel: liveWeatherPeriodBadge.textContent,
        },
      });
    });

    await new Promise((resolve) => setTimeout(resolve, 800));
  }

  return newFeatures;
}

function buildCircleColorExpression() {
  return [
    "match",
    ["get", "variableKey"],

    "temperature",
    [
      "interpolate",
      ["linear"],
      ["get", "value"],
      ...WEATHER_LAYERS.temperature.colorStops,
    ],

    "precipitation",
    [
      "interpolate",
      ["linear"],
      ["get", "value"],
      ...WEATHER_LAYERS.precipitation.colorStops,
    ],

    "wind",
    [
      "interpolate",
      ["linear"],
      ["get", "value"],
      ...WEATHER_LAYERS.wind.colorStops,
    ],

    "humidity",
    [
      "interpolate",
      ["linear"],
      ["get", "value"],
      ...WEATHER_LAYERS.humidity.colorStops,
    ],

    "pressure",
    [
      "interpolate",
      ["linear"],
      ["get", "value"],
      ...WEATHER_LAYERS.pressure.colorStops,
    ],

    "#64748b",
  ];
}

function updateEnvironmentLayer() {
  const selectedLayerKey = getSelectedLayerKey();
  const selectedVariableKey = environmentVariable.value;

  if (
    isRiverSelected() ||
    isElevationSelected() ||
    isRiverBinarySelected() ||
    isHistorySelected() ||
    isFishSelected()
  ) {
    if (map.getSource("environment-points")) {
      map.getSource("environment-points").setData({
        type: "FeatureCollection",
        features: [],
      });
    }
    return;
  }

  const visibleFeatures = environmentFeatures.filter(
    (feature) =>
      feature.properties.layerKey === selectedLayerKey &&
      feature.properties.variableKey === selectedVariableKey,
  );

  const data = {
    type: "FeatureCollection",
    features: visibleFeatures,
  };

  if (map.getSource("environment-points")) {
    map.getSource("environment-points").setData(data);
    return;
  }

  map.addSource("environment-points", {
    type: "geojson",
    data,
  });

  map.addLayer({
    id: "environment-circles",
    type: "circle",
    source: "environment-points",
    paint: {
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        5,
        2.5,
        8,
        3.5,
        10,
        4.5,
        12,
        6,
      ],
      "circle-color": [
        "case",
        ["==", ["get", "selected"], true],
        "#0f172a",
        buildCircleColorExpression(),
      ],
      "circle-opacity": 1,
      "circle-stroke-width": 0,
    },
  });

  addPointInteractions();
}

function bindLiveWeatherControls() {
  applyLiveTimeBtn.addEventListener("click", applySelectedLiveWeatherTime);

  useCurrentTimeBtn.addEventListener("click", useCurrentLiveWeatherTime);

  liveWeatherDate.addEventListener("change", () => {
    updateLiveWeatherPeriodBadge(liveWeatherDate.value);
  });
}
