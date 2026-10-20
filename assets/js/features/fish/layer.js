/**
 * Fish distribution map layer.
 */

async function addFishLayer() {
  if (map.getSource("fishOccurrences")) return;

  try {
    map.addSource("fishOccurrences", {
      type: "vector",
      url: `pmtiles://${FISH_PMTILES_PATH}`,
    });

    map.addLayer({
      id: FISH_CAPTURE_LAYER_ID,
      type: "circle",
      source: "fishOccurrences",
      "source-layer": FISH_SOURCE_LAYER,
      minzoom: 0,
      filter: [">", ["to-number", ["get", FISH_COUNT_FIELD], 0], 0],
      layout: {
        visibility: "none",
      },
      paint: {
        // Species-specific colour is applied after the species list loads.
        "circle-color": "#2563eb",

        // Radius uses DISPLAY_COUNT from the new cleaned dashboard dataset.
        // It stays small at low zoom so all records are visible without
        // turning the map into one dark block.
        "circle-radius": [
          "interpolate",
          ["linear"],
          ["zoom"],
          0,
          [
            "interpolate",
            ["linear"],
            ["to-number", ["coalesce", ["get", FISH_COUNT_FIELD], 0], 0],
            0,
            2.8,
            1,
            3.0,
            5,
            3.25,
            20,
            3.55,
            100,
            4.0,
          ],
          5,
          [
            "interpolate",
            ["linear"],
            ["to-number", ["coalesce", ["get", FISH_COUNT_FIELD], 0], 0],
            0,
            2.8,
            1,
            3.1,
            5,
            3.5,
            20,
            4.1,
            100,
            5.0,
          ],
          9,
          [
            "interpolate",
            ["linear"],
            ["to-number", ["coalesce", ["get", FISH_COUNT_FIELD], 0], 0],
            0,
            2.8,
            1,
            3.2,
            5,
            4.0,
            20,
            5.4,
            100,
            7.2,
          ],
          14,
          [
            "interpolate",
            ["linear"],
            ["to-number", ["coalesce", ["get", FISH_COUNT_FIELD], 0], 0],
            0,
            3.4,
            1,
            4.1,
            5,
            5.4,
            20,
            7.6,
            100,
            10.5,
          ],
        ],
        "circle-opacity": [
          "interpolate",
          ["linear"],
          ["zoom"],
          0,
          0.88,
          5,
          0.88,
          9,
          0.9,
          14,
          0.94,
        ],
        "circle-stroke-color": "#ffffff",
        "circle-stroke-width": [
          "interpolate",
          ["linear"],
          ["zoom"],
          0,
          0,
          5,
          0.15,
          9,
          0.35,
          14,
          0.75,
        ],
      },
    });

    map.addLayer({
      id: FISH_ZERO_LAYER_ID,
      type: "symbol",
      source: "fishOccurrences",
      "source-layer": FISH_SOURCE_LAYER,
      minzoom: 0,
      filter: ["==", ["to-number", ["get", FISH_RECORD_TYPE_FIELD], 0], 1],
      layout: {
        visibility: "none",
        "text-field": "×",
        "text-font": ["Noto Sans Regular"],
        "text-size": [
          "interpolate",
          ["linear"],
          ["zoom"],
          0,
          11,
          5,
          12,
          9,
          14,
          14,
          20,
        ],
        "text-allow-overlap": true,
        "text-ignore-placement": true,
      },
      paint: {
        "text-color": "#111827",
        "text-halo-color": "rgba(255,255,255,0.96)",
        "text-halo-width": [
          "interpolate",
          ["linear"],
          ["zoom"],
          0,
          0.4,
          5,
          0.8,
          10,
          1.2,
        ],
        "text-opacity": [
          "interpolate",
          ["linear"],
          ["zoom"],
          0,
          0.82,
          5,
          0.86,
          10,
          0.95,
        ],
      },
    });

    addFishInteractions();

    if (fishSpeciesLoaded) {
      updateFishSpeciesColors();
      updateFishFilter();
    }
  } catch (error) {
    console.error("Could not add FWMIS fish layer:", error);
    status.textContent =
      "The FWMIS fish PMTiles layer could not be loaded. Check data/fish/fwmis_fish_map.pmtiles.";
  }
}
