/**
 * Legend panel content.
 */

function formatHistoryLegendNumber(value, variableKey) {
  if (!Number.isFinite(Number(value))) return "N/A";

  if (variableKey === "temperature_c") {
    return `${Number(value).toFixed(1)}°C`;
  }

  if (variableKey === "precipitation_mm_month") {
    return `${Number(value).toFixed(1)} mm`;
  }

  if (variableKey === "wind_speed_ms") {
    return `${Number(value).toFixed(2)} m/s`;
  }

  if (variableKey === "relative_humidity_percent") {
    return `${Number(value).toFixed(1)}%`;
  }

  if (variableKey === "surface_pressure_hpa") {
    return `${Number(value).toFixed(0)} hPa`;
  }

  return String(value);
}

function updateLegend() {
  const layer = isHistorySelected()
    ? getSelectedHistoryVariableConfig()
    : getSelectedLayer();

  legendTitle.textContent = isHistorySelected()
    ? `Historical: ${layer.label}`
    : layer.label;

  legendRows.innerHTML = "";
  legendRows.classList.remove("fish-scroll");

  if (isRiverSelected()) {
    legendTitle.textContent = RIVER_LAYER.label;

    const riverLegendItems = [["#087ea4", "Alberta river network"]];

    riverLegendItems.forEach(([color, text]) => {
      const row = document.createElement("div");
      row.className = "legend-row";

      const line = document.createElement("span");
      line.style.display = "inline-block";
      line.style.width = "18px";
      line.style.height = "3px";
      line.style.borderRadius = "999px";
      line.style.backgroundColor = color;
      line.style.alignSelf = "center";

      const label = document.createElement("span");
      label.className = "legend-label";
      label.textContent = text;

      row.appendChild(line);
      row.appendChild(label);
      legendRows.appendChild(row);
    });
    return;
  }

  // Historical environment uses ONE continuous colour bar instead of
  // named classes such as cold / mild / warm.
  if (isHistorySelected()) {
    const historyRange = getActiveHistoryDisplayRange();
    const minValue = historyRange.min;
    const maxValue = historyRange.max;
    const midValue = (minValue + maxValue) / 2;

    const wrapper = document.createElement("div");
    wrapper.className = "history-gradient-legend";

    const bar = document.createElement("div");
    bar.className = "history-gradient-bar";

    const scale = document.createElement("div");
    scale.className = "history-gradient-scale";

    const minLabel = document.createElement("span");
    minLabel.textContent = formatHistoryLegendNumber(
      minValue,
      historySelectedVariable,
    );

    const midLabel = document.createElement("span");
    midLabel.textContent = formatHistoryLegendNumber(
      midValue,
      historySelectedVariable,
    );

    const maxLabel = document.createElement("span");
    maxLabel.textContent = formatHistoryLegendNumber(
      maxValue,
      historySelectedVariable,
    );

    scale.appendChild(minLabel);
    scale.appendChild(midLabel);
    scale.appendChild(maxLabel);

    wrapper.appendChild(bar);
    wrapper.appendChild(scale);
    legendRows.appendChild(wrapper);
    return;
  }

  let legendItems = layer.legend;

  if (isMlResultsSelected()) {
    legendTitle.textContent = "Rainbow Trout ML Results";
    const items = [
      ["#2563eb", "Train observations"],
      ["#111827", "Held-out test observations"],
      ["#fb923c", "Presence probability"],
      ["#facc15", "Predicted count"],
      ["#7c3aed", "Neighbour data available"],
    ];
    items.forEach(([color, text]) => {
      const row = document.createElement("div");
      row.className = "legend-row";
      const dot = document.createElement("span");
      dot.className = "legend-dot";
      dot.style.background = color;
      const label = document.createElement("span");
      label.className = "legend-label";
      label.textContent = text;
      row.append(dot, label);
      legendRows.appendChild(row);
    });
    const note = document.createElement("div");
    note.className = "help-text";
    note.style.marginTop = "9px";
    note.textContent =
      "Presence: XGBoost + neighbour · Count: Extra Trees without neighbour";
    legendRows.appendChild(note);
    return;
  }

  if (isFishSelected()) {
    legendTitle.textContent = "Fish Distribution";

    const addLegendRow = (color, text, shape = "dot") => {
      const row = document.createElement("div");
      row.className = "legend-row";

      const marker = document.createElement("span");
      marker.className = shape === "cross" ? "legend-cross" : "legend-dot";

      if (shape === "cross") {
        marker.textContent = "×";
        marker.style.color = color;
      } else {
        marker.style.backgroundColor = color;
      }

      const label = document.createElement("span");
      label.className = "legend-label";
      label.textContent = text;

      row.appendChild(marker);
      row.appendChild(label);
      legendRows.appendChild(row);
    };

    if (selectedFishSpecies) {
      addLegendRow(
        getFishSpeciesColor(selectedFishSpecies),
        `${selectedFishSpecies} captured`,
      );
      addLegendRow("#111827", `Zero count / no fish captured`, "cross");
      return;
    }

    addLegendRow("#111827", "Zero count / no fish captured", "cross");

    legendRows.classList.add("fish-scroll");

    fishSpeciesNames.forEach((speciesName) => {
      addLegendRow(getFishSpeciesColor(speciesName), speciesName);
    });

    return;
  }

  legendItems.forEach(([color, text]) => {
    const row = document.createElement("div");
    row.className = "legend-row";

    const dot = document.createElement("span");
    dot.className = "legend-dot";
    dot.style.backgroundColor = color;

    const label = document.createElement("span");
    label.className = "legend-label";
    label.textContent = text;

    row.appendChild(dot);
    row.appendChild(label);
    legendRows.appendChild(row);
  });
}
