/**
 * Buttons for adding environment points to the map.
 * They start disabled and are enabled once the map has loaded.
 */

function AddDataCard() {
  return Card({
    id: "addDataCard",
    title: "Add Data",
    children: `
      ${ActionButton({ id: "addVisibleBtn", label: `Add ${POINTS_PER_ACTION} Points in Visible Area`, variant: "primary", disabled: true })}
      ${ActionButton({ id: "selectAreaBtn", label: "Select Box Area", variant: "dark", disabled: true })}
      ${ActionButton({ id: "cancelSelectBtn", label: "Cancel Selection", variant: "danger", hidden: true })}
      ${ActionButton({ id: "clearLayerBtn", label: "Clear Selected Layer", variant: "light", disabled: true })}
      ${HelpText({ text: "Click “Select Box Area,” then drag a rectangle on the map." })}`,
  });
}
