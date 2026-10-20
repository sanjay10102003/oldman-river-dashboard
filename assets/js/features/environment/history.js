/**
 * Historical monthly ERA5-Land environment layer.
 */

function getSelectedHistoryVariableConfig() {
  const config = HISTORY_VARIABLES[historySelectedVariable];

  if (
    historySelectedMonth === null &&
    historySelectedVariable === "precipitation_mm_month"
  ) {
    return {
      ...config,
      label: "Annual Precipitation",
      unit: "mm/year",
    };
  }

  return config;
}

function getSelectedHistoryPeriodLabel() {
  if (historySelectedMonth === null) {
    return String(historySelectedYear);
  }

  const option = Array.from(historyMonth.options).find(
    (item) => Number(item.value) === historySelectedMonth,
  );

  const monthName = option ? option.text : String(historySelectedMonth);
  return `${monthName} ${historySelectedYear}`;
}

function getActiveHistoryDisplayRange() {
  const config = HISTORY_VARIABLES[historySelectedVariable];

  if (historySelectedMonth !== null || activeHistoryValueLookup.size === 0) {
    return {
      min: Number(config.gradientMin),
      max: Number(config.gradientMax),
    };
  }

  const values = Array.from(activeHistoryValueLookup.values()).filter(
    Number.isFinite,
  );

  if (values.length === 0) {
    return {
      min: Number(config.gradientMin),
      max: Number(config.gradientMax),
    };
  }

  let min = Math.min(...values);
  let max = Math.max(...values);

  if (min === max) {
    min -= 1;
    max += 1;
  }

  return { min, max };
}

function getHistoryVariableFromEnvironmentVariable(variableKey) {
  const lookup = {
    temperature: "temperature_c",
    precipitation: "precipitation_mm_month",
    wind: "wind_speed_ms",
    humidity: "relative_humidity_percent",
    pressure: "surface_pressure_hpa",
  };

  return lookup[variableKey] || "temperature_c";
}

function syncHistoryVariableWithEnvironmentVariable() {
  historySelectedVariable = getHistoryVariableFromEnvironmentVariable(
    environmentVariable.value,
  );
}

async function loadHistoryCsv() {
  if (historyLoaded || historyIsLoading) return;

  historyIsLoading = true;
  status.textContent = "Loading monthly ERA5-Land climate values...";

  try {
    const response = await fetch(HISTORY_CSV_PATH);

    if (!response.ok) {
      throw new Error(`Could not load history CSV: ${response.status}`);
    }

    const text = await response.text();
    const lines = text.trim().split(/\r?\n/);
    const headers = parseCsvLine(lines[0]);
    const index = Object.fromEntries(
      headers.map((header, position) => [header, position]),
    );

    const requiredColumns = [
      "era5_grid_id",
      "latitude",
      "longitude",
      "year",
      "month",
      "temperature_c",
      "precipitation_mm_month",
      "wind_speed_ms",
      "relative_humidity_percent",
      "surface_pressure_hpa",
    ];

    const missingColumns = requiredColumns.filter(
      (column) => index[column] === undefined,
    );

    if (missingColumns.length > 0) {
      throw new Error(
        `Historical CSV is missing columns: ${missingColumns.join(", ")}`,
      );
    }

    historyRows = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i]) continue;
      const values = parseCsvLine(lines[i]);

      const row = {
        era5_grid_id: Number(values[index.era5_grid_id]),
        latitude: Number(values[index.latitude]),
        longitude: Number(values[index.longitude]),
        year: Number(values[index.year]),
        month: Number(values[index.month]),
        temperature_c: Number(values[index.temperature_c]),
        precipitation_mm_month: Number(values[index.precipitation_mm_month]),
        wind_speed_ms: Number(values[index.wind_speed_ms]),
        relative_humidity_percent: Number(
          values[index.relative_humidity_percent],
        ),
        surface_pressure_hpa: Number(values[index.surface_pressure_hpa]),
      };

      if (
        Number.isFinite(row.latitude) &&
        Number.isFinite(row.longitude) &&
        Number.isFinite(row.era5_grid_id)
      ) {
        historyRows.push(row);
      }
    }

    historyLoaded = true;
  } finally {
    historyIsLoading = false;
  }
}

function getHistoryColor(value) {
  if (historySelectedVariable === "temperature_c") {
    if (value <= -14.346) return "#b91c1c";
    if (value <= -6.382) return "#ef4444";
    if (value <= 2.898) return "#f97316";
    if (value <= 12.395) return "#f59e0b";
    return "#fde047";
  }

  if (historySelectedVariable === "precipitation_mm_month") {
    if (value <= 9.173) return "#b91c1c";
    if (value <= 18.671) return "#ef4444";
    if (value <= 29.571) return "#f97316";
    if (value <= 45.907) return "#f59e0b";
    return "#fde047";
  }

  if (historySelectedVariable === "wind_speed_ms") {
    if (value <= 0.304) return "#b91c1c";
    if (value <= 0.582) return "#ef4444";
    if (value <= 0.824) return "#f97316";
    if (value <= 1.103) return "#f59e0b";
    return "#fde047";
  }

  if (historySelectedVariable === "relative_humidity_percent") {
    if (value <= 54.11) return "#b91c1c";
    if (value <= 62.26) return "#ef4444";
    if (value <= 68.023) return "#f97316";
    if (value <= 73.264) return "#f59e0b";
    return "#fde047";
  }

  if (historySelectedVariable === "surface_pressure_hpa") {
    if (value <= 870.986) return "#b91c1c";
    if (value <= 918.997) return "#ef4444";
    if (value <= 933.519) return "#f97316";
    if (value <= 944.432) return "#f59e0b";
    return "#fde047";
  }

  return "#94a3b8";
}

