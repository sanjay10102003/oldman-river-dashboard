/**
 * Stable colour per fish species.
 */

function buildFishSpeciesColorLookup() {
  fishSpeciesColorLookup = new Map();

  fishSpeciesNames.forEach((speciesName, index) => {
    fishSpeciesColorLookup.set(
      speciesName,
      FISH_SPECIES_COLORS[index % FISH_SPECIES_COLORS.length],
    );
  });
}

function getFishSpeciesColor(speciesName) {
  return fishSpeciesColorLookup.get(speciesName) || "#64748b";
}

function buildFishSpeciesColorExpression() {
  const colorExpression = [
    "match",
    ["to-number", ["get", FISH_SPECIES_FIELD], 0],
  ];

  fishSpeciesNames.forEach((speciesName) => {
    const speciesId = fishSpeciesIdByName.get(speciesName);
    if (Number.isFinite(speciesId)) {
      colorExpression.push(speciesId, getFishSpeciesColor(speciesName));
    }
  });

  colorExpression.push("#64748b");
  return colorExpression;
}

function updateFishSpeciesColors() {
  if (fishSpeciesNames.length === 0) return;

  const colorExpression = buildFishSpeciesColorExpression();

  if (map.getLayer(FISH_CAPTURE_LAYER_ID)) {
    map.setPaintProperty(
      FISH_CAPTURE_LAYER_ID,
      "circle-color",
      colorExpression,
    );
  }

  if (map.getLayer(FISH_ZERO_LAYER_ID)) {
    map.setPaintProperty(FISH_ZERO_LAYER_ID, "text-color", [
      "case",
      ["==", ["get", FISH_RECORD_TYPE_FIELD], "NO_FISH"],
      "#111827",
      colorExpression,
    ]);
  }
}
