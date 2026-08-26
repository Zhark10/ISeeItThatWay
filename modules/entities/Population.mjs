// ISOLATED ENTITY: Population.
// Represents the population of a single simulated civilization. Deliberately
// kept outside the world/simulation logic so the generation rules can change
// without touching how a world is created or run.
//
// "Quasi-random" here means values aren't a single Math.random() roll — each
// trait is the average of several uniform rolls (an Irwin-Hall approximation
// of a normal distribution), so generated populations cluster naturally
// around the middle of their range instead of spreading flat/uniformly.

const quasiRandom = (samples = 3) => {
  let sum = 0;
  for (let i = 0; i < samples; i++) sum += Math.random();
  return sum / samples;
};

const quasiRandomInRange = (min, max, samples = 3) =>
  min + quasiRandom(samples) * (max - min);

// A population's "species" isn't a cosmetic label — it's picked once at
// creation and determines how its organisms move and relate to each other
// (see OrganismField), so every world's population is behaviorally its own
// rather than a recolored copy of the same flocking rule.
export const SPECIES = ["clusterers", "orbiters", "wanderers", "pulsers"];

let nextPopulationId = 1;

export class Population {
  constructor() {
    this.id = nextPopulationId++;
    this.species = SPECIES[Math.floor(Math.random() * SPECIES.length)];
    this.size = Math.round(quasiRandomInRange(1_000, 10_000_000, 4));
    this.growthRate = quasiRandomInRange(-0.05, 0.05);
    this.resourceStability = quasiRandomInRange(0, 1);
    this.technologyLevel = quasiRandomInRange(0, 1);
    this.cohesion = quasiRandomInRange(0, 1);
    this.collapseRisk = this.computeCollapseRisk();
  }

  computeCollapseRisk = () => {
    const instability = 1 - this.resourceStability;
    const discord = 1 - this.cohesion;
    const stagnation = 1 - this.technologyLevel;
    return instability * 0.4 + discord * 0.4 + stagnation * 0.2;
  };

  rollIsBroken = () => Math.random() < this.collapseRisk;
}