function prepareActiveHistoryLookup() {
  activeHistoryValueLookup = new Map();
  activeHistoryColorLookup = new Map();

  // Monthly mode: use the selected month directly.
  if (historySelectedMonth !== null) {
    for (const row of historyRows) {
      if (
        row.year !== historySelectedYear ||
        row.month !== historySelectedMonth
      ) {
        continue;
      }

      const gridId = String(row.era5_grid_id);
      const value = Number(row[historySelectedVariable]);

      if (!Number.isFinite(value)) continue;
      activeHistoryValueLookup.set(gridId, value);
    }
  } else {
    // Year-only mode:
    // - precipitation is summed across the available months
    // - temperature, wind, humidity, and pressure are averaged
    const aggregates = new Map();

    for (const row of historyRows) {
      if (row.year !== historySelectedYear) continue;

      const gridId = String(row.era5_grid_id);
      const value = Number(row[historySelectedVariable]);
      if (!Number.isFinite(value)) continue;

      const current = aggregates.get(gridId) || { sum: 0, count: 0 };
      current.sum += value;
      current.count += 1;
      aggregates.set(gridId, current);
    }

    aggregates.forEach((aggregate, gridId) => {
      if (aggregate.count === 0) return;

      const value =
        historySelectedVariable === "precipitation_mm_month"
          ? aggregate.sum
          : aggregate.sum / aggregate.count;

      activeHistoryValueLookup.set(gridId, value);
    });
  }

  console.log(
    "Historical ERA5 cells loaded:",
    activeHistoryValueLookup.size,
    "period:",
    getSelectedHistoryPeriodLabel(),
  );
}

function buildHistoryValueExpression() {
  const expression = ["match", ["to-string", ["get", "era5_grid_id"]]];

  activeHistoryValueLookup.forEach((value, gridId) => {
    expression.push(gridId, value);
  });

  // Fallback numeric value for unexpected/missing cells.
  expression.push(0);
  return expression;
}

function buildSensitiveGradientExpression(valueExpression, minValue, maxValue) {
  const colors = [
    "#7f1d1d",
    "#991b1b",
    "#b91c1c",
    "#dc2626",
    "#ef4444",
    "#f97316",
    "#fb923c",
    "#f59e0b",
    "#facc15",
    "#fde047",
  ];

  const expression = ["interpolate", ["linear"], valueExpression];

  const steps = colors.length - 1;

  colors.forEach((color, index) => {
    const value = minValue + ((maxValue - minValue) * index) / steps;
    expression.push(value, color);
  });

  return expression;
}

function buildHistoryColorExpression() {
  const valueExpression = buildHistoryValueExpression();

  if (historySelectedMonth === null) {
    const range = getActiveHistoryDisplayRange();
    return buildSensitiveGradientExpression(
      valueExpression,
      range.min,
      range.max,
    );
  }

  // More colour stops are used than before so even relatively small
  // changes in the underlying value produce a more noticeable colour
  // difference on the river network.
  if (historySelectedVariable === "temperature_c") {
    return buildSensitiveGradientExpression(valueExpression, -27.1, 24.9);
  }

  if (historySelectedVariable === "precipitation_mm_month") {
    return buildSensitiveGradientExpression(valueExpression, 0.9, 246.5);
  }

  if (historySelectedVariable === "wind_speed_ms") {
    return buildSensitiveGradientExpression(valueExpression, 0, 4.5);
  }

  if (historySelectedVariable === "relative_humidity_percent") {
    return buildSensitiveGradientExpression(valueExpression, 34.7, 91.7);
  }

  if (historySelectedVariable === "surface_pressure_hpa") {
    return buildSensitiveGradientExpression(valueExpression, 739, 999);
  }

  return "#94a3b8";
}

function getHistoryShardPart(shardNumber) {
  return String(shardNumber).padStart(2, "0");
}

function getHistoryShardSourceId(shardNumber) {
  return `historical-stream-source-${getHistoryShardPart(shardNumber)}`;
}

function getHistoryShardLayerId(shardNumber) {
  return `history-stream-lines-${getHistoryShardPart(shardNumber)}`;
}

function getHistoryShardUrl(shardNumber) {
  const part = getHistoryShardPart(shardNumber);

  return (
    `pmtiles://${HISTORY_STREAM_SHARD_DIRECTORY}/` +
    `historical_stream_segments_part_${part}.pmtiles`
  );
}

