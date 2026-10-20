/**
 * PMTiles protocol registration and the MapLibre map instance.
 */

const protocol = new pmtiles.Protocol();

maplibregl.addProtocol("pmtiles", protocol.tile);

const map = new maplibregl.Map({
  container: "map",
  style: MAP_STYLE,
  center: MAP_INITIAL_VIEW.center,
  zoom: MAP_INITIAL_VIEW.zoom,
});

map.addControl(new maplibregl.NavigationControl(), "top-right");

map.on("error", (e) => {
  console.error("MapLibre error:", e.error);
  if (
    e.error &&
    String(e.error.message).includes("alberta_directed_stream_edges.pmtiles")
  ) {
    status.textContent =
      "Directed stream PMTiles did not load. Check that data/alberta_directed_stream_edges.pmtiles exists.";
  }
});
