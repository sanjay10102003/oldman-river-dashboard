/**
 * Reusable UI building blocks.
 *
 * Each component is a function that returns an HTML string. Components are
 * composed into sections (see components/sidebar/ and components/map/) and
 * rendered once by core/render-app.js before the rest of the app starts.
 */

function escapeAttribute(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Renders an attribute list. `true` renders a bare attribute (e.g. `disabled`),
 * `false`, `null` and `undefined` are skipped.
 */
function renderAttributes(attributes) {
  return Object.entries(attributes)
    .filter(
      ([, value]) => value !== false && value !== null && value !== undefined,
    )
    .map(([name, value]) =>
      value === true ? ` ${name}` : ` ${name}="${escapeAttribute(value)}"`,
    )
    .join("");
}

const HIDDEN_STYLE = "display: none";

function Card({ id, title, className = "", hidden = false, children = "" }) {
  return `
    <div${renderAttributes({
      class: className ? `card ${className}` : "card",
      id,
      style: hidden ? HIDDEN_STYLE : null,
    })}>
      ${CardTitle(title)}
      ${children}
    </div>`;
}

function CardTitle(text) {
  return `<div class="card-title">${text}</div>`;
}

function FieldLabel({ forId, text }) {
  return `<label class="field-label" for="${forId}">${text}</label>`;
}

/** options: [{ value, label, selected? }] */
function SelectInput({ id, options }) {
  const optionHtml = options
    .map(
      ({ value, label, selected }) =>
        `<option${renderAttributes({ value: String(value), selected: Boolean(selected) })}>${label}</option>`,
    )
    .join("\n");

  return `
    <select id="${id}">
      ${optionHtml}
    </select>`;
}

/** A label followed by its select. */
function SelectField({ id, label, options }) {
  return `
    ${FieldLabel({ forId: id, text: label })}
    ${SelectInput({ id, options })}`;
}

/** variant: primary | dark | danger | light */
function ActionButton({
  id,
  label,
  variant = "primary",
  type = null,
  disabled = false,
  hidden = false,
}) {
  return `
    <button${renderAttributes({
      class: `btn btn-${variant}`,
      id,
      type,
      disabled,
      style: hidden ? HIDDEN_STYLE : null,
    })}>${label}</button>`;
}

function HelpText({ id = null, text }) {
  return `<div${renderAttributes({ class: "help-text", id })}>${text}</div>`;
}

/** Summary card tile. */
function StatTile({ labelId, label, valueId, value }) {
  return `
    <div class="stat">
      <span class="stat-label" id="${labelId}">${label}</span>
      <span class="stat-value" id="${valueId}">${value}</span>
    </div>`;
}

/** Fish statistics tile. `wide` spans both grid columns. */
function FishStatTile({ label, valueId, value, wide = false }) {
  return `
    <div${renderAttributes({
      class: "fish-stat-box",
      style: wide ? "grid-column: 1 / -1" : null,
    })}>
      <span class="fish-stat-label">${label}</span>
      <span class="fish-stat-value" id="${valueId}">${value}</span>
    </div>`;
}

/** ML results checkbox. `wide` spans both grid columns. */
function CheckboxToggle({ id, label, checked = false, wide = false }) {
  return `<label${renderAttributes({
    class: "ml-results-toggle",
    style: wide ? "grid-column: 1/-1" : null,
  })}><input${renderAttributes({ id, type: "checkbox", checked })} /> ${label}</label>`;
}

/** A data source entry; renders a link when `href` is given. */
function SourceItem({ name, purpose, href }) {
  const content = `
      <span class="source-name">${name}</span>
      <span class="source-purpose">${purpose}</span>`;

  if (!href) {
    return `<div class="source-item">${content}
    </div>`;
  }

  return `<a class="source-item" href="${escapeAttribute(href)}" target="_blank" rel="noopener noreferrer">${content}
    </a>`;
}

/** Chevron icon used by the panel toggle buttons. */
function ChevronIcon(pathData) {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="${pathData}"
        fill="none"
        stroke="currentColor"
        stroke-width="2.2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>`;
}

/** Month options, optionally preceded by an "all" option. */
function monthOptions(allOption = null) {
  const months = MONTH_NAMES.map((name, index) => ({
    value: String(index + 1),
    label: name,
  }));
  return allOption ? [allOption, ...months] : months;
}

/** Year options, optionally preceded by an "all" option. */
function yearOptions(allOption = null) {
  const years = AVAILABLE_YEARS.map((year) => ({
    value: String(year),
    label: String(year),
  }));
  return allOption ? [allOption, ...years] : years;
}
