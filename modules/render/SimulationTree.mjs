// ISOLATED RENDERER: turns the statistics tree produced by the simulation
// (currentSimulation / generatedChildSimulations) into a DOM tree. Knows
// nothing about how a world runs — it only reads the finished output and
// hands each population off to OrganismField for the actual visual.

import { OrganismField } from "./OrganismField.mjs";
import { registerField, ensureLoopStarted } from "./animationLoop.mjs";

const formatSize = n => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
};

const renderNode = simulationStat => {
  const { currentSimulation, generatedChildSimulations } = simulationStat;
  const { population, populationIsBroken } = currentSimulation;

  const li = document.createElement("li");

  const card = document.createElement("div");
  card.className = `node ${populationIsBroken ? "is-broken" : "is-alive"}`;

  const header = document.createElement("div");
  header.className = "node-header";
  header.innerHTML = `
    <span class="node-title">Мир №${population.id}</span>
    <span class="node-badge">${populationIsBroken ? "☠ вымирает" : "✓ живёт"}</span>
  `;
  card.appendChild(header);

  const canvasWrap = document.createElement("div");
  canvasWrap.className = "organism-wrap";
  const field = new OrganismField(population, populationIsBroken);
  canvasWrap.appendChild(field.canvas);
  registerField(field);
  card.appendChild(canvasWrap);

  const footer = document.createElement("div");
  footer.className = "node-footer";
  footer.innerHTML = `<span>${formatSize(population.size)} особей</span>`;
  card.appendChild(footer);

  li.appendChild(card);

  if (Array.isArray(generatedChildSimulations) && generatedChildSimulations.length > 0) {
    const ul = document.createElement("ul");
    generatedChildSimulations.forEach(child => ul.appendChild(renderNode(child)));
    li.appendChild(ul);
  }

  return li;
};

export const renderSimulationForest = (simulationsInfo, container) => {
  container.innerHTML = "";

  const forest = document.createElement("div");
  forest.className = "forest";

  const root = document.createElement("div");
  root.className = "forest-root";
  root.textContent = "Первая мысль Архитектора";
  forest.appendChild(root);

  const tree = document.createElement("ul");
  tree.className = "tree";
  simulationsInfo.forEach(sim => tree.appendChild(renderNode(sim)));
  forest.appendChild(tree);

  container.appendChild(forest);
  ensureLoopStarted();
};
