/**
 * Sidebar and legend collapse toggles.
 */

function bindPanelToggles() {
  sidebarToggle.addEventListener("click", () => {
    const isCollapsed = sidebar.classList.toggle("collapsed");
    sidebarToggle.classList.toggle("sidebar-collapsed", isCollapsed);
    sidebarToggle.setAttribute("aria-expanded", String(!isCollapsed));
    sidebarToggle.setAttribute(
      "aria-label",
      isCollapsed ? "Show dashboard menu" : "Hide dashboard menu",
    );
    sidebarToggle.title = isCollapsed ? "Show menu" : "Hide menu";

    window.setTimeout(() => map.resize(), 380);
  });

  legendToggle.addEventListener("click", () => {
    const isCollapsed = legend.classList.toggle("legend-collapsed");
    legendToggle.setAttribute("aria-expanded", String(!isCollapsed));
    legendToggle.setAttribute(
      "aria-label",
      isCollapsed ? "Show legend" : "Hide legend",
    );
    legendToggle.title = isCollapsed ? "Show legend" : "Hide legend";
  });
}
