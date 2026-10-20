/**
 * Layer picker shown at the top of the sidebar.
 */

function LayerSelectionCard() {
  return Card({
    title: "Layer Selection",
    children: SelectInput({ id: "layerSelect", options: LAYER_OPTIONS }),
  });
}
