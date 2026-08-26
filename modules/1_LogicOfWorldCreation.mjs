import { initialPresets } from "../configs/constants.mjs"
import { Population } from "./entities/Population.mjs"

// 1. UNKNOWN LOGIC OF WORLD CREATION.
export class World {
  constructor(_GodSHiddenThoughts) {
    this.generatedPresets = {
      ...initialPresets,
    }
    this.isRunned = true
  };

  bigBang = async _generatedPresets => {
    const entities = { population: new Population() }
    return entities
  }

  toDevelopCivilization = async _entities => {
    const { population } = _entities
    const output = {
      population,
      populationIsBroken: population.rollIsBroken(),
      destroyTheWorld: null,
      rethinking: async _thoughts => _thoughts,
    }
    return output
  }
};