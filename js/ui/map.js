/* Renders the mock property map as an SVG and wires the analytical layer
   controls (Satellite / Zoning / Flood / Environmental / Infrastructure /
   Development). The subject parcel outline stays visible on every layer. */

window.ParcelaMap = (function () {
  const LAYERS = ["satellite", "zoning", "flood", "environmental", "infrastructure", "development"];

  function svgEl(tag, attrs) {
    const ns = "http://www.w3.org/2000/svg";
    const el = document.createElementNS(ns, tag);
    Object.entries(attrs || {}).forEach(([k, v]) => el.setAttribute(k, v));
    return el;
  }

  function buildSvg(map) {
    const svg = svgEl("svg", { viewBox: map.viewBox, "aria-hidden": "true" });

    // base texture (mock satellite/aerial read)
    const base = svgEl("g", { class: "layer-base" });
    map.context.forEach((c, i) => {
      base.appendChild(
        svgEl("polygon", {
          points: c.points,
          fill: i % 2 === 0 ? "var(--map-base-block)" : "var(--map-parcel)",
          opacity: "0.55",
        })
      );
    });
    svg.appendChild(base);

    // roads
    const roads = svgEl("g", { class: "layer-roads" });
    map.roads.forEach((r) => {
      const pts = r.points.split(" ").map((p) => p.split(",").map(Number));
      roads.appendChild(
        svgEl("line", {
          x1: pts[0][0], y1: pts[0][1], x2: pts[1][0], y2: pts[1][1],
          stroke: "var(--map-road)", "stroke-width": r.width, "stroke-linecap": "round",
        })
      );
    });
    svg.appendChild(roads);

    // zoning overlay
    const zoning = svgEl("g", { class: "layer-overlay layer-zoning", "data-layer": "zoning" });
    zoning.appendChild(svgEl("polygon", { points: map.zoning.points, fill: "var(--map-zoning-r)", stroke: "#3f8557", "stroke-width": "1", "stroke-dasharray": "3 3" }));
    svg.appendChild(zoning);

    // flood overlay
    const flood = svgEl("g", { class: "layer-overlay layer-flood", "data-layer": "flood" });
    flood.appendChild(svgEl("polygon", { points: map.flood.points, fill: "var(--map-flood-ae)", stroke: "#3b5caa", "stroke-width": "1.4" }));
    svg.appendChild(flood);

    // environmental overlay
    const envt = svgEl("g", { class: "layer-overlay layer-environmental", "data-layer": "environmental" });
    envt.appendChild(svgEl("polygon", { points: map.environmental.points, fill: "rgba(122,92,170,0.18)", stroke: "#7a5caa", "stroke-width": "1", "stroke-dasharray": "1 4", "stroke-linecap": "round" }));
    svg.appendChild(envt);

    // infrastructure overlay
    const infra = svgEl("g", { class: "layer-overlay layer-infrastructure", "data-layer": "infrastructure" });
    map.infrastructure.forEach((line) => {
      const pts = line.points.split(" ").map((p) => p.split(",").map(Number));
      infra.appendChild(
        svgEl("line", {
          x1: pts[0][0], y1: pts[0][1], x2: pts[1][0], y2: pts[1][1],
          stroke: "var(--map-infra-line)",
          "stroke-width": line.type === "water" ? 2.5 : 1.6,
          "stroke-dasharray": line.type === "electric" ? "6 4" : "none",
          opacity: "0.85",
        })
      );
    });
    svg.appendChild(infra);

    // development overlay
    const dev = svgEl("g", { class: "layer-overlay layer-development", "data-layer": "development" });
    map.development.forEach((d) => {
      dev.appendChild(svgEl("circle", { cx: d.x, cy: d.y, r: 5, fill: "var(--map-dev-marker)" }));
      dev.appendChild(svgEl("circle", { cx: d.x, cy: d.y, r: 9, fill: "none", stroke: "var(--map-dev-marker)", "stroke-width": 1, opacity: 0.4 }));
      const label = svgEl("text", { x: d.x + 12, y: d.y + 4, class: "mono", "font-size": "11", fill: "var(--ink)" });
      label.textContent = d.year;
      dev.appendChild(label);
    });
    svg.appendChild(dev);

    // subject parcel — always on top, always visible
    const parcelGroup = svgEl("g", { class: "layer-parcel" });
    parcelGroup.appendChild(
      svgEl("polygon", {
        points: map.parcel.points,
        fill: "rgba(20,22,26,0.06)",
        stroke: "var(--map-selected)",
        "stroke-width": "2.2",
        "stroke-dasharray": "0",
      })
    );
    svg.appendChild(parcelGroup);

    return svg;
  }

  function legends(I, zoningCode) {
    return {
      satellite: { titleKey: "map_legendTitle_satellite", rows: [{ labelKey: "map_subjectParcel", color: "var(--map-selected)" }] },
      zoning: { titleKey: "map_legendTitle_zoning", rows: [{ label: `${zoningCode} · Residencial General`, color: "#3f8557" }, { labelKey: "map_subjectParcel", color: "var(--map-selected)" }] },
      flood: { titleKey: "map_legendTitle_flood", rows: [{ labelKey: "map_zoneAE", color: "#3b5caa" }, { labelKey: "map_subjectParcel", color: "var(--map-selected)" }] },
      environmental: { titleKey: "map_legendTitle_environmental", rows: [{ labelKey: "map_coastalBuffer", color: "#7a5caa" }, { labelKey: "map_subjectParcel", color: "var(--map-selected)" }] },
      infrastructure: { titleKey: "map_legendTitle_infrastructure", rows: [{ labelKey: "map_waterMain", color: "var(--map-infra-line)" }, { labelKey: "map_electricDistribution", color: "var(--map-infra-line)" }] },
      development: { titleKey: "map_legendTitle_development", rows: [{ labelKey: "map_permitActivity", color: "var(--map-dev-marker)" }] },
    };
  }

  function mount(container, map) {
    const I = window.ParcelaI18N;
    const svg = buildSvg(map);
    container.querySelector(".map-svg-slot").appendChild(svg);
    const legendEl = container.querySelector(".map-legend");
    const controls = container.querySelectorAll(".map-control");
    const LEGENDS = legends(I, map.zoning.code);

    function setLayer(layer) {
      LAYERS.forEach((l) => {
        const g = svg.querySelector(`[data-layer="${l}"]`);
        if (g) g.style.display = l === layer ? "block" : "none";
      });
      controls.forEach((btn) => btn.classList.toggle("is-active", btn.dataset.layer === layer));
      const legend = LEGENDS[layer];
      legendEl.innerHTML =
        `<div class="legend-title">${I.t(legend.titleKey)}</div>` +
        legend.rows.map((r) => `<div class="legend-row"><span class="swatch" style="background:${r.color}"></span>${r.label || I.t(r.labelKey)}</div>`).join("");
      container.dispatchEvent(new CustomEvent("parcela:layer-change", { detail: { layer } }));
    }

    controls.forEach((btn) => btn.addEventListener("click", () => setLayer(btn.dataset.layer)));
    setLayer("satellite");
  }

  return { mount };
})();
