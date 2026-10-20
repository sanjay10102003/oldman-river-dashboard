/**
 * Option lists shared by the sidebar controls.
 */

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Years covered by the ERA5-Land history and the ML results.
const AVAILABLE_YEARS = [2020, 2021, 2022, 2023, 2024, 2025];

const LAYER_OPTIONS = [
  { value: "river", label: "River Network", selected: true },
  { value: "environment", label: "Environment" },
  { value: "fish", label: "Fish Distribution" },
  { value: "mlResults", label: "Rainbow Trout ML Results" },
];

const RIVER_DISPLAY_OPTIONS = [
  { value: "network", label: "River Network", selected: true },
  { value: "binary", label: "River Binary Grid" },
];

const ENVIRONMENT_MODE_OPTIONS = [
  { value: "live", label: "Daily Environment" },
  { value: "history", label: "Historical Monthly Environment" },
];

const ENVIRONMENT_VARIABLE_OPTIONS = [
  { value: "temperature", label: "Temperature" },
  { value: "precipitation", label: "Precipitation" },
  { value: "wind", label: "Wind Speed" },
  { value: "humidity", label: "Humidity" },
  { value: "pressure", label: "Pressure" },
  { value: "elevation", label: "Elevation" },
];

const HISTORY_VARIABLE_OPTIONS = [
  { value: "temperature_c", label: "Temperature" },
  { value: "precipitation_mm_month", label: "Monthly Precipitation" },
  { value: "wind_speed_ms", label: "Monthly Mean Wind Vector" },
  { value: "relative_humidity_percent", label: "Humidity" },
  { value: "surface_pressure_hpa", label: "Surface Pressure" },
];

const FISH_TIMELINE_MODE_OPTIONS = [
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
  { value: "both", label: "Year + Month", selected: true },
];

const FISH_TIMELINE_DELAY_OPTIONS = Array.from({ length: 10 }, (_, i) => ({
  value: String(i + 1),
  label: i === 0 ? "1 second" : `${i + 1} seconds`,
  selected: i === 0,
}));
