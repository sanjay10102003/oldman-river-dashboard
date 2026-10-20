/**
 * River network and elevation map interactions.
 */

function addDirectedEdgeInteractions() {
  map.on("click", "directed-arrow-lines", (e) => {
    if (!isElevationSelected()) return;

    const feature = e.features[0];
    const props = feature.properties || {};

    const fromElev = Number(props.from_elev);
    const toElev = Number(props.to_elev);
    const drop = Number(props.drop);

    const fromText = Number.isFinite(fromElev)
      ? `${fromElev.toFixed(2)} m`
      : "N/A";
    const toText = Number.isFinite(toElev) ? `${toElev.toFixed(2)} m` : "N/A";
    const dropText = Number.isFinite(drop) ? `${drop.toFixed(2)} m` : "N/A";

    new maplibregl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(
        `
                    <div style="font-family: Arial; min-width: 230px;">
                      <h3 style="margin:0 0 8px;">Elevation Flow</h3>
                      <strong>From elevation:</strong> ${fromText}<br>
                      <strong>To elevation:</strong> ${toText}<br>
                      <strong>Elevation drop:</strong> ${dropText}<br>
                    </div>
                    `,
      )
      .addTo(map);
  });

  map.on("mouseenter", "directed-arrow-lines", () => {
    if (isElevationSelected()) {
      map.getCanvas().style.cursor = "pointer";
    }
  });

  map.on("mouseleave", "directed-arrow-lines", () => {
    if (!isSelectionMode) {
      map.getCanvas().style.cursor = "";
    }
  });
}

function addElevationInteractions() {
  // Elevation is loaded as raster tiles, so individual cell values are not clickable.
  // The colored tile overlay appears when the Elevation Tiles layer is selected.
}
