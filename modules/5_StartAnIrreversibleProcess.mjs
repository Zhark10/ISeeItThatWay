import {GodSThoughts} from './2_GodSThoughts.mjs'
import {startNewSimulations} from './3_StartNewSimulations.mjs'
import {renderSimulationForest} from './render/SimulationTree.mjs'

// 5. DOES THAT MAKE SENSE?
(async () => {
  const simulationsInfo = await startNewSimulations(GodSThoughts);
  const result = await GodSThoughts.analyze(simulationsInfo);
  // const mainAnswer = result.getAnswer('WHERE I AM?');
  console.log(result);

  renderSimulationForest(result, document.getElementById('app'));
})()
