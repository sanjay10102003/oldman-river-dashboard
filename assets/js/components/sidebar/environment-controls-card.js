/**
 * Environment controls: data type, variable, and either the daily date
 * picker or the historical year / month picker.
 */

function EnvironmentControlsCard() {
  return Card({
    id: "liveWeatherControlCard",
    title: "Environment Controls",
    children: `
      ${SelectField({
        id: "environmentMode",
        label: "Data Type",
        options: ENVIRONMENT_MODE_OPTIONS,
      })}
      ${SelectField({
        id: "environmentVariable",
        label: "Variable",
        options: ENVIRONMENT_VARIABLE_OPTIONS,
      })}
      ${DailyEnvironmentControls()}
      ${HistoricalEnvironmentControls()}`,
  });
}

function DailyEnvironmentControls() {
  return `
    <div id="liveEnvironmentControls">
      ${FieldLabel({ forId: "liveWeatherDate", text: "Date" })}
      <input
        id="liveWeatherDate"
        type="date"
        aria-describedby="liveWeatherDateHelp"
      />
      ${ActionButton({ id: "applyLiveTimeBtn", label: "Apply Date", variant: "primary", type: "button" })}
      ${ActionButton({ id: "useCurrentTimeBtn", label: "Use Today", variant: "light", type: "button" })}
      <div class="date-filter-badge" id="liveWeatherPeriodBadge">Daily environment</div>
      ${HelpText({
        id: "liveWeatherDateHelp",
        text: "Select a date from the previous five years up to today. A single daily value is calculated for the selected environmental variable.",
      })}
    </div>`;
}

function HistoricalEnvironmentControls() {
  return `
    <div id="historicalEnvironmentControls" style="${HIDDEN_STYLE}">
      ${SelectField({ id: "historyYear", label: "Year", options: yearOptions() })}
      ${SelectField({
        id: "historyMonth",
        label: "Month",
        options: monthOptions({ value: "", label: "All Months (Year Only)" }),
      })}
      ${HelpText({
        text: "Select All Months for a year-only view. Temperature, wind, humidity, and pressure are shown as annual averages; precipitation is shown as the annual total. Monthly ERA5-Land values cover 2020 to 2025.",
      })}
    </div>`;
}
