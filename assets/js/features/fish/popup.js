/**
 * Fish observation popup and map click handling.
 */

function formatFwmisDate(value) {
  if (value === null || value === undefined || value === "") {
    return "N/A";
  }

  if (typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? "N/A"
      : date.toISOString().slice(0, 10);
  }

  const text = String(value).trim();
  const numericValue = Number(text);

  if (Number.isFinite(numericValue) && numericValue > 1000000000) {
    const date = new Date(numericValue);
    return Number.isNaN(date.getTime())
      ? text
      : date.toISOString().slice(0, 10);
  }

  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? text : date.toISOString().slice(0, 10);
}

function getFishFeatureCoordinates(feature, fallbackLngLat) {
  const coords = feature?.geometry?.coordinates;
  if (
    Array.isArray(coords) &&
    coords.length >= 2 &&
    Number.isFinite(Number(coords[0])) &&
    Number.isFinite(Number(coords[1]))
  ) {
    return [Number(coords[0]), Number(coords[1])];
  }

  return [fallbackLngLat.lng, fallbackLngLat.lat];
}

function getFishFeaturesAtSameLocation(event) {
  const clickedFeature = event.features?.[0];
  if (!clickedFeature) return [];

  const [clickedLng, clickedLat] = getFishFeatureCoordinates(
    clickedFeature,
    event.lngLat,
  );

  // Query both rendered fish layers so stacked circles and × markers
  // at the same location can be browsed with popup navigation.
  const tolerance = 0.000001;
  const padding = 7;
  const point = event.point;
  const availableFishLayers = FISH_LAYER_IDS.filter((layerId) =>
    Boolean(map.getLayer(layerId)),
  );

  const nearbyFeatures = map.queryRenderedFeatures(
    [
      [point.x - padding, point.y - padding],
      [point.x + padding, point.y + padding],
    ],
    { layers: availableFishLayers },
  );

  const sameLocation = nearbyFeatures.filter((feature) => {
    const [lng, lat] = getFishFeatureCoordinates(feature, event.lngLat);
    return (
      Math.abs(lng - clickedLng) <= tolerance &&
      Math.abs(lat - clickedLat) <= tolerance
    );
  });

  const unique = [];
  const seen = new Set();

  sameLocation.forEach((feature, index) => {
    const props = feature.properties || {};
    const [lng, lat] = getFishFeatureCoordinates(feature, event.lngLat);
    const key = [
      props.INV_SURVEY_ID ?? "",
      props.INV_PROJ_ID ?? "",
      props[FISH_SPECIES_CODE_FIELD] ?? "",
      props[FISH_SPECIES_FIELD] ?? "",
      props[FISH_DATE_FIELD] ?? "",
      props[FISH_COUNT_FIELD] ?? "",
      props[FISH_RECORD_TYPE_FIELD] ?? "",
      lng.toFixed(7),
      lat.toFixed(7),
      index,
    ].join("|");

    if (!seen.has(key)) {
      seen.add(key);
      unique.push(feature);
    }
  });

  return unique.length ? unique : [clickedFeature];
}

