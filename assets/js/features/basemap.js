/**
 * Basemap visibility and river styling.
 */

function updateBasemap() {
  // OpenStreetMap is the only basemap exposed by this dashboard.
  Object.values(BASEMAP_LAYER_IDS).forEach((layerId) => {
    if (!map.getLayer(layerId)) return;
    map.setLayoutProperty(
      layerId,
      "visibility",
      layerId === "basemap-osm" ? "visible" : "none",
    );
  });

  if (map.getLayer("streams-line")) {
    map.setPaintProperty("streams-line", "line-color", "#087ea4");
  }

  if (map.getLayer("river-chevron-arrows")) {
    map.setPaintProperty("river-chevron-arrows", "text-color", "#0f2233");
    map.setPaintProperty(
      "river-chevron-arrows",
      "text-halo-color",
      "rgba(255,255,255,0.92)",
    );
  }
}
