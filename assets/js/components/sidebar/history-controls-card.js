/**
 * Hidden historical-environment card.
 *
 * It is never shown, but the app reads its "historyVariable" select to keep
 * the historical variable in sync with the Environment controls. Its year and
 * month selects repeat ids used in EnvironmentControlsCard; the app always
 * uses the first (visible) ones. Keep this card until that logic is reworked.
 */

function HistoryControlsCard() {
  return Card({
    id: "historyControlCard",
    title: "Historical Environment",
    hidden: true,
    children: `
      ${SelectField({ id: "historyYear", label: "Year", options: yearOptions() })}
      ${SelectField({ id: "historyMonth", label: "Month", options: monthOptions() })}
      ${SelectField({
        id: "historyVariable",
        label: "Variable",
        options: HISTORY_VARIABLE_OPTIONS,
      })}
      ${HelpText({
        text: "Monthly ERA5-Land values from 2020 to 2025 are applied directly to the Alberta river network. Select a period and variable, then click a coloured river segment to view its value.",
      })}`,
  });
}
