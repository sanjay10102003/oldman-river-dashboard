/**
 * Application entry point: wires up UI events and starts the map.
 * Loaded last, after every other script (see index.html).
 */

bindAddDataControls();
bindHistoryControls();
bindLiveWeatherControls();
bindFishSpeciesSelector();
bindFishTimelineControls();
bindFishFilterControls();
bindEnvironmentControls();
bindMlResultsControls();
bindPanelToggles();
bindLayerSelectionControls();
bindSelectionBoxEvents();

map.on("idle", () => {
  if (isFishSelected() && (selectedFishYear || selectedFishMonth)) {
    updateLoadedFilteredFishRecordCount();
  }
});

map.on("load", async () => {
  try {
    initialiseLiveWeatherDateControls();
    initialiseFishYearFilter();
    syncHistoryVariableWithEnvironmentVariable();
    updateLegend();
    updateBasemap();

    status.textContent = "Map loaded. Preparing stream layers...";

    addDirectedEdgeInteractions();
    addMlResultsLayers();
    addMlResultsInteractions();
    addHistoryLayers();
    await addFishLayer();

    addElevationInteractions();
    updateLayerVisibilityForSelection();
    updateEnvironmentLayer();
    updatePointCounter();

    status.textContent = "Ready.";

    setButtonsDisabled(false);
  } catch (error) {
    console.error(error);
    status.textContent = "Error loading map data.";
  }
});
