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