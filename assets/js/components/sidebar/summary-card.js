/**
 * Summary counters. Values are updated by ui/summary.js.
 */

function SummaryCard() {
  return Card({
    id: "summaryCard",
    title: "Summary",
    children: `
      <div class="stats-grid">
        ${StatTile({ labelId: "summaryPrimaryLabel", label: "Visible Layer", valueId: "pointCount", value: "0" })}
        ${StatTile({ labelId: "summarySecondaryLabel", label: "Per Action", valueId: "summarySecondaryValue", value: POINTS_PER_ACTION })}
      </div>`,
  });
}
