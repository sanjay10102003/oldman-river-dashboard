/**
 * Shows / hides map layers and sidebar cards for the current selection.
 */

function updateLayerVisibilityForSelection() {
  const showRiver = isRiverSelected();
  const showElevation = isElevationSelected();
  const showRiverBinary = isRiverBinarySelected();
  const showHistory = isHistorySelected();
  const showFish = isFishSelected();
  const showMlResults = isMlResultsSelected();

  if (summaryCard) {
    summaryCard.style.display = showElevation ? "none" : "block";
  }

  if (addDataCard) {
    addDataCard.style.display =
      showRiver ||
      showElevation ||
      showRiverBinary ||
      showHistory ||
      showFish ||
      showMlResults
        ? "none"
        : "block";
  }

  if (historyControlCard) {
    historyControlCard.style.display = "none";
  }

  if (riverControlCard) {
    riverControlCard.style.display =
      getSelectedLayerKey() === "river" ? "block" : "none";
  }

  if (liveWeatherControlCard) {
    liveWeatherControlCard.style.display =
      getSelectedLayerKey() === "environment" ? "block" : "none";
  }

  if (liveEnvironmentControls) {
    liveEnvironmentControls.style.display = showHistory ? "none" : "block";
  }

  if (historicalEnvironmentControls) {
    historicalEnvironmentControls.style.display = showHistory
      ? "block"
      : "none";
  }

  if (fishControlCard) {
    fishControlCard.style.display = showFish ? "block" : "none";
  }
  if (mlResultsControlCard) {
    mlResultsControlCard.style.display = showMlResults ? "block" : "none";
  }

  if (elevationInfoCard) {
    elevationInfoCard.style.display = showElevation ? "block" : "none";
  }

  if (map.getLayer("elevation-tiles-layer")) {
    map.setLayoutProperty(
      "elevation-tiles-layer",
      "visibility",
      showElevation ? "visible" : "none",
    );
  }

  if (map.getLayer("river-binary-layer")) {
    map.setLayoutProperty(
      "river-binary-layer",
      "visibility",
      showRiverBinary ? "visible" : "none",
    );
  }

  // Blue stream network should stay visible for all layers,
  // including Elevation Tiles, so the arrows have visible river lines behind them.
  if (map.getLayer("streams-line")) {
    // Historical Environment uses its own coloured river layers.
    map.setLayoutProperty(
      "streams-line",
      "visibility",
      showHistory || showRiverBinary ? "none" : "visible",
    );

    map.setPaintProperty(
      "streams-line",
      "line-color",
      showElevation ? "#ef4444" : "#087ea4",
    );

    map.setPaintProperty("streams-line", "line-opacity", 0.95);

    map.setPaintProperty("streams-line", "line-width", [
      "interpolate",
      ["linear"],
      ["zoom"],
      5,
      0.7,
      8,
      1.1,
      10,
      1.7,
      12,
      2.5,
    ]);
  }

  if (map.getLayer("streams-points")) {
    // Hide original blue stream point markers. The weather points use the
    // same stream geometry, so this avoids a second dot/overlay effect.
    map.setLayoutProperty("streams-points", "visibility", "none");
  }

  applyMlResultsState();

  // Hide the default blue flow lines and arrowheads for Historical Environment.
  // Weather layers use blue flow lines; Elevation uses red flow lines.
  if (map.getLayer("directed-arrow-lines")) {
    // Legacy directional line overlay hidden. Chevron symbols now show
    // the river direction as a repeated >>>>>> pattern.
    map.setLayoutProperty("directed-arrow-lines", "visibility", "none");
  }

  if (map.getLayer("directed-arrowheads")) {
    // Hide the previous arrowhead geometry so it does not create
    // star-shaped intersections.
    map.setLayoutProperty("directed-arrowheads", "visibility", "none");
  }

  if (map.getLayer("river-chevron-arrows")) {
    // Show flow chevrons for Daily Environment, Historical Environment,
    // Fish Distribution, and Elevation.
    map.setLayoutProperty(
      "river-chevron-arrows",
      "visibility",
      showMlResults || showRiverBinary ? "none" : "visible",
    );

    const darkBasemap = false;

    map.setPaintProperty(
      "river-chevron-arrows",
      "text-color",
      darkBasemap
        ? "#f8fafc"
        : showHistory || showElevation
          ? "#111827"
          : "#0f2233",
    );

    map.setPaintProperty(
      "river-chevron-arrows",
      "text-halo-color",
      darkBasemap ? "rgba(15,23,42,0.9)" : "rgba(255,255,255,0.92)",
    );
  }

  setHistoryLayersVisibility(showHistory);

  FISH_LAYER_IDS.forEach((layerId) => {
    if (map.getLayer(layerId)) {
      map.setLayoutProperty(
        layerId,
        "visibility",
        showFish ? "visible" : "none",
      );
    }
  });

  if (!isFetching) {
    addVisibleBtn.disabled =
      showRiver ||
      showElevation ||
      showRiverBinary ||
      showHistory ||
      showFish ||
      showMlResults;
    selectAreaBtn.disabled =
      showRiver ||
      showElevation ||
      showRiverBinary ||
      showHistory ||
      showFish ||
      showMlResults;
    clearLayerBtn.disabled =
      showRiver ||
      showElevation ||
      showRiverBinary ||
      showHistory ||
      showFish ||
      showMlResults;
  }

  if (showRiver) {
    status.textContent =
      "Showing the Alberta river network. Repeated > symbols indicate stream-flow direction.";
  } else if (showRiverBinary) {
    status.textContent =
      "Showing the 200 m × 200 m Alberta river binary raster. Cyan cells represent river pixels (1); transparent cells represent non-river pixels (0).";
  } else if (showHistory) {
    status.textContent =
      "Historical environment selected. Climate values are shown directly on the river network.";
  } else if (showFish) {
    status.textContent = getFishFilterStatusText();
  } else if (showMlResults) {
    status.textContent =
      "Showing final Rainbow Trout ML evaluation: training observations, held-out test observations, presence probability, predicted count and optional neighbour information.";
  } else if (showElevation) {
    status.textContent =
      "Click a red stream segment to view elevation details.";
  } else {
    status.textContent =
      `${getSelectedLayer().label} selected for ` +
      `${liveWeatherPeriodBadge.textContent}. Blue arrows show stream-flow direction.`;
  }
}
