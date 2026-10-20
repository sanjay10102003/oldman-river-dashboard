/**
 * Data sources and credits. Entries live in config/data-sources.js.
 */

function SourcesCard() {
  return Card({
    id: "sourcesCard",
    className: "sources-card",
    title: "Data Sources &amp; Credits",
    children: `
      <p class="sources-intro">
        This dashboard integrates authoritative open data and open-source
        mapping technologies. Select a source below to view its official
        website or documentation.
      </p>
      <div class="source-list">
        ${DATA_SOURCES.map(SourceItem).join("\n")}
      </div>`,
  });
}
