/**
 * Data paths, tile/field names, dataset totals and map layer ids.
 */

const MAX_POINTS_PER_LAYER = 500;

const POINTS_PER_ACTION = 50;

const HISTORY_CSV_PATH =
  "data/environment_history/era5_stream_grid_monthly_2020_2025.csv";

const HISTORY_STREAM_SHARD_COUNT = 6;

const HISTORY_STREAM_SHARD_DIRECTORY =
  "data/environment_history/historical_segments_shards";

const HISTORY_STREAM_SOURCE_LAYER = "historical_stream_segments";

const HISTORY_STREAM_LAYER_IDS = [];

const FISH_PMTILES_PATH = "data/fish/fwmis_fish_map.pmtiles";

const FISH_SOURCE_LAYER = "fwmis_fish";

const FISH_SPECIES_PATH = "data/fish/fwmis_fish_species.json";

const FISH_STATS_PATH = "data/fish/fwmis_fish_stats.json";

const FISH_TOTAL_RECORDS = 462931;

const FISH_TOTAL_SPECIES = 82;

const FISH_ZERO_RECORDS = 71310;

const FISH_NO_FISH_RECORDS = 71310;

const FISH_TOTAL_FISH = 11732580;

const FISH_CAPTURE_LAYER_ID = "fish-captures";

const FISH_ZERO_LAYER_ID = "fish-zero-crosses";

const FISH_LAYER_IDS = [FISH_CAPTURE_LAYER_ID, FISH_ZERO_LAYER_ID];

const FISH_SPECIES_FIELD = "s";

const FISH_SPECIES_CODE_FIELD = "s";

const FISH_COUNT_FIELD = "c";

const FISH_YEAR_FIELD = "y";

const FISH_MONTH_FIELD = "m";

const FISH_DATE_FIELD = "y";

const FISH_RECORD_TYPE_FIELD = "z";

const ML_RESULTS_BASE_PATH = "data/ml";

const ML_RESULTS_LAYER_IDS = {
  train: "ml-results-train",
  test: "ml-results-test",
  presence: "ml-results-presence",
  count: "ml-results-count",
  neighbor: "ml-results-neighbor",
};

const BASEMAP_LAYER_IDS = {
  voyager: "basemap-voyager",
  positron: "basemap-positron",
  dark: "basemap-dark",
  osm: "basemap-osm",
  topo: "basemap-topo",
};
