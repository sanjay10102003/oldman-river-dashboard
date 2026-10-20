/**
 * Rainbow Trout ML results: period filters, layer toggles and model metrics.
 */

const ML_MODEL_METRICS = [
  {
    title: "Presence · XGBoost + 5-step neighbour",
    metrics: "ROC-AUC 0.923 · PR-AUC 0.664 · Balanced accuracy 0.825",
  },
  {
    title: "Count · Extra Trees without neighbour",
    metrics: "MAE 1.013 · RMSE 9.288 · R² 0.084 · Log RMSE 0.448",
  },
];

function MlResultsCard() {
  return Card({
    id: "mlResultsControlCard",
    title: "Rainbow Trout ML Results",
    hidden: true,
    children: `
      ${SelectField({
        id: "mlResultsYear",
        label: "Year",
        options: yearOptions({
          value: "all",
          label: "All years",
          selected: true,
        }),
      })}
      ${SelectField({
        id: "mlResultsMonth",
        label: "Month",
        options: monthOptions({
          value: "all",
          label: "All months",
          selected: true,
        }),
      })}
      <div class="ml-results-toggle-grid">
        ${CheckboxToggle({ id: "mlShowTrain", label: "Train", checked: true })}
        ${CheckboxToggle({ id: "mlShowTest", label: "Test", checked: true })}
        ${CheckboxToggle({ id: "mlShowPresence", label: "Presence", checked: true })}
        ${CheckboxToggle({ id: "mlShowCount", label: "Count", checked: true })}
        ${CheckboxToggle({ id: "mlShowNeighbor", label: "Neighbour data ring", wide: true })}
      </div>
      <div class="ml-results-metrics">
        ${ML_MODEL_METRICS.map(MlModelMetric).join("\n")}
      </div>`,
  });
}

function MlModelMetric({ title, metrics }) {
  return `<div class="ml-results-model"><strong>${title}</strong><span>${metrics}</span></div>`;
}
