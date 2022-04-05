// 1. UNKNOWN LOGIC OF WORLD CREATION.
const createWorld = async () => {
  //...
};

// 2. GOD`S THOUGHTS
const GodSThoughts = {
  lifetimeRange: {minYears: 1, maxYears: 9999999999},
  simulationsCount: 10,
  getPlannedSimulations: function () {
    const {
      lifetimeRange: {minYears, maxYears},
      simulationsCount,
    } = this;
    const simulations = new Array(simulationsCount).fill(null);
    const setInitialSimulationInfo = () => ({
      lifetime: Math.random() * (maxYears - minYears) + minYears,
      ...this,
    });
    return simulations.map(setInitialSimulationInfo);
  },
  turnOffSimulation: async function () {},
  analyze: async function () {},
  //...
};

// 3. DOES THAT MAKE SENSE?
const startNewSimulations = async ArchitectSThoughts => {
  const plannedSimulations = ArchitectSThoughts.getPlannedSimulations();
  await plannedSimulations.map(runSimulation);
};
const simulationsInfo = await startNewSimulations(GodSThoughts);

// 4. HOW THE SIMULATIONS WORKS.
async function runSimulation(GodSHiddenThoughts) {
  const statistics = {currentSimulation: null, generatedChildSimulations: null};

  const currentWorld = await createWorld();
  const generatedPresets = await currentWorld.initialize(GodSHiddenThoughts);
  const entities = await currentWorld.bigBang(generatedPresets);
  const output = await currentWorld.toDevelopCivilization(entities);
  statistics.currentSimulation = output;

  if (output.populationIsBroken) {
    const selectedDestroyMethod =
      output.destroyTheWorld || GodSHiddenThoughts.turnOffSimulation;
    selectedDestroyMethod(currentWorld);
  } else {
    const coppiedGodSThoughts = JSON.parse(JSON.stringify(GodSHiddenThoughts));
    const thoughtsOfTheNewGod = output.rethinking(coppiedGodSThoughts);
    const childSimulationsInfo = await startNewSimulations(thoughtsOfTheNewGod);
    statistics.generatedChildSimulations = childSimulationsInfo;
  }
  return statistics;
}