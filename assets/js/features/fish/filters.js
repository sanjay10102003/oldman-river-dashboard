/**
 * Fish year / month / species filters.
 */

function initialiseFishYearFilter() {
  if (!fishYearSelect) return;

  const currentYear = new Date().getFullYear();
  const earliestYear = 1900;

  fishYearSelect.innerHTML = '<option value="">All years</option>';

  for (let year = currentYear; year >= earliestYear; year--) {
    const option = document.createElement("option");
    option.value = String(year);
    option.textContent = String(year);
    fishYearSelect.appendChild(option);
  }

  fishYearSelect.value = selectedFishYear;
}

function asFishNumber(value) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function fishFeatureMatchesCurrentFilter(feature) {
  const properties = feature?.properties || {};

  if (selectedFishSpecies) {
    const selectedSpeciesId = fishSpeciesIdByName.get(selectedFishSpecies);
    if (
      !Number.isFinite(selectedSpeciesId) ||
      Number(properties[FISH_SPECIES_FIELD]) !== selectedSpeciesId
    ) {
      return false;
    }
  }

  const featureYear = asFishNumber(properties[FISH_YEAR_FIELD]);
  const featureMonth = asFishNumber(properties[FISH_MONTH_FIELD]);

  if (selectedFishYear && featureYear !== Number(selectedFishYear)) {
    return false;
  }

  if (selectedFishMonth && featureMonth !== Number(selectedFishMonth)) {
    return false;
  }

  return true;
}

function updateLoadedFilteredFishRecordCount() {
  if (!isFishSelected() || !map.getSource("fishOccurrences")) {
    return;
  }

  // Prefer the optimized global statistics whenever the current
  // species/year/month combination is available. This keeps the summary
  // independent of the current map zoom and viewport.
  if (getGlobalFilteredFishCount() !== null) {
    loadedFilteredFishRecordCount = null;
    updatePointCounter();
    return;
  }

  // Fallback for a stats schema/combination that is not available.
  if (!selectedFishYear && !selectedFishMonth) {
    loadedFilteredFishRecordCount = null;
    updatePointCounter();
    return;
  }

  const features = map.querySourceFeatures("fishOccurrences", {
    sourceLayer: FISH_SOURCE_LAYER,
  });

  const seen = new Set();
  let count = 0;

  features.forEach((feature, index) => {
    if (!fishFeatureMatchesCurrentFilter(feature)) return;

    const properties = feature.properties || {};
    const coords = feature.geometry?.coordinates || [];
    const key = [
      properties.INV_SURVEY_ID ?? "",
      properties.INV_PROJ_ID ?? "",
      properties[FISH_SPECIES_CODE_FIELD] ?? "",
      properties[FISH_SPECIES_FIELD] ?? "",
      properties[FISH_DATE_FIELD] ?? "",
      properties[FISH_COUNT_FIELD] ?? "",
      Array.isArray(coords) ? coords.join(",") : "",
      index,
    ].join("|");

    if (seen.has(String(key))) return;

    seen.add(String(key));
    count += 1;
  });

  loadedFilteredFishRecordCount = count;
  updatePointCounter();
}

function buildFishDateFilterExpression() {
  const filters = [];

  if (selectedFishYear) {
    filters.push([
      "==",
      ["to-number", ["get", FISH_YEAR_FIELD], -1],
      Number(selectedFishYear),
    ]);
  }

  if (selectedFishMonth) {
    filters.push([
      "==",
      ["to-number", ["get", FISH_MONTH_FIELD], -1],
      Number(selectedFishMonth),
    ]);
  }

  if (filters.length === 0) return null;
  if (filters.length === 1) return filters[0];
  return ["all", ...filters];
}

function buildFishSpeciesFilterExpression() {
  if (!selectedFishSpecies) return null;
  const speciesId = fishSpeciesIdByName.get(selectedFishSpecies);
  if (!Number.isFinite(speciesId)) return ["==", 1, 0];

  return ["==", ["to-number", ["get", FISH_SPECIES_FIELD], -1], speciesId];
}

function combineMapLibreFilters(filters) {
  const activeFilters = filters.filter(Boolean);

  if (activeFilters.length === 0) return null;
  if (activeFilters.length === 1) return activeFilters[0];
  return ["all", ...activeFilters];
}

function updateFishFilter() {
  const dateFilter = buildFishDateFilterExpression();
  const speciesFilter = buildFishSpeciesFilterExpression();

  const captureFilter = combineMapLibreFilters([
    [">", ["to-number", ["get", FISH_COUNT_FIELD], 0], 0],
    speciesFilter,
    dateFilter,
  ]);

  const zeroFilter = selectedFishSpecies
    ? ["==", 1, 0]
    : combineMapLibreFilters([
        ["==", ["to-number", ["get", FISH_RECORD_TYPE_FIELD], 0], 1],
        dateFilter,
      ]);

  if (map.getLayer(FISH_CAPTURE_LAYER_ID)) {
    map.setFilter(FISH_CAPTURE_LAYER_ID, captureFilter);
  }

  if (map.getLayer(FISH_ZERO_LAYER_ID)) {
    map.setFilter(FISH_ZERO_LAYER_ID, zeroFilter);
  }

  loadedFilteredFishRecordCount = null;
  updatePointCounter();
  updateFishStatistics();
}

function getFishFilterStatusText() {
  const monthName = selectedFishMonth
    ? fishMonthSelect.options[fishMonthSelect.selectedIndex].text
    : "";

  const periodText = [monthName, selectedFishYear].filter(Boolean).join(" ");

  if (selectedFishSpecies && periodText) {
    return `Showing ${selectedFishSpecies} records from ${periodText}.`;
  }

  if (periodText) {
    return `Showing fish captures and explicit no-fish surveys from ${periodText}.`;
  }

  if (selectedFishSpecies) {
    return `Showing ${selectedFishSpecies} records across Alberta.`;
  }

  return "Showing all cleaned FWMIS fish captures plus explicit no-fish survey crosses.";
}

function bindFishFilterControls() {
  fishYearSelect.addEventListener("change", (event) => {
    stopFishTimeline();
    fishTimelineStep = 0;
    fishTimelineFrames = [];
    fishTimelineProgress.style.width = "0%";
    fishTimelinePeriod.textContent = "Ready";
    selectedFishYear = event.target.value;

    if (activePopup) {
      activePopup.remove();
      activePopup = null;
    }

    updateFishFilter();
    updateFishStatistics();
    updateLegend();
    status.textContent = getFishFilterStatusText();
  });

  fishMonthSelect.addEventListener("change", (event) => {
    stopFishTimeline();
    fishTimelineStep = 0;
    fishTimelineFrames = [];
    fishTimelineProgress.style.width = "0%";
    fishTimelinePeriod.textContent = "Ready";
    selectedFishMonth = event.target.value;

    if (activePopup) {
      activePopup.remove();
      activePopup = null;
    }

    updateFishFilter();
    updateFishStatistics();
    updateLegend();
    status.textContent = getFishFilterStatusText();
  });
}
