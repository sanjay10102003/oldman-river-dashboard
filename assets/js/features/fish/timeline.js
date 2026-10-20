/**
 * Fish timeline playback.
 */

function applyFishTimelineSelection(year, month) {
  selectedFishYear = year ? String(year) : "";
  selectedFishMonth = month ? String(month) : "";
  fishYearSelect.value = selectedFishYear;
  fishMonthSelect.value = selectedFishMonth;
  if (activePopup) {
    activePopup.remove();
    activePopup = null;
  }
  updateFishFilter();
  updateFishStatistics();
  updateLegend();
  status.textContent = getFishFilterStatusText();
}

function getFishTimelineFrames() {
  const mode = fishTimelineMode.value;

  // Ignore the empty "All years" option before Number conversion.
  const years = Array.from(fishYearSelect.options)
    .map((option) => option.value)
    .filter((value) => value !== "")
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value > 0)
    .sort((a, b) => a - b);

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const selectedYearNumber = Number(selectedFishYear);
  const selectedMonthNumber = Number(selectedFishMonth);

  if (mode === "year") {
    const startYear =
      Number.isFinite(selectedYearNumber) && selectedYearNumber > 0
        ? selectedYearNumber
        : 2020;

    return years
      .filter((year) => year >= startYear)
      .map((year) => ({
        year,
        month: "",
        label: String(year),
      }));
  }

  if (mode === "month") {
    const startMonth =
      Number.isFinite(selectedMonthNumber) && selectedMonthNumber >= 1
        ? selectedMonthNumber
        : 1;

    return months
      .filter((month) => month >= startMonth)
      .map((month) => ({
        year: "",
        month,
        label: fishMonthSelect.options[month].text,
      }));
  }

  // Year + Month starts exactly from the current filters.
  // Default is January 2020 because the default filters are
  // Survey Year = 2020 and Survey Month = All months.
  const startYear =
    Number.isFinite(selectedYearNumber) && selectedYearNumber > 0
      ? selectedYearNumber
      : 2020;
  const startMonth =
    Number.isFinite(selectedMonthNumber) && selectedMonthNumber >= 1
      ? selectedMonthNumber
      : 1;

  return years
    .filter((year) => year >= startYear)
    .flatMap((year) =>
      months
        .filter((month) => year > startYear || month >= startMonth)
        .map((month) => ({
          year,
          month,
          label: `${fishMonthSelect.options[month].text} ${year}`,
        })),
    );
}

function stopFishTimeline() {
  if (fishTimelineTimer) clearTimeout(fishTimelineTimer);
  fishTimelineTimer = null;
  fishTimelineRunning = false;
  fishTimelinePlay.textContent = "▶ Play timeline";
}

function runFishTimelineStep() {
  if (!fishTimelineRunning) return;
  const frames = fishTimelineFrames;
  if (!frames.length) {
    stopFishTimeline();
    return;
  }
  if (fishTimelineStep >= frames.length) {
    stopFishTimeline();
    fishTimelineStep = 0;
    fishTimelineProgress.style.width = "100%";
    fishTimelinePeriod.textContent = "Complete";
    return;
  }
  const frame = frames[fishTimelineStep];
  applyFishTimelineSelection(frame.year, frame.month);
  fishTimelinePeriod.textContent = frame.label;
  fishTimelineProgress.style.width = `${((fishTimelineStep + 1) / frames.length) * 100}%`;
  fishTimelineStep += 1;
  fishTimelineTimer = setTimeout(
    runFishTimelineStep,
    Number(fishTimelineDelay.value) * 1000,
  );
}

function bindFishTimelineControls() {
  fishTimelinePlay.addEventListener("click", () => {
    if (fishTimelineRunning) {
      stopFishTimeline();
      return;
    }
    fishTimelineFrames = getFishTimelineFrames();
    if (!fishTimelineFrames.length) return;
    if (fishTimelineStep >= fishTimelineFrames.length) fishTimelineStep = 0;
    fishTimelineRunning = true;
    fishTimelinePlay.textContent = "Ⅱ Pause";
    runFishTimelineStep();
  });

  fishTimelineReset.addEventListener("click", () => {
    stopFishTimeline();
    fishTimelineStep = 0;
    fishTimelineProgress.style.width = "0%";
    fishTimelinePeriod.textContent = "Ready";
    fishTimelineFrames = [];
    applyFishTimelineSelection("2020", "");
  });

  fishTimelineMode.addEventListener("change", () => {
    stopFishTimeline();
    fishTimelineStep = 0;
    fishTimelineFrames = [];
    fishTimelineProgress.style.width = "0%";
    fishTimelinePeriod.textContent = "Ready";
  });
}
