// ISOLATED RENDERER: turns the statistics tree produced by the simulation
// (currentSimulation / generatedChildSimulations) into a compact DOM tree.
// Knows nothing about how a world runs or how a selected simulation gets
// displayed in detail — it only reads the finished output and reports which
// node was clicked via onSelect.

const formatSize = n => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
};

const renderNode = (simulationStat, onSelect, state) => {
  const { currentSimulation, generatedChildSimulations } = simulationStat;
  const { population, populationIsBroken } = currentSimulation;

  const li = document.createElement("li");

  const chip = document.createElement("button");
  chip.type = "button";
  chip.className = `node ${populationIsBroken ? "is-broken" : "is-alive"}`;
  chip.innerHTML = `
    <span class="node-dot" style="background:${populationIsBroken ? "var(--broken)" : "var(--alive)"}"></span>
    <span class="node-title">№${population.id}</span>
    <span class="node-size">${formatSize(population.size)}</span>
  `;
  chip.addEventListener("click", () => {
    if (state.selectedEl) state.selectedEl.classList.remove("is-selected");
    chip.classList.add("is-selected");
    state.selectedEl = chip;
    onSelect(currentSimulation);
  });

  if (state.autoSelect) {
    state.autoSelect = false;
    state.selectedEl = chip;
    chip.classList.add("is-selected");
    onSelect(currentSimulation);
  }

  li.appendChild(chip);

  if (Array.isArray(generatedChildSimulations) && generatedChildSimulations.length > 0) {
    const ul = document.createElement("ul");
    generatedChildSimulations.forEach(child => ul.appendChild(renderNode(child, onSelect, state)));
    li.appendChild(ul);
  }

  return li;
};

export const renderSimulationForest = (simulationsInfo, container, onSelect) => {
  container.innerHTML = "";

  const forest = document.createElement("div");
  forest.className = "forest";

  const root = document.createElement("div");
  root.className = "forest-root";
  root.textContent = "Первая мысль Архитектора";
  forest.appendChild(root);

  const tree = document.createElement("ul");
  tree.className = "tree";
  const state = { selectedEl: null, autoSelect: true };
  simulationsInfo.forEach(sim => tree.appendChild(renderNode(sim, onSelect, state)));
  forest.appendChild(tree);

  container.appendChild(forest);
};
