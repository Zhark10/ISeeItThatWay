// ISOLATED RENDERER: turns the statistics tree produced by the simulation
// (currentSimulation / generatedChildSimulations) into a DOM tree. Knows
// nothing about how a world runs — it only reads the finished output.

const formatSize = n => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
};

const formatPercent = n => `${Math.round(n * 100)}%`;

const formatSignedPercent = n => `${n >= 0 ? "+" : ""}${(n * 100).toFixed(1)}%`;

const statBar = (label, value) => `
  <div class="stat">
    <div class="stat-label"><span>${label}</span><span>${formatPercent(value)}</span></div>
    <div class="stat-track"><div class="stat-fill" style="width:${Math.round(value * 100)}%"></div></div>
  </div>
`;

const renderNode = simulationStat => {
  const { currentSimulation, generatedChildSimulations } = simulationStat;
  const { population, populationIsBroken } = currentSimulation;

  const li = document.createElement("li");

  const card = document.createElement("div");
  card.className = `node ${populationIsBroken ? "is-broken" : "is-alive"}`;
  card.innerHTML = `
    <div class="node-header">
      <span class="node-title">Мир №${population.id}</span>
      <span class="node-badge">${populationIsBroken ? "☠ разрушен" : "✓ жив"}</span>
    </div>
    <div class="node-body">
      <div class="stat-row">
        <span>Популяция</span>
        <strong>${formatSize(population.size)}</strong>
      </div>
      <div class="stat-row">
        <span>Рост</span>
        <strong class="${population.growthRate >= 0 ? "positive" : "negative"}">${formatSignedPercent(population.growthRate)}</strong>
      </div>
      ${statBar("Ресурсы", population.resourceStability)}
      ${statBar("Технологии", population.technologyLevel)}
      ${statBar("Сплочённость", population.cohesion)}
      <div class="stat-row risk">
        <span>Риск краха</span>
        <strong>${formatPercent(population.collapseRisk)}</strong>
      </div>
    </div>
  `;
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
};
