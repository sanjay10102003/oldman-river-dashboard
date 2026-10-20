/**
 * MapLibre style: basemaps, data sources and base layers.
 */

const MAP_STYLE = {
  version: 8,
  glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",

  sources: {
    basemapVoyager: {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=cb1_32i5_1_0bc4fe722186d1a262fb82d7",
        "https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=cb1_32i5_1_0bc4fe722186d1a262fb82d7",
        "https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=cb1_32i5_1_0bc4fe722186d1a262fb82d7",
      ],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a> &copy; CARTO',
    },

    basemapPositron: {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png?key=cb1_32i5_1_0bc4fe722186d1a262fb82d7",
        "https://b.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png?key=cb1_32i5_1_0bc4fe722186d1a262fb82d7",
        "https://c.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png?key=cb1_32i5_1_0bc4fe722186d1a262fb82d7",
      ],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a> &copy; CARTO',
    },

    basemapDark: {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png?key=cb1_32i5_1_0bc4fe722186d1a262fb82d7",
        "https://b.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png?key=cb1_32i5_1_0bc4fe722186d1a262fb82d7",
        "https://c.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png?key=cb1_32i5_1_0bc4fe722186d1a262fb82d7",
      ],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a> &copy; CARTO',
    },

    basemapOsm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>',
    },

    basemapTopo: {
      type: "raster",
      tiles: ["https://tile.openmaps.fr/opentopomap/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a> | OpenTopoMap',
    },
    streams: {
      type: "vector",
      url: "pmtiles://data/alberta_stream.pmtiles",
    },
    directedArrows: {
      type: "vector",
      url: "pmtiles://data/alberta_directed_stream_edges.pmtiles",
    },
    directedArrowHeads: {
      type: "vector",
      url: "pmtiles://data/alberta_directed_arrowheads.pmtiles",
    },
    elevationTiles: {
      type: "raster",
      tiles: ["data/elevation_tiles/{z}/{x}/{y}.png"],
      tileSize: 256,
      minzoom: 5,
      maxzoom: 11,
      scheme: "tms",
    },
    riverBinaryTiles: {
      type: "raster",
      tiles: ["data/river_binary_tiles/{z}/{x}/{y}.png"],
      tileSize: 256,
      minzoom: 5,
      maxzoom: 11,
    },
  },
  layers: [
    {
      id: "basemap-voyager",
      type: "raster",
      source: "basemapVoyager",
      layout: { visibility: "none" },
      paint: {
        "raster-opacity": 0.93,
        "raster-saturation": -0.08,
        "raster-contrast": -0.03,
      },
    },

    {
      id: "basemap-positron",
      type: "raster",
      source: "basemapPositron",
      layout: { visibility: "none" },
      paint: {
        "raster-opacity": 0.96,
      },
    },

    {
      id: "basemap-dark",
      type: "raster",
      source: "basemapDark",
      layout: { visibility: "none" },
      paint: {
        "raster-opacity": 0.96,
      },
    },

    {
      id: "basemap-osm",
      type: "raster",
      source: "basemapOsm",
      layout: { visibility: "visible" },
      paint: {
        "raster-opacity": 0.9,
        "raster-saturation": -0.18,
        "raster-contrast": -0.05,
      },
    },

    {
      id: "basemap-topo",
      type: "raster",
      source: "basemapTopo",
      layout: { visibility: "none" },
      paint: {
        "raster-opacity": 0.94,
      },
    },
    {
      id: "elevation-tiles-layer",
      type: "raster",
      source: "elevationTiles",
      layout: {
        visibility: "none",
      },
      paint: {
        "raster-opacity": 0.75,
        "raster-resampling": "nearest",
      },
    },
    {
      id: "river-binary-layer",
      type: "raster",
      source: "riverBinaryTiles",
      layout: {
        visibility: "none",
      },
      paint: {
        "raster-opacity": 0.9,
        "raster-resampling": "nearest",
      },
    },
    {
      id: "streams-line",
      type: "line",
      source: "streams",
      "source-layer": "alberta_stream",
      paint: {
        "line-color": "#087ea4",
        "line-opacity": 0.95,
        "line-width": [
          "interpolate",
          ["linear"],
          ["zoom"],
          5,
          0.6,
          8,
          1.0,
          10,
          1.5,
          12,
          2.2,
        ],
      },
    },

    {
      id: "river-chevron-arrows",
      type: "symbol",
      source: "directedArrows",
      "source-layer": "directed_edges",
      minzoom: 7,
      layout: {
        "symbol-placement": "line",
        "symbol-spacing": [
          "interpolate",
          ["linear"],
          ["zoom"],
          7,
          85,
          10,
          62,
          13,
          45,
        ],
        "text-field": ">",
        "text-size": [
          "interpolate",
          ["linear"],
          ["zoom"],
          7,
          11,
          10,
          13,
          13,
          16,
        ],
        "text-rotation-alignment": "map",
        "text-pitch-alignment": "map",
        "text-keep-upright": false,
        visibility: "visible",
      },
      paint: {
        "text-color": "#0f2233",
        "text-halo-color": "rgba(255,255,255,0.9)",
        "text-halo-width": 1,
      },
    },

    {
      id: "directed-arrow-lines",
      type: "line",
      source: "directedArrows",
      "source-layer": "directed_edges",
      minzoom: 7,
      layout: {
        visibility: "none",
      },
      paint: {
        "line-color": "#ef4444",
        "line-opacity": 0.85,
        "line-width": [
          "interpolate",
          ["linear"],
          ["zoom"],
          7,
          0.85,
          8,
          1.0,
          10,
          1.5,
          12,
          2.2,
        ],
      },
    },
    {
      id: "directed-arrowheads",
      type: "line",
      source: "directedArrowHeads",
      "source-layer": "directed_arrowheads",
      minzoom: 7,
      layout: {
        visibility: "none",
      },
      paint: {
        "line-color": "#000000",
        "line-opacity": 1,
        "line-width": [
          "interpolate",
          ["linear"],
          ["zoom"],
          7,
          0.5,
          10,
          1.0,
          12,
          1.5,
          15,
          2.0,
        ],
      },
    },

    {
      id: "streams-points",
      type: "circle",
      source: "streams",
      "source-layer": "streams",
      paint: {
        "circle-color": "#0088ff",
        "circle-opacity": 0.8,
        "circle-radius": [
          "interpolate",
          ["linear"],
          ["zoom"],
          5,
          1,
          8,
          2,
          10,
          3,
          12,
          5,
        ],
      },
    },
  ],
};

const MAP_INITIAL_VIEW = {
  center: [-114.5, 54.5],
  zoom: 5,
};
