/**
 * Legend panel. Rows are filled in by ui/legend.js.
 */

function LegendPanel() {
  return `
    <div id="legend">
      <div class="legend-header">
        <strong id="legendTitle">River Network</strong>
        <button
          id="legendToggle"
          class="legend-toggle"
          type="button"
          aria-label="Hide legend"
          aria-expanded="true"
          title="Hide legend"
        >${ChevronIcon("M6 9l6 6 6-6")}
        </button>
      </div>
      <div id="legendBody">
        <div id="legendRows"></div>
      </div>
    </div>`;
}
