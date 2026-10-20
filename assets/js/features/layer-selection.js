/**
 * Which layer / mode is selected, and the layer + river-mode select handlers.
 */

function isElevationSelected() {
  return (
    getSelectedLayerKey() === "environment" &&
    environmentVariable.value === "elevation"
  );
}

function isRiverBinarySelected() {
  return (
    getSelectedLayerKey() === "river" && riverDisplayMode.value === "binary"
  );
}

function isHistorySelected() {
  return (
    getSelectedLayerKey() === "environment" &&
    environmentVariable.value !== "elevation" &&
    environmentMode.value === "history"
  );
}

function isLiveEnvironmentSelected() {
  return (
    getSelectedLayerKey() === "environment" &&
    environmentVariable.value !== "elevation" &&
    environmentMode.value === "live"
  );
}

function isRiverSelected() {
  return (
    getSelectedLayerKey() === "river" && riverDisplayMode.value === "network"
  );
}

function isFishSelected() {
  return getSelectedLayerKey() === "fish";
}

function isMlResultsSelected() {
  return getSelectedLayerKey() === "mlResults";
}

function isLiveWeatherSelected() {
  return isLiveEnvironmentSelected();
}

function getSelectedLayerKey() {
  return layerSelect.value;
}

function getSelectedLayer() {
  if (isRiverSelected()) return RIVER_LAYER;
  if (isElevationSelected()) return ELEVATION_LAYER;
  if (isRiverBinarySelected()) return RIVER_BINARY_LAYER;
  if (isHistorySelected()) return HISTORY_LAYER;
  if (isFishSelected()) return FISH_LAYER;
  if (isMlResultsSelected()) return ML_RESULTS_LAYER;
  if (isLiveEnvironmentSelected()) {
    return WEATHER_LAYERS[environmentVariable.value];
  }
  return WEATHER_LAYERS.temperature;
}

function bindLayerSelectionControls() {
  riverDisplayMode.addEventListener("change", () => {
    clearSelectedPoint();
    selectedEnvironmentPointId = null;
    selectedEnvironmentPointIndex = -1;
    if (activePopup) {
      activePopup.remove();
      activePopup = null;
    }
    updateLayerVisibilityForSelection();
    updateLegend();
  });

  layerSelect.addEventListener("change", async () => {
    updateLegend();
    clearSelectedPoint();
    selectedEnvironmentPointId = null;
    selectedEnvironmentPointIndex = -1;
    if (activePopup) {
      activePopup.remove();
      activePopup = null;
    }
    updateLayerVisibilityForSelection();
    updateEnvironmentLayer();

    syncHistoryVariableWithEnvironmentVariable();

    if (isHistorySelected()) {
      await updateHistoryLayer();
    } else {
      await updateHistoryLayer();
      updatePointCounter();
    }

    const layer = getSelectedLayer();

    if (isRiverSelected()) {
      status.textContent =
        "Showing the Alberta river network. Repeated > symbols indicate stream-flow direction.";
    } else if (isFishSelected()) {
      await addFishLayer();
      await loadFishSpecies();

      updateFishSpeciesColors();
      updateLayerVisibilityForSelection();
      updateFishFilter();
      updateFishStatistics();
      updateLegend();

      status.textContent = getFishFilterStatusText();
    } else if (isMlResultsSelected()) {
      addMlResultsLayers();
      applyMlResultsState();
      status.textContent =
        "Showing final Rainbow Trout ML evaluation. Toggle Train, Test, Presence, Count and neighbour information independently.";
    } else if (isRiverBinarySelected()) {
      status.textContent =
        "Showing the 200 m × 200 m Alberta river binary raster. Cyan cells represent river pixels (1).";
    } else if (!isElevationSelected() && !isHistorySelected()) {
      status.textContent =
        `${layer.label} selected for ${liveWeatherPeriodBadge.textContent}. ` +
        `Only this environment variable is shown now.`;
    }
  });
}
