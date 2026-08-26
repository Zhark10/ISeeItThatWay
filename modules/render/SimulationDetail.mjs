// ISOLATED RENDERER: the "currently selected simulation" block. Shows one
// population's organisms at full size, with every organism and how it
// behaves toward the others clearly visible. Only ever animates the single
// selected field, so switching selection swaps which field the shared
// animation loop is driving instead of piling more canvases onto it.

import { OrganismField } from "./OrganismField.mjs";
import { registerField, unregisterField, ensureLoopStarted } from "./animationLoop.mjs";

const DETAIL_WIDTH = 640;
const DETAIL_HEIGHT = 320;

const SPECIES_LABELS = {
  clusterers: "Кластеры — держатся плотной стаей",
  orbiters: "Орбитальные — кружат вокруг общего центра",
  wanderers: "Странники — каждый бредёт к своей цели",
  pulsers: "Пульсары — дышат в общем ритме",
};

const formatSize = n => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
};

const formatPercent = n => `${Math.round(n * 100)}%`;
const formatSignedPercent = n => `${n >= 0 ? "+" : ""}${(n * 100).toFixed(1)}%`;

let activeField = null;

export const showSimulationDetail = (currentSimulation, container) => {
  if (activeField) unregisterField(activeField);

  const { population, populationIsBroken } = currentSimulation;

  container.innerHTML = "";

  const panel = document.createElement("div");
  panel.className = `detail-panel ${populationIsBroken ? "is-broken" : "is-alive"}`;

  const header = document.createElement("div");
  header.className = "detail-header";
  header.innerHTML = `
    <div>
      <h2>Мир №${population.id}</h2>
      <p class="detail-species">${SPECIES_LABELS[population.species] || population.species}</p>
    </div>
    <span class="detail-badge">${populationIsBroken ? "☠ вымирает" : "✓ живёт"}</span>
  `;
  panel.appendChild(header);

  const canvasWrap = document.createElement("div");
  canvasWrap.className = "organism-wrap detail-canvas-wrap";
  const field = new OrganismField(population, populationIsBroken, {
    width: DETAIL_WIDTH,
    height: DETAIL_HEIGHT,
  });
  canvasWrap.appendChild(field.canvas);
  panel.appendChild(canvasWrap);

  const stats = document.createElement("div");
  stats.className = "detail-stats";
  stats.innerHTML = `
    <div><span>Популяция</span><strong>${formatSize(population.size)}</strong></div>
    <div><span>Рост</span><strong class="${population.growthRate >= 0 ? "positive" : "negative"}">${formatSignedPercent(population.growthRate)}</strong></div>
    <div><span>Ресурсы</span><strong>${formatPercent(population.resourceStability)}</strong></div>
    <div><span>Технологии</span><strong>${formatPercent(population.technologyLevel)}</strong></div>
    <div><span>Сплочённость</span><strong>${formatPercent(population.cohesion)}</strong></div>
    <div><span>Риск краха</span><strong class="risk">${formatPercent(population.collapseRisk)}</strong></div>
  `;
  panel.appendChild(stats);

  container.appendChild(panel);

  registerField(field);
  ensureLoopStarted();
  activeField = field;
};