function addHistoryLayers() {
  for (
    let shardNumber = 1;
    shardNumber <= HISTORY_STREAM_SHARD_COUNT;
    shardNumber++
  ) {
    const sourceId = getHistoryShardSourceId(shardNumber);
    const layerId = getHistoryShardLayerId(shardNumber);

    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: "vector",
        url: getHistoryShardUrl(shardNumber),
        promoteId: "segment_id",
      });
    }

    if (!map.getLayer(layerId)) {
      map.addLayer({
        id: layerId,
        type: "line",
        source: sourceId,
        "source-layer": HISTORY_STREAM_SOURCE_LAYER,
        minzoom: 5,
        layout: {
          visibility: "none",
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-color": "#94a3b8",
          "line-opacity": 0.95,
          "line-width": [
            "interpolate",
            ["linear"],
            ["zoom"],
            5,
            0.6,
            8,
            1.0,
            10,
            1.5,
            12,
            2.2,
            13,
            2.6,
          ],
        },
      });

      HISTORY_STREAM_LAYER_IDS.push(layerId);
    }
  }

  addHistoryInteractions();
}

function setHistoryLayersVisibility(visible) {
  const visibility = visible ? "visible" : "none";

  HISTORY_STREAM_LAYER_IDS.forEach((layerId) => {
    if (map.getLayer(layerId)) {
      map.setLayoutProperty(layerId, "visibility", visibility);
    }
  });
}

async function updateHistoryLayer() {
  if (HISTORY_STREAM_LAYER_IDS.length === 0) return;

  if (!isHistorySelected()) {
    setHistoryLayersVisibility(false);
    updatePointCounter();
    return;
  }

  try {
    await loadHistoryCsv();
    prepareActiveHistoryLookup();

    if (activeHistoryValueLookup.size === 0) {
      throw new Error(
        "No historical values were found for the selected period.",
      );
    }

    const colorExpression = buildHistoryColorExpression();

    HISTORY_STREAM_LAYER_IDS.forEach((layerId) => {
      if (!map.getLayer(layerId)) return;

      map.setPaintProperty(layerId, "line-color", colorExpression);
      map.setPaintProperty(layerId, "line-opacity", 0.95);
      map.setPaintProperty(layerId, "line-width", [
        "interpolate",
        ["linear"],
        ["zoom"],
        5,
        0.6,
        8,
        1.0,
        10,
        1.5,
        12,
        2.2,
        13,
        2.6,
      ]);
      map.setLayoutProperty(layerId, "visibility", "visible");
    });

    updatePointCounter();

    status.textContent =
      `Showing ${getSelectedHistoryVariableConfig().label} directly on ` +
      `the Alberta river network for ${getSelectedHistoryPeriodLabel()}.`;
  } catch (error) {
    console.error(error);
    setHistoryLayersVisibility(false);
    status.textContent =
      "Could not load historical river data. Check the climate CSV and all six historical PMTiles shard paths.";
  }
}

function showHistoryPopup(e) {
  if (!isHistorySelected() || !e.features?.length) return;

  const feature = e.features[0];
  const props = feature.properties || {};
  const gridId = String(props.era5_grid_id);
  const value = activeHistoryValueLookup.get(gridId);
  const config = getSelectedHistoryVariableConfig();
  const periodLabel = getSelectedHistoryPeriodLabel();

  if (activePopup) activePopup.remove();

  activePopup = new maplibregl.Popup()
    .setLngLat(e.lngLat)
    .setHTML(
      `
                  <div style="font-family: Arial; min-width: 240px;">
                    <h3 style="margin:0 0 8px;">Historical River Environment</h3>
                    <strong>Period:</strong> ${periodLabel}<br>
                    <strong>${config.label}:</strong>
                    ${Number.isFinite(value) ? value.toFixed(2) : "N/A"} ${config.unit}<br>
                    <strong>ERA5 grid ID:</strong> ${escapeHtml(gridId)}<br>
                    <strong>Latitude:</strong> ${e.lngLat.lat.toFixed(5)}<br>
                    <strong>Longitude:</strong> ${e.lngLat.lng.toFixed(5)}<br>
                  </div>
                  `,
    )
    .addTo(map);
}

function addHistoryInteractions() {
  if (historyInteractionsAdded) return;
  historyInteractionsAdded = true;

  HISTORY_STREAM_LAYER_IDS.forEach((layerId) => {
    map.on("click", layerId, showHistoryPopup);

    map.on("mouseenter", layerId, () => {
      if (!isSelectionMode) {
        map.getCanvas().style.cursor = "pointer";
      }
    });

    map.on("mouseleave", layerId, () => {
      if (!isSelectionMode) {
        map.getCanvas().style.cursor = "";
      }
    });
  });
}

function bindHistoryControls() {
  historyYear.addEventListener("change", async (e) => {
    historySelectedYear = Number(e.target.value);
    await updateHistoryLayer();
  });

  historyMonth.addEventListener("change", async (e) => {
    historySelectedMonth =
      e.target.value === "" ? null : Number(e.target.value);
    await updateHistoryLayer();
  });

  if (historyVariable) {
    historyVariable.addEventListener("change", async (e) => {
      historySelectedVariable = e.target.value;
      updateLegend();
      await updateHistoryLayer();
    });
  }
}
