/**
 * Drag-a-box area selection on the map.
 */

function enableSelectionMode() {
  isSelectionMode = true;
  map.dragPan.disable();

  selectAreaBtn.style.display = "none";
  cancelSelectBtn.style.display = "block";

  status.textContent = "Selection mode active. Drag a box on the map.";
  map.getCanvas().classList.add("selecting-mode");
}

function disableSelectionMode() {
  isSelectionMode = false;
  isDraggingSelection = false;
  selectionStart = null;

  map.dragPan.enable();

  selectionBox.style.display = "none";
  selectAreaBtn.style.display = "block";
  cancelSelectBtn.style.display = "none";

  map.getCanvas().classList.remove("selecting-mode");
}

function updateSelectionBox(start, current) {
  const left = Math.min(start.x, current.x);
  const top = Math.min(start.y, current.y);
  const width = Math.abs(current.x - start.x);
  const height = Math.abs(current.y - start.y);

  selectionBox.style.left = `${left}px`;
  selectionBox.style.top = `${top}px`;
  selectionBox.style.width = `${width}px`;
  selectionBox.style.height = `${height}px`;
  selectionBox.style.display = "block";
}

function getBoundsFromPixelBox(start, end) {
  const minX = Math.min(start.x, end.x);
  const maxX = Math.max(start.x, end.x);
  const minY = Math.min(start.y, end.y);
  const maxY = Math.max(start.y, end.y);

  const sw = map.unproject([minX, maxY]);
  const ne = map.unproject([maxX, minY]);

  return {
    west: sw.lng,
    east: ne.lng,
    south: sw.lat,
    north: ne.lat,
  };
}

function bindSelectionBoxEvents() {
  map.getCanvas().addEventListener("mousedown", (e) => {
    if (!isSelectionMode || isFetching) return;

    isDraggingSelection = true;

    const rect = map.getCanvas().getBoundingClientRect();

    selectionStart = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    updateSelectionBox(selectionStart, selectionStart);
  });

  window.addEventListener("mousemove", (e) => {
    if (!isSelectionMode || !isDraggingSelection || !selectionStart) return;

    const rect = map.getCanvas().getBoundingClientRect();

    const current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    updateSelectionBox(selectionStart, current);
  });

  window.addEventListener("mouseup", async (e) => {
    if (!isSelectionMode || !isDraggingSelection || !selectionStart) return;

    const rect = map.getCanvas().getBoundingClientRect();

    const selectionEnd = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    const width = Math.abs(selectionEnd.x - selectionStart.x);
    const height = Math.abs(selectionEnd.y - selectionStart.y);

    if (width < 10 || height < 10) {
      disableSelectionMode();
      status.textContent = "Selection too small. Try dragging a larger box.";
      return;
    }

    const selectedBounds = getBoundsFromPixelBox(selectionStart, selectionEnd);

    disableSelectionMode();

    await addPointsFromBounds(selectedBounds, "the selected box");
  });
}
