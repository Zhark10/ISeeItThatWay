import {GodSThoughts} from './2_GodSThoughts.mjs'
import {startNewSimulations} from './3_StartNewSimulations.mjs'
import {renderSimulationForest} from './render/SimulationTree.mjs'
import {showSimulationDetail} from './render/SimulationDetail.mjs'

// 5. DOES THAT MAKE SENSE?
(async () => {
  const simulationsInfo = await startNewSimulations(GodSThoughts);
  const result = await GodSThoughts.analyze(simulationsInfo);
  // const mainAnswer = result.getAnswer('WHERE I AM?');
  console.log(result);

  const detailContainer = document.getElementById('detail');
  const treeContainer = document.getElementById('tree');
  renderSimulationForest(result, treeContainer, currentSimulation =>
    showSimulationDetail(currentSimulation, detailContainer)
  );
})()
