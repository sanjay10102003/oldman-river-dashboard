/**
 * Fish species statistics panel.
 */

async function loadFishStatisticsFile() {
  if (Object.keys(fishSpeciesStats).length > 0) {
    return fishSpeciesStats;
  }

  const response = await fetch(FISH_STATS_PATH);

  if (!response.ok) {
    console.warn(
      `Fish statistics file could not be loaded: ${response.status}`,
    );
    fishSpeciesStats = {};
    return fishSpeciesStats;
  }

  fishSpeciesStats = await response.json();
  return fishSpeciesStats;
}

function getOptimizedFishStatsRecord(speciesName, year, month) {
  const root = fishSpeciesStats || {};
  const speciesId = speciesName ? fishSpeciesIdByName.get(speciesName) : null;

  if (speciesName && !Number.isFinite(speciesId)) return null;

  if (speciesId && year && month) {
    return root.species_year_month?.[`${speciesId}|${year}|${month}`] || null;
  }
  if (speciesId && year) {
    return root.species_year?.[`${speciesId}|${year}`] || null;
  }
  if (speciesId && month) {
    return root.species_month?.[`${speciesId}|${month}`] || null;
  }
  if (year && month) {
    return root.year_month?.[`${year}|${month}`] || null;
  }
  if (speciesId) {
    return root.species?.[String(speciesId)] || null;
  }
  if (year) {
    return root.year?.[String(year)] || null;
  }
  if (month) {
    return root.month?.[String(month)] || null;
  }
  return root.all || null;
}

function readFishStatNumber(record, keys) {
  if (!record) return null;
  for (const key of keys) {
    const value = Number(record[key]);
    if (Number.isFinite(value)) return value;
  }
  return null;
}

function getGlobalFilteredFishCount() {
  const record = getOptimizedFishStatsRecord(
    selectedFishSpecies,
    selectedFishYear,
    selectedFishMonth,
  );
  if (!record) return null;

  const positive = Number(record.positive_records || 0);
  const zero = selectedFishSpecies ? 0 : Number(record.zero_surveys || 0);
  return positive + zero;
}

function getGlobalFilteredTotalFish() {
  if (!selectedFishYear && !selectedFishMonth && !selectedFishSpecies) {
    return FISH_TOTAL_FISH;
  }
  const record = getOptimizedFishStatsRecord(
    selectedFishSpecies,
    selectedFishYear,
    selectedFishMonth,
  );
  return readFishStatNumber(record, [
    "total_fish",
    "fish_count",
    "sum_count",
    "total_count",
    "count",
  ]);
}

function updateFishStatistics() {
  if (!selectedFishSpecies) {
    fishStats.classList.remove("visible");
    return;
  }

  // Read the global precomputed optimized statistics. These values are
  // independent of the current map zoom, viewport, and loaded tiles.
  const stats = getOptimizedFishStatsRecord(
    selectedFishSpecies,
    selectedFishYear,
    selectedFishMonth,
  );

  const speciesId = fishSpeciesIdByName.get(selectedFishSpecies);
  const speciesInfo = Number.isFinite(speciesId)
    ? fishSpeciesLookupById.get(speciesId)
    : null;

  const monthLabel = selectedFishMonth
    ? fishMonthSelect.options[fishMonthSelect.selectedIndex].text
    : "All months";

  fishStatsTitle.textContent = selectedFishSpecies;

  const totalFish = readFishStatNumber(stats, [
    "total_fish",
    "fish_count",
    "sum_count",
    "total_count",
    "count",
  ]);
  const observations = readFishStatNumber(stats, [
    "positive_records",
    "observations",
    "records",
  ]);

  fishTotalCount.textContent =
    totalFish !== null ? totalFish.toLocaleString() : "0";
  fishObservationCount.textContent =
    observations !== null ? observations.toLocaleString() : "0";
  fishSelectedYear.textContent = selectedFishYear || "All years";
  fishSelectedMonth.textContent = monthLabel;
  fishFamily.textContent = speciesInfo?.code || "N/A";

  fishStats.classList.add("visible");
}