function buildFishPopupHtml(feature, coordinates, currentIndex, total) {
  const properties = feature.properties || {};
  const isNoFishSurvey = Number(properties[FISH_RECORD_TYPE_FIELD] || 0) === 1;
  const speciesId = Number(properties[FISH_SPECIES_FIELD] || 0);
  const species = isNoFishSurvey
    ? "No fish captured"
    : fishSpeciesNameById.get(speciesId) || "Unknown fish";

  const speciesInfo = fishSpeciesLookupById?.get?.(speciesId) || null;
  const speciesCode = isNoFishSurvey
    ? "N/A"
    : speciesInfo?.code || "Not recorded";

  const year = Number(properties[FISH_YEAR_FIELD] || 0);
  const month = Number(properties[FISH_MONTH_FIELD] || 0);
  const monthName =
    month >= 1 && month <= 12
      ? new Date(2000, month - 1, 1).toLocaleString("en", {
          month: "long",
        })
      : "N/A";
  const surveyDate = year && month ? `${monthName} ${year}` : year || "N/A";

  const surveyId = properties.i ?? "Not recorded";
  const countValue = Number(properties[FISH_COUNT_FIELD] || 0);
  const speciesCount = countValue.toLocaleString();

  const eyebrow = isNoFishSurvey
    ? "FWMIS no-fish survey"
    : "FWMIS fish observation";

  const countLabel = isNoFishSurvey ? "Survey result" : "Individuals recorded";

  const countText = isNoFishSurvey ? "No fish captured" : speciesCount;

  const navigation =
    total > 1
      ? `
                <div class="fish-popup-nav" aria-label="Observation navigation">
                  <button
                    type="button"
                    class="fish-popup-nav-button fish-popup-prev"
                    aria-label="Previous observation"
                    title="Previous observation"
                  >&#8249;</button>
                  <span class="fish-popup-nav-counter">${currentIndex + 1} / ${total}</span>
                  <button
                    type="button"
                    class="fish-popup-nav-button fish-popup-next"
                    aria-label="Next observation"
                    title="Next observation"
                  >&#8250;</button>
                </div>
              `
      : "";

  return `
          <article class="fish-popup-card">
            <header class="fish-popup-header">
              <div class="fish-popup-eyebrow">${escapeHtml(eyebrow)}</div>
              <h3 class="fish-popup-title">${escapeHtml(species)}</h3>
              ${navigation}
            </header>

            <div class="fish-popup-body">
              <section class="fish-popup-section">
                <h4 class="fish-popup-section-title">Observation details</h4>
                <div class="fish-popup-grid">
                  <div class="fish-popup-label">Species code</div>
                  <div class="fish-popup-value">${escapeHtml(speciesCode)}</div>

                  <div class="fish-popup-label">Survey period</div>
                  <div class="fish-popup-value">${escapeHtml(surveyDate)}</div>

                  <div class="fish-popup-label">${escapeHtml(countLabel)}</div>
                  <div class="fish-popup-value">${escapeHtml(countText)}</div>

                  <div class="fish-popup-label">Record type</div>
                  <div class="fish-popup-value">${escapeHtml(
                    isNoFishSurvey ? "NO_FISH" : "FISH_CAPTURE",
                  )}</div>

                  <div class="fish-popup-label">Survey ID</div>
                  <div class="fish-popup-value">${escapeHtml(surveyId)}</div>
                </div>
              </section>

              <section class="fish-popup-section">
                <h4 class="fish-popup-section-title">Coordinates</h4>
                <div class="fish-popup-coordinates">
                  <div class="fish-popup-coordinate">
                    <span class="fish-popup-coordinate-label">Latitude</span>
                    <span class="fish-popup-coordinate-value">${coordinates[1].toFixed(5)}</span>
                  </div>

                  <div class="fish-popup-coordinate">
                    <span class="fish-popup-coordinate-label">Longitude</span>
                    <span class="fish-popup-coordinate-value">${coordinates[0].toFixed(5)}</span>
                  </div>
                </div>
              </section>
            </div>
          </article>
        `;
}

function addFishInteractions() {
  if (fishInteractionsAdded) return;
  fishInteractionsAdded = true;

  const showFishPopup = (event) => {
    if (!isFishSelected() || !event.features?.length) return;

    const fishFeatures = getFishFeaturesAtSameLocation(event);
    const popupCoordinates = getFishFeatureCoordinates(
      fishFeatures[0],
      event.lngLat,
    );
    let currentIndex = 0;

    if (activePopup) activePopup.remove();

    activePopup = new maplibregl.Popup({
      className: "fish-popup",
      maxWidth: "420px",
      closeButton: true,
      closeOnClick: true,
      offset: 14,
    })
      .setLngLat(popupCoordinates)
      .addTo(map);

    const renderObservation = () => {
      activePopup.setHTML(
        buildFishPopupHtml(
          fishFeatures[currentIndex],
          popupCoordinates,
          currentIndex,
          fishFeatures.length,
        ),
      );

      if (fishFeatures.length <= 1) return;

      const popupElement = activePopup.getElement();
      const previousButton = popupElement.querySelector(".fish-popup-prev");
      const nextButton = popupElement.querySelector(".fish-popup-next");

      previousButton?.addEventListener("click", (clickEvent) => {
        clickEvent.stopPropagation();
        currentIndex =
          (currentIndex - 1 + fishFeatures.length) % fishFeatures.length;
        renderObservation();
      });

      nextButton?.addEventListener("click", (clickEvent) => {
        clickEvent.stopPropagation();
        currentIndex = (currentIndex + 1) % fishFeatures.length;
        renderObservation();
      });
    };

    renderObservation();
  };

  FISH_LAYER_IDS.forEach((layerId) => {
    map.on("click", layerId, showFishPopup);

    map.on("mouseenter", layerId, () => {
      if (!isSelectionMode) {
        map.getCanvas().style.cursor = "pointer";
      }
    });

    map.on("mouseleave", layerId, () => {
      if (!isSelectionMode) {
        map.getCanvas().style.cursor = "";
      }
    });
  });
}
