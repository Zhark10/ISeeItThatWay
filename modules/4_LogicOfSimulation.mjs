import {World} from './1_LogicOfWorldCreation.mjs'
import {startNewSimulations} from './3_StartNewSimulations.mjs'

// 4. HOW THE SIMULATIONS WORKS.
export async function runSimulation(GodSHiddenThoughts) {
  const statistics = { currentSimulation: null, generatedChildSimulations: null };

  const currentWorld = new World(GodSHiddenThoughts);
  const entities = await currentWorld.bigBang(currentWorld.generatedPresets);
  const output = await currentWorld.toDevelopCivilization(entities);
  statistics.currentSimulation = output;

  if (output.populationIsBroken) {
    const selectedDestroyMethod =
      output.destroyTheWorld || GodSHiddenThoughts.turnOffSimulation;
    selectedDestroyMethod(currentWorld);
  } else {
    const coppiedGodSThoughts = { ...GodSHiddenThoughts, isFirstGod: false };
    const thoughtsOfTheNewGod = await output.rethinking(coppiedGodSThoughts);
    if (GodSHiddenThoughts.isFirstGod) {
      const childSimulationsInfo = await startNewSimulations(thoughtsOfTheNewGod);
      statistics.generatedChildSimulations = childSimulationsInfo;
    }
  }
  return statistics;
}