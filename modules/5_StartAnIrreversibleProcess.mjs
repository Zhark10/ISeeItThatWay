import {GodSThoughts} from './2_GodSThoughts.mjs'
import {startNewSimulations} from './3_StartNewSimulations.mjs'

// 5. DOES THAT MAKE SENSE?
(async () => {
  const simulationsInfo = await startNewSimulations(GodSThoughts);
  const result = await GodSThoughts.analyze(simulationsInfo);
  // const mainAnswer = result.getAnswer('WHERE I AM?');
  const formattedResult = JSON.stringify(result, null, 2)
  console.log(result);
  window.document.write(formattedResult);
})()
