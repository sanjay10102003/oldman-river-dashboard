/**
 * Display settings for each dashboard layer: labels, units, colour stops and legend rows.
 */

const ML_RESULTS_LAYER = { label: "Rainbow Trout ML Results" };

const WEATHER_LAYERS = {
  temperature: {
    label: "Temperature",
    apiName: "temperature_2m",
    unit: "°C",
    colorStops: [
      -15,
      "#b91c1c",
      5,
      "#b91c1c",
      10,
      "#f97316",
      15,
      "#f59e0b",
      30,
      "#fde047",
    ],
    legend: [
      ["#b91c1c", "Low: < 5°C"],
      ["#f97316", "Normal: 5°C - 15°C"],
      ["#fde047", "High: > 15°C"],
    ],
  },

  precipitation: {
    label: "Precipitation",
    apiName: "precipitation",
    unit: "mm",
    colorStops: [
      0,
      "#b91c1c",
      1,
      "#b91c1c",
      5,
      "#f97316",
      10,
      "#f59e0b",
      20,
      "#fde047",
    ],
    legend: [
      ["#b91c1c", "Low: 0 - 1 mm"],
      ["#f97316", "Normal: 1 - 10 mm"],
      ["#fde047", "High: > 10 mm"],
    ],
  },

  wind: {
    label: "Wind Speed",
    apiName: "wind_speed_10m",
    unit: "km/h",
    colorStops: [
      0,
      "#b91c1c",
      10,
      "#b91c1c",
      20,
      "#f97316",
      30,
      "#f59e0b",
      60,
      "#fde047",
    ],
    legend: [
      ["#b91c1c", "Low: 0 - 10 km/h"],
      ["#f97316", "Normal: 10 - 30 km/h"],
      ["#fde047", "High: > 30 km/h"],
    ],
  },

  humidity: {
    label: "Humidity",
    apiName: "relative_humidity_2m",
    unit: "%",
    colorStops: [
      0,
      "#b91c1c",
      30,
      "#b91c1c",
      70,
      "#f97316",
      85,
      "#f59e0b",
      100,
      "#fde047",
    ],
    legend: [
      ["#b91c1c", "Low: < 30%"],
      ["#f97316", "Normal: 30% - 85%"],
      ["#fde047", "High: > 85%"],
    ],
  },

  pressure: {
    label: "Pressure",
    apiName: "surface_pressure",
    unit: "hPa",
    colorStops: [
      850,
      "#b91c1c",
      950,
      "#b91c1c",
      1015,
      "#f97316",
      1030,
      "#f59e0b",
      1050,
      "#fde047",
    ],
    legend: [
      ["#b91c1c", "Low: < 950 hPa"],
      ["#f97316", "Normal: 950 - 1030 hPa"],
      ["#fde047", "High: > 1030 hPa"],
    ],
  },
};

const HISTORY_VARIABLES = {
  temperature_c: {
    label: "Temperature",
    unit: "°C",
    colorStops: [
      -27.1,
      "#b91c1c",
      -14.346,
      "#b91c1c",
      -6.382,
      "#ef4444",
      2.898,
      "#f97316",
      12.395,
      "#f59e0b",
      24.9,
      "#fde047",
    ],
    gradientMin: -27.1,
    gradientMax: 24.9,
    legend: [],
  },

  precipitation_mm_month: {
    label: "Monthly Precipitation",
    unit: "mm/month",
    colorStops: [
      0.9,
      "#b91c1c",
      9.173,
      "#b91c1c",
      18.671,
      "#ef4444",
      29.571,
      "#f97316",
      45.907,
      "#f59e0b",
      246.5,
      "#fde047",
    ],
    gradientMin: 0.9,
    gradientMax: 246.5,
    legend: [],
  },

  wind_speed_ms: {
    label: "Monthly Mean Wind Vector",
    unit: "m/s",
    colorStops: [
      0,
      "#b91c1c",
      0.304,
      "#b91c1c",
      0.582,
      "#ef4444",
      0.824,
      "#f97316",
      1.103,
      "#f59e0b",
      4.5,
      "#fde047",
    ],
    gradientMin: 0,
    gradientMax: 4.5,
    legend: [],
  },

  relative_humidity_percent: {
    label: "Relative Humidity",
    unit: "%",
    colorStops: [
      34.7,
      "#b91c1c",
      54.11,
      "#b91c1c",
      62.26,
      "#ef4444",
      68.023,
      "#f97316",
      73.264,
      "#f59e0b",
      91.7,
      "#fde047",
    ],
    gradientMin: 34.7,
    gradientMax: 91.7,
    legend: [],
  },

  surface_pressure_hpa: {
    label: "Surface Pressure",
    unit: "hPa",
    colorStops: [
      739,
      "#b91c1c",
      870.986,
      "#b91c1c",
      918.997,
      "#ef4444",
      933.519,
      "#f97316",
      944.432,
      "#f59e0b",
      999,
      "#fde047",
    ],
    gradientMin: 739,
    gradientMax: 999,
    legend: [],
  },
};

const HISTORY_LAYER = {
  label: "Historical Environment",
};

const RIVER_LAYER = {
  label: "River Network",
  legend: [
    ["#087ea4", "Alberta stream network"],
    ["#0f2233", "Flow direction"],
  ],
};

const FISH_LAYER = {
  label: "Fish Distribution",
  legend: [["#111827", "Zero count / no fish captured"]],
};

const ELEVATION_LAYER = {
  label: "Elevation Tiles",
  unit: "m",
  legend: [
    ["#b2182b", "0-200 m"],
    ["#d6604d", "200-600 m"],
    ["#f4a582", "600-1000 m"],
    ["#f7f7f7", "1000-1400 m"],
    ["#92c5de", "1400-1800 m"],
    ["#4393c3", "1800-2200 m"],
    ["#2166ac", ">2200 m"],
  ],
};

const RIVER_BINARY_LAYER = {
  label: "River Binary Grid",
  legend: [
    ["#00e5ff", "River pixel = 1"],
    ["rgba(255,255,255,0)", "Non-river pixel = 0"],
  ],
};
