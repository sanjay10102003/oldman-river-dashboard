/**
 * Shared, mutable application state.
 */

let fishSpeciesColorLookup = new Map();

let allStreamPoints = [];

let environmentFeatures = [];

let usedPointKeys = new Set();

let isFetching = false;

let selectedEnvironmentPointId = null;

let selectedEnvironmentPointIndex = -1;

let pointInteractionsAdded = false;

let historyInteractionsAdded = false;

let fishInteractionsAdded = false;

let activePopup = null;

let historyRows = [];

let historyLoaded = false;

let historyIsLoading = false;

let historySelectedYear = 2020;

let historySelectedMonth = null;

let historySelectedVariable = "temperature_c";

let liveWeatherSelectedDate = "";

let activeHistoryValueLookup = new Map();

let activeHistoryColorLookup = new Map();

let fishSpeciesLoaded = false;

let selectedFishSpecies = "";

let selectedFishYear = "2020";

let selectedFishMonth = "";

let loadedFilteredFishRecordCount = null;

let fishTimelineTimer = null;

let fishTimelineRunning = false;

let fishTimelineStep = 0;

let fishTimelineFrames = [];

let fishSpeciesNames = [];

let fishSpeciesStats = {};

let fishSpeciesIdByName = new Map();

let fishSpeciesNameById = new Map();

let fishSpeciesLookupById = new Map();

let isSelectionMode = false;

let isDraggingSelection = false;

let selectionStart = null;
