/**
 * Entries for the "Data Sources & Credits" card.
 * Items without an `href` are derived datasets and render as plain cards.
 */

const DATA_SOURCES = [
  {
    name: "Government of Alberta - Base Watersheds",
    purpose: "Provincial stream and watershed network data",
    href: "https://open.alberta.ca/opendata/gda-87c2f32f-cd0b-4250-8142-e49391512c64",
  },
  {
    name: "Derived River Binary Grid",
    purpose:
      "200 m × 200 m binary raster derived from the Alberta stream network; 1 = river cell, 0 = non-river cell",
  },
  {
    name: "Government of Alberta - Provincial DEM",
    purpose: "Elevation data used for terrain visualization and flow analysis",
    href: "https://open.alberta.ca/opendata/gda-c16469a2-5541-455c-bba0-63a24c0ff08a",
  },
  {
    name: "Open-Meteo Weather API",
    purpose:
      "Hourly historical and current temperature, precipitation, wind, humidity and pressure",
    href: "https://open-meteo.com/en/docs",
  },
  {
    name: "Copernicus Climate Data Store - ERA5-Land",
    purpose: "Monthly historical land-climate reanalysis for 2020–2025",
    href: "https://cds.climate.copernicus.eu/datasets/reanalysis-era5-land-monthly-means",
  },
  {
    name: "Government of Alberta - FWMIS Fish Surveys",
    purpose: "Provincial fish inventory survey and occurrence records",
    href: "https://geospatial.alberta.ca/titan/rest/services/biota/fwimt_pub_species_inventory/MapServer/30",
  },
  {
    name: "Derived Rainbow Trout Count Prediction",
    purpose:
      "Direct count regression using valid FWMIS lotic surveys, including zero-count and positive-count Rainbow Trout surveys, combined with ERA5-Land temperature, precipitation, wind speed, relative humidity and surface pressure.",
  },
  {
    name: "OpenStreetMap Contributors",
    purpose: "Reference basemap and geographic context",
    href: "https://www.openstreetmap.org/copyright",
  },
  {
    name: "MapLibre GL JS",
    purpose: "Interactive WebGL map rendering library",
    href: "https://www.maplibre.org/maplibre-gl-js/docs/",
  },
  {
    name: "PMTiles / Protomaps",
    purpose: "Efficient single-file vector-tile storage and delivery",
    href: "https://docs.protomaps.com/pmtiles/",
  },
];
