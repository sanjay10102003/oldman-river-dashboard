/**
 * Fish distribution controls: species search, survey filters,
 * timeline playback and species statistics.
 */

function FishControlsCard() {
  return Card({
    id: "fishControlCard",
    title: "Fish Distribution",
    hidden: true,
    children: `
      ${FieldLabel({ forId: "fishSpeciesInput", text: "Species" })}
      ${FishSpeciesSelector()}
      ${SelectField({
        id: "fishYearSelect",
        label: "Survey Year",
        options: [{ value: "", label: "All years" }],
      })}
      ${SelectField({
        id: "fishMonthSelect",
        label: "Survey Month",
        options: monthOptions({ value: "", label: "All months" }),
      })}
      ${FishTimeline()}
      ${FishStatsPanel()}
      ${HelpText({
        text: "Search or select a species, then click a point to view observation details. Repeated > symbols show river-flow direction.",
      })}`,
  });
}

function FishSpeciesSelector() {
  return `
    <div class="searchable-select" id="fishSpeciesSelector">
      <input
        id="fishSpeciesInput"
        class="searchable-select-input"
        type="text"
        value="All species"
        placeholder="Search species..."
        autocomplete="off"
        role="combobox"
        aria-expanded="false"
        aria-controls="fishSpeciesMenu"
      />
      <button
        id="fishSpeciesToggle"
        class="searchable-select-toggle"
        type="button"
        aria-label="Open species list"
      >▾</button>
      <div
        id="fishSpeciesMenu"
        class="searchable-select-menu"
        role="listbox"
      ></div>
    </div>`;
}

function FishTimeline() {
  return `
    <div class="fish-timeline" id="fishTimeline">
      <div class="fish-timeline-head">
        <span class="fish-timeline-title">Timeline playback</span>
        <span class="fish-timeline-period" id="fishTimelinePeriod">Ready</span>
      </div>
      <div class="fish-timeline-grid">
        <div>
          ${SelectField({ id: "fishTimelineMode", label: "Play by", options: FISH_TIMELINE_MODE_OPTIONS })}
        </div>
        <div>
          ${SelectField({ id: "fishTimelineDelay", label: "Delay", options: FISH_TIMELINE_DELAY_OPTIONS })}
        </div>
      </div>
      <div class="fish-timeline-actions">
        <button class="fish-timeline-button" id="fishTimelinePlay" type="button">▶ Play timeline</button>
        <button
          class="fish-timeline-button secondary"
          id="fishTimelineReset"
          type="button"
          title="Reset timeline"
        >↺</button>
      </div>
      <div class="fish-timeline-progress" aria-hidden="true">
        <span id="fishTimelineProgress"></span>
      </div>
    </div>`;
}

function FishStatsPanel() {
  return `
    <div class="fish-stats" id="fishStats">
      <div class="fish-stats-title" id="fishStatsTitle">Species Statistics</div>
      <div class="fish-stats-grid">
        ${FishStatTile({ label: "Total Fish", valueId: "fishTotalCount", value: "0" })}
        ${FishStatTile({ label: "Observations", valueId: "fishObservationCount", value: "0" })}
        ${FishStatTile({ label: "Survey Year", valueId: "fishSelectedYear", value: "All years" })}
        ${FishStatTile({ label: "Survey Month", valueId: "fishSelectedMonth", value: "All months" })}
        ${FishStatTile({ label: "Species code", valueId: "fishFamily", value: "N/A", wide: true })}
      </div>
    </div>`;
}
