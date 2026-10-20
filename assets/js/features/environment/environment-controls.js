/**
 * Environment data-type and variable select handlers.
 */

function bindEnvironmentControls() {
  environmentMode.addEventListener("change", async () => {
    syncHistoryVariableWithEnvironmentVariable();
    updateLegend();
    updateLayerVisibilityForSelection();
    updateEnvironmentLayer();

    if (isHistorySelected()) {
      await updateHistoryLayer();
    } else {
      await updateHistoryLayer();
      updatePointCounter();
      status.textContent = `${getSelectedLayer().label} selected for ${liveWeatherPeriodBadge.textContent}.`;
    }
  });

  environmentVariable.addEventListener("change", async () => {
    syncHistoryVariableWithEnvironmentVariable();
    updateLegend();
    updateLayerVisibilityForSelection();
    updateEnvironmentLayer();
    updatePointCounter();

    if (isHistorySelected()) {
      await updateHistoryLayer();
    } else {
      status.textContent = `${getSelectedLayer().label} selected for ${liveWeatherPeriodBadge.textContent}.`;
    }
  });
}
