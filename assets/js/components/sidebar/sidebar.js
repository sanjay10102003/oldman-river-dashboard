/**
 * Sidebar panel and its collapse toggle.
 */

function Sidebar() {
  return `
    <div id="sidebar">
      <div class="title">
        <h1>Alberta Streams Dashboard</h1>
      </div>
      ${LayerSelectionCard()}
      ${RiverControlsCard()}
      ${EnvironmentControlsCard()}
      ${HistoryControlsCard()}
      ${FishControlsCard()}
      ${MlResultsCard()}
      ${SummaryCard()}
      ${AddDataCard()}
      ${SourcesCard()}
      <div id="status">Loading map...</div>
    </div>`;
}

function SidebarToggle() {
  return `
    <button
      id="sidebarToggle"
      class="sidebar-toggle"
      type="button"
      aria-label="Hide dashboard menu"
      aria-expanded="true"
      title="Hide menu"
    >${ChevronIcon("M15 6l-6 6 6 6")}
    </button>`;
}
