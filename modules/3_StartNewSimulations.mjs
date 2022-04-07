import {runSimulation} from './4_LogicOfSimulation.mjs'

// 3. DOES THAT MAKE SENSE?
export const startNewSimulations = async ArchitectSThoughts => {
  const plannedSimulations = ArchitectSThoughts.getPlannedSimulations();
  return Promise.all(plannedSimulations.map(runSimulation));
};