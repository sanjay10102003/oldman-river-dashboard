/**
 * Summary card counters.
 */

function updatePointCounter() {
  if (isElevationSelected()) {
    pointCount.textContent = "Tiles";
    return;
  }

  if (isRiverBinarySelected()) {
    summaryPrimaryLabel.textContent = "Raster Grid";
    summarySecondaryLabel.textContent = "Cell Size";
    pointCount.textContent = "Binary";
    summarySecondaryValue.textContent = "200 m";
    return;
  }

  if (isHistorySelected()) {
    summaryPrimaryLabel.textContent = "River Network";
    summarySecondaryLabel.textContent = "Time Period";
    summarySecondaryValue.textContent = getSelectedHistoryPeriodLabel();
    pointCount.textContent = "Alberta";
    return;
  }

  if (isMlResultsSelected()) {
    summaryPrimaryLabel.textContent = "Test Predictions";
    summarySecondaryLabel.textContent = "Training Rows";
    pointCount.textContent = "3,447";
    summarySecondaryValue.textContent = "12,214";
    return;
  }

  if (isFishSelected()) {
    // Use global precomputed statistics rather than rendered/loaded
    // vector-tile features, so the summary never changes with zoom/pan.
    const totalFish = getGlobalFilteredTotalFish();
    const recordCount = getGlobalFilteredFishCount();

    summaryPrimaryLabel.textContent = "Total Fish";
    summarySecondaryLabel.textContent = "Fish Records";

    pointCount.textContent =
      totalFish !== null ? Number(totalFish).toLocaleString() : "0";
    summarySecondaryValue.textContent =
      recordCount !== null ? Number(recordCount).toLocaleString() : "0";
    return;
  }

  if (isRiverSelected()) {
    summaryPrimaryLabel.textContent = "River Network";
    summarySecondaryLabel.textContent = "Coverage";
    pointCount.textContent = "Alberta";
    summarySecondaryValue.textContent = "Province-wide";
    return;
  }

  summaryPrimaryLabel.textContent = "Visible Layer";
  summarySecondaryLabel.textContent = "Selected Date";
  summarySecondaryValue.textContent = liveWeatherSelectedDate || "N/A";

  const selectedLayerKey = getSelectedLayerKey();
  const selectedVariableKey = environmentVariable.value;

  const selectedCount = environmentFeatures.filter(
    (feature) =>
      feature.properties.layerKey === selectedLayerKey &&
      feature.properties.variableKey === selectedVariableKey,
  ).length;

  pointCount.textContent = selectedCount.toLocaleString();
}
