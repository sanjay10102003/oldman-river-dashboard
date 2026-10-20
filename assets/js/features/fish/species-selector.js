/**
 * Searchable fish species picker.
 */

async function loadFishSpecies() {
  if (fishSpeciesLoaded) return;

  try {
    const [speciesResponse] = await Promise.all([
      fetch(FISH_SPECIES_PATH),
      loadFishStatisticsFile(),
    ]);

    if (!speciesResponse.ok) {
      throw new Error(
        `Could not load fish species list: ${speciesResponse.status}`,
      );
    }

    const speciesPayload = await speciesResponse.json();

    // The optimized builder writes a compact species lookup JSON.
    // Support either {"1":"ARCTIC CHAR", ...}, an array of names,
    // or an array of objects so the dashboard remains tolerant of
    // small builder-format changes.
    let speciesValues = [];
    fishSpeciesIdByName = new Map();
    fishSpeciesNameById = new Map();

    if (Array.isArray(speciesPayload)) {
      speciesPayload.forEach((item, index) => {
        const name =
          typeof item === "string"
            ? item
            : (item?.name ?? item?.species ?? item?.COMMON_NM ?? "");
        const id = Number(item?.id ?? index + 1);
        if (name) {
          speciesValues.push(name);
          fishSpeciesIdByName.set(String(name).trim(), id);
          fishSpeciesNameById.set(id, String(name).trim());
          fishSpeciesLookupById.set(id, {
            name: String(name).trim(),
            code: typeof item === "object" ? (item?.code ?? null) : null,
          });
        }
      });
    } else if (speciesPayload && typeof speciesPayload === "object") {
      Object.entries(speciesPayload).forEach(([key, item]) => {
        const name =
          typeof item === "string"
            ? item
            : (item?.name ?? item?.species ?? item?.COMMON_NM ?? "");
        const id = Number(key);
        if (name && Number.isFinite(id)) {
          speciesValues.push(name);
          fishSpeciesIdByName.set(String(name).trim(), id);
          fishSpeciesNameById.set(id, String(name).trim());
          fishSpeciesLookupById.set(id, {
            name: String(name).trim(),
            code: typeof item === "object" ? (item?.code ?? null) : null,
          });
        }
      });
    }

    fishSpeciesNames = [
      ...new Set(
        speciesValues.map((name) => String(name || "").trim()).filter(Boolean),
      ),
    ].sort((a, b) => a.localeCompare(b));

    buildFishSpeciesColorLookup();

    fishSpeciesLoaded = true;

    renderFishSpeciesOptions("");

    if (isFishSelected()) {
      updateFishSpeciesColors();
      updateFishFilter();
      updateLegend();
      updatePointCounter();
    }
  } catch (error) {
    console.error(error);
    status.textContent =
      "The optimized FWMIS species lookup could not be loaded. Check data/fish/fwmis_fish_species.json.";
  }
}

function openFishSpeciesMenu() {
  fishSpeciesMenu.classList.add("open");
  fishSpeciesInput.setAttribute("aria-expanded", "true");
}

function closeFishSpeciesMenu() {
  fishSpeciesMenu.classList.remove("open");
  fishSpeciesInput.setAttribute("aria-expanded", "false");
}

function selectFishSpecies(speciesName) {
  selectedFishSpecies = speciesName;
  fishSpeciesInput.value = speciesName || "All species";
  closeFishSpeciesMenu();

  updateFishFilter();
  updateLegend();

  status.textContent = getFishFilterStatusText();
}

function renderFishSpeciesOptions(searchText) {
  const query = String(searchText || "")
    .trim()
    .toLowerCase();

  fishSpeciesMenu.innerHTML = "";

  function addSpeciesOption(speciesName) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "searchable-select-option";
    button.textContent = speciesName;
    button.addEventListener("click", () => selectFishSpecies(speciesName));
    fishSpeciesMenu.appendChild(button);
  }

  // With no search text, show All species followed by the complete list.
  if (!query) {
    const allButton = document.createElement("button");
    allButton.type = "button";
    allButton.className = "searchable-select-option";
    allButton.textContent = "All species";
    allButton.addEventListener("click", () => selectFishSpecies(""));
    fishSpeciesMenu.appendChild(allButton);

    fishSpeciesNames.forEach(addSpeciesOption);
    return;
  }

  // Put matching species first.
  const matchingSpecies = fishSpeciesNames.filter((speciesName) =>
    speciesName.toLowerCase().includes(query),
  );

  // Keep every other species underneath the matches.
  const otherSpecies = fishSpeciesNames.filter(
    (speciesName) => !speciesName.toLowerCase().includes(query),
  );

  if (matchingSpecies.length === 0) {
    const empty = document.createElement("div");
    empty.className = "searchable-select-empty";
    empty.textContent = "No exact matching species. Showing all species below.";
    fishSpeciesMenu.appendChild(empty);
  }

  matchingSpecies.forEach(addSpeciesOption);
  otherSpecies.forEach(addSpeciesOption);
}

function bindFishSpeciesSelector() {
  fishSpeciesInput.addEventListener("focus", () => {
    fishSpeciesInput.select();
    renderFishSpeciesOptions("");
    openFishSpeciesMenu();
  });

  fishSpeciesInput.addEventListener("input", (event) => {
    renderFishSpeciesOptions(event.target.value);
    openFishSpeciesMenu();
  });

  fishSpeciesInput.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeFishSpeciesMenu();
      fishSpeciesInput.value = selectedFishSpecies || "All species";
      return;
    }

    if (event.key === "Enter") {
      const firstOption = fishSpeciesMenu.querySelector(
        ".searchable-select-option",
      );

      if (firstOption) {
        event.preventDefault();
        firstOption.click();
      }
    }
  });

  fishSpeciesToggle.addEventListener("click", () => {
    if (fishSpeciesMenu.classList.contains("open")) {
      closeFishSpeciesMenu();
    } else {
      renderFishSpeciesOptions("");
      openFishSpeciesMenu();
      fishSpeciesInput.focus();
    }
  });

  document.addEventListener("click", (event) => {
    if (!fishSpeciesSelector.contains(event.target)) {
      closeFishSpeciesMenu();
      fishSpeciesInput.value = selectedFishSpecies || "All species";
    }
  });
}
