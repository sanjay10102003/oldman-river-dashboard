/**
 * River network display mode.
 */

function RiverControlsCard() {
  return Card({
    id: "riverControlCard",
    title: "River Network Controls",
    children: SelectField({
      id: "riverDisplayMode",
      label: "Display",
      options: RIVER_DISPLAY_OPTIONS,
    }),
  });
}
