/**
 * Top-level page layout. Element order matters for stacking and must match
 * the order the stylesheets expect.
 */

function AppShell() {
  return `
    ${Sidebar()}
    ${SidebarToggle()}
    ${MapCanvas()}
    ${LegendPanel()}`;
}
