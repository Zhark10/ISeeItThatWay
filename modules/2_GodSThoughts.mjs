  // 2. GOD`S THOUGHTS
  export const GodSThoughts = {
    isFirstGod: true,
    lifetimeRange: { minYears: 1, maxYears: 9999999999 },
    simulationsCount: 5,
    getPlannedSimulations: function () {
      const {
        lifetimeRange: { minYears, maxYears },
        simulationsCount,
      } = this;
      const simulations = new Array(simulationsCount).fill(null);
      const setInitialSimulationInfo = () => ({
        lifetime: Math.random() * (maxYears - minYears) + minYears,
        ...this,
      });
      return simulations.map(setInitialSimulationInfo);
    },
    turnOffSimulation: async function () { },
    analyze: async function (data) { 
      return data
    },
    //...
  };